// Checks the status of a Campay collection by its transaction reference.
// Returns { status: 'SUCCESSFUL' | 'FAILED' | 'PENDING', ... }.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
const CAMPAY_ENV = (Deno.env.get('CAMPAY_ENV') ?? 'live').toLowerCase();
const BASE_URL = CAMPAY_ENV === 'demo' ? 'https://demo.campay.net' : 'https://www.campay.net';
const BodySchema = z.object({
  reference: z.string().min(1).max(255),
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
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const username = Deno.env.get('CAMPAY_USERNAME');
    const password = Deno.env.get('CAMPAY_PASSWORD');
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Campay credentials are not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const { reference } = parsed.data;
    const token = await getToken(username, password);
    const statusRes = await fetch(`${BASE_URL}/api/transaction/${encodeURIComponent(reference)}/`, {
      method: 'GET',
      headers: { Authorization: `Token ${token}` },
    });
    const body = await statusRes.text();
    if (!statusRes.ok) {
      console.error(`Campay status failed [${statusRes.status}]: ${body}`);
      return new Response(
        JSON.stringify({ error: 'Status request failed', status: statusRes.status, details: body }),
        { status: statusRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    return new Response(body, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('campay-status error:', err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});