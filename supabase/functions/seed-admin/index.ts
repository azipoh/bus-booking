import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const adminEmail = "admin@busgo.cm";
  const adminPassword = "Admin@2026";

  // Check if admin already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u: any) => u.email === adminEmail);

  if (existing) {
    // Ensure admin role exists
    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", existing.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) {
      await supabaseAdmin.from("user_roles").upsert({
        user_id: existing.id,
        role: "admin",
      });
    }

    return new Response(
      JSON.stringify({ message: "Admin already exists", email: adminEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Create admin user
  const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: "BusGo Admin" },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Assign admin role
  await supabaseAdmin.from("user_roles").upsert({
    user_id: newUser.user.id,
    role: "admin",
  });

  return new Response(
    JSON.stringify({
      message: "Admin created successfully",
      email: adminEmail,
      password: adminPassword,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
