// Initiates a Campay mobile money collection (MTN MoMo / Orange Money).
// Returns a Campay transaction `reference` the client polls for status.
function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}
import { z } from 'npm:zod@3';
// Campay environment: "live" -> www.campay.net, "demo" -> demo.campay.net
const CAMPAY_ENV = (Deno.env.get('CAMPAY_ENV') ?? 'live').toLowerCase();
const BASE_URL = CAMPAY_ENV === 'demo' ? 'https://demo.campay.net' : 'https://www.campay.net';
const BodySchema = z.object({
  amount: z.number().positive().max(1_000_000),
  // 9-digit Cameroon number starting with 6 (no country code, no spaces)
  phone: z.string().regex(/^6\d{8}$/),
  description: z.string().max(255).optional(),
  external_reference: z.string().max(255).optional(),
});
async function getToken(username: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[${res.status}] token request failed: ${body}`);
  }
  const data = await res.json();
  if (!data.token) throw new Error('Campay did not return a token');
  return data.token as string;
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }
  try {
    const username = Deno.env.get('CAMPAY_USERNAME');
    const password = Deno.env.get('CAMPAY_PASSWORD');
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Campay credentials are not configured' }),
        { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
      );
    }
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
      );
    }
    const { amount, phone, description, external_reference } = parsed.data;
    const token = await getToken(username, password);
    const collectRes = await fetch(`${BASE_URL}/api/collect/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({
        amount: String(Math.round(amount)),
        currency: 'XAF',
        from: `237${phone}`,
        description: description ?? 'Payment',
        external_reference: external_reference ?? '',
      }),
    });
    const collectBody = await collectRes.text();
    if (!collectRes.ok) {
      console.error(`Campay collect failed [${collectRes.status}]: ${collectBody}`);
      return new Response(
        JSON.stringify({ error: 'Collection request failed', status: collectRes.status, details: collectBody }),
        { status: collectRes.status, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
      );
    }
    const data = JSON.parse(collectBody);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('campay-collect error:', err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected error' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
    );
  }
});
