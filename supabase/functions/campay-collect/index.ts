import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const BASE = "https://api.campay.net/api";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { amount, phone, description } = await req.json();
    if (!amount || !phone) {
      return new Response(JSON.stringify({ error: "amount and phone are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const permanentToken = Deno.env.get("CAMPAY_PERMANENT_TOKEN") || Deno.env.get("CAMPAY_TOKEN");
    let authToken = permanentToken;

    if (!authToken) {
      const username = Deno.env.get("CAMPAY_USERNAME");
      const password = Deno.env.get("CAMPAY_PASSWORD");
      if (!username || !password) {
        return new Response(JSON.stringify({ error: "Campay credentials are not configured on this function." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tokenRes = await fetch(`${BASE}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.token) {
        return new Response(JSON.stringify({ error: "Auth failed", details: tokenData }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      authToken = tokenData.token;
    }

    const collectRes = await fetch(`${BASE}/collect/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${authToken}` },
      body: JSON.stringify({
        amount: String(amount),
        from: phone,
        description: description ?? "BusGo payment",
        currency: "XAF",
      }),
    });
    const collectData = await collectRes.json();

    return new Response(JSON.stringify(collectData), {
      status: collectRes.ok ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
