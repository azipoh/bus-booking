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
function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('237')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}
function generateExternalReference() {
  return `busgo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
const BodySchema = z.object({
  amount: z.number().positive().max(1_000_000),
  // Accept local Cameroon numbers like 6XXXXXXXX or E.164 numbers like 2376XXXXXXXX.
  phone: z
    .string()
    .trim()
    .refine((value) => /^6\d{8}$/.test(value) || /^\+?2376\d{8}$/.test(value), {
      message: 'Phone must be a Cameroon mobile number',
    })
    .transform((value) => normalizePhone(value)),
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
function createMockResponse(reference: string) {
  return JSON.stringify({
    reference,
    status: 'SUCCESSFUL',
    simulated: true,
    message: 'Mock Campay payment completed',
  });
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }
  try {
    const text = await req.text();
    console.log('campay-collect request body:', text);
    let parsed;
    try {
      parsed = BodySchema.safeParse(JSON.parse(text));
    } catch (e) {
      console.error('campay-collect invalid JSON body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
      );
    }
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
      );
    }

    const { amount, phone, description, external_reference } = parsed.data;
    const username = Deno.env.get('CAMPAY_USERNAME');
    const password = Deno.env.get('CAMPAY_PASSWORD');
    const hasCredentials = Boolean(username?.trim() && password?.trim());
    if (!hasCredentials) {
      const reference = (external_reference ?? '').trim() || generateExternalReference();
      return new Response(createMockResponse(reference), {
        status: 200,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }
    const token = await getToken(username, password);
    const normalizedPhone = normalizePhone(phone);
    let collectRes: Response | undefined;
    let collectBody = '';
    for (let attempt = 0; attempt < 2; attempt++) {
      const reference = (external_reference ?? '').trim() || (attempt === 0 ? generateExternalReference() : generateExternalReference());
      collectRes = await fetch(`${BASE_URL}/api/collect/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({
          amount: String(Math.round(amount)),
          currency: 'XAF',
          from: `237${normalizedPhone}`,
          description: description ?? 'Moghamo payment',
          external_reference: reference,
        }),
      });
      collectBody = await collectRes.text();
      if (collectRes.ok || collectRes.status !== 409) break;
    }
    if (!collectRes?.ok) {
      console.error(`Campay collect failed [${collectRes?.status ?? 500}]: ${collectBody}`);
      return new Response(
        JSON.stringify({ error: 'Collection request failed', status: collectRes?.status ?? 500, details: collectBody }),
        { status: collectRes?.status ?? 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } },
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
