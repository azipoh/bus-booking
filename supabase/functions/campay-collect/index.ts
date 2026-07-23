import { z } from "npm:zod@3";

// Returns CORS headers
function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "*";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

// Campay environment
const CAMPAY_ENV = (Deno.env.get("CAMPAY_ENV") ?? "live").toLowerCase();
const DEMO_MAX_AMOUNT = Number(Deno.env.get("CAMPAY_DEMO_MAX_AMOUNT") ?? "25");

const BASE_URL =
  CAMPAY_ENV === "demo"
    ? "https://demo.campay.net"
    : "https://www.campay.net";

function buildDemoResponse(reference: string) {
  return {
    reference,
    simulated: true,
    status: "PENDING",
    message:
      `Demo mode: no mobile-money prompt was sent. Campay demo accounts support up to ${DEMO_MAX_AMOUNT} XAF and free trial numbers only.`,
  };
}

// Normalize Cameroon phone numbers
function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("237")) return digits.slice(3);

  if (digits.startsWith("0")) return digits.slice(1);

  return digits;
}

function generateExternalReference() {
  return `busgo-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

const BodySchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),

  phone: z
    .string()
    .trim()
    .refine(
      (value) =>
        /^6\d{8}$/.test(value) || /^\+?2376\d{8}$/.test(value),
      {
        message: "Phone must be a Cameroon mobile number",
      }
    )
    .transform(normalizePhone),

  description: z.string().max(255).optional(),

  external_reference: z.string().max(255).optional(),
});

async function getToken(
  username: string,
  password: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[${res.status}] Token request failed: ${body}`);
  }

  const data = await res.json();

  if (!data.token) {
    throw new Error("Campay did not return a token.");
  }

  return data.token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req),
    });
  }

  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON body.",
        }),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Request body:", JSON.stringify(body));

    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request.",
          details: parsed.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        }
      );
    }

    const {
      amount,
      phone,
      description,
      external_reference,
    } = parsed.data;

    const username = Deno.env.get("CAMPAY_USERNAME");
    const password = Deno.env.get("CAMPAY_PASSWORD");

    if (CAMPAY_ENV === "demo") {
      if (amount > DEMO_MAX_AMOUNT) {
        return new Response(
          JSON.stringify(buildDemoResponse(generateExternalReference())),
          {
            status: 200,
            headers: {
              ...getCorsHeaders(req),
              "Content-Type": "application/json",
            },
          }
        );
      }

      if (!username || !password) {
        return new Response(
          JSON.stringify(buildDemoResponse(generateExternalReference())),
          {
            status: 200,
            headers: {
              ...getCorsHeaders(req),
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    if (!username || !password) {
      return new Response(
        JSON.stringify({
          error:
            "Campay credentials are not configured. Add CAMPAY_USERNAME and CAMPAY_PASSWORD to the Supabase Edge Function secrets before enabling live payments.",
        }),
        {
          status: 503,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        }
      );
    }

    const token = await getToken(username, password);

    let collectRes: Response | undefined;
    let collectBody = "";

    for (let attempt = 0; attempt < 2; attempt++) {
      const reference =
        external_reference?.trim() || generateExternalReference();

      collectRes = await fetch(`${BASE_URL}/api/collect/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          amount: String(Math.round(amount)),
          currency: "XAF",
          from: `237${phone}`,
          description: description ?? "Moghamo payment",
          external_reference: reference,
        }),
      });

      collectBody = await collectRes.text();

      if (collectRes.ok || collectRes.status !== 409) {
        break;
      }
    }

    if (!collectRes || !collectRes.ok) {
      console.error(
        `Campay collect failed [${collectRes?.status}]: ${collectBody}`
      );

      return new Response(
        JSON.stringify({
          error: "Collection request failed.",
          status: collectRes?.status,
          details: collectBody,
        }),
        {
          status: collectRes?.status ?? 500,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        }
      );
    }

    let data;

    try {
      data = JSON.parse(collectBody);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Campay returned a non-JSON response.",
          details: collectBody,
        }),
        {
          status: 502,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        error:
          err instanceof Error
            ? err.message
            : "Unexpected server error.",
      }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
        },
      }
    );
  }
});