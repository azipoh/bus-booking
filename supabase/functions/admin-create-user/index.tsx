**
 * admin-create-user
 * Lets an authenticated admin create a staff account (manager or cashier),
 * assign it to a branch, confirm the email, and grant the role.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    // 1. Verify the caller is an authenticated admin
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Missing authorization" }, 401);
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser(token);
    if (callerErr || !caller) return json({ error: "Invalid session" }, 401);
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: adminRole } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRole) return json({ error: "Only admins can create staff accounts" }, 403);
    // 2. Validate input
    const body = await req.json();
    const { email, password, full_name, phone, role, branch_id } = body ?? {};
    if (!email || !password || !role || !branch_id) {
      return json({ error: "email, password, role and branch_id are required" }, 400);
    }
    if (!["manager", "cashier"].includes(role)) {
      return json({ error: "role must be 'manager' or 'cashier'" }, 400);
    }
    if (String(password).length < 6) {
      return json({ error: "Password must be at least 6 characters" }, 400);
    }
    // 3. Create the auth user (email pre-confirmed)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email, phone: phone || "" },
    });
    if (createErr || !created.user) {
      return json({ error: createErr?.message || "Failed to create user" }, 400);
    }
    const newUserId = created.user.id;
    // 4. Attach to branch (profile is auto-created by the handle_new_user trigger)
    const { error: profileErr } = await admin
      .from("profiles")
      .update({ branch_id, full_name: full_name || email, phone: phone || null })
      .eq("id", newUserId);
    if (profileErr) console.error("profile update error:", profileErr.message);
    // 5. Grant the role
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: newUserId, role }, { onConflict: "user_id,role" });
    if (roleErr) {
      return json({ error: "User created but role assignment failed: " + roleErr.message }, 500);
    }
    return json({ message: "Staff account created", user_id: newUserId, email, role });
  } catch (err) {
    console.error("admin-create-user error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return json({ error: message }, 500);
  }
});
