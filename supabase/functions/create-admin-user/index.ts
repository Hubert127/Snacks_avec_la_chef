// Supabase Edge Function — create-admin-user
// Lets the owner create a brand-new admin account (with a real
// email + password they set) directly from the Manage Users page.
// Runs server-side because it needs the service_role key, which
// must never be shipped to the browser.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey     = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // client scoped to whoever is calling, just to find out who they are
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) return json({ error: "Invalid session" }, 401);

    // service-role client — bypasses RLS, only used after we verify the caller below
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: callerProfile } = await adminClient
      .from("profiles").select("role").eq("id", user.id).single();

    if (!callerProfile || callerProfile.role !== "owner") {
      return json({ error: "Only the owner can create admin accounts" }, 403);
    }

    const { email, password, full_name } = await req.json();
    if (!email || !password || String(password).length < 6) {
      return json({ error: "Email and a password (6+ characters) are required" }, 400);
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });
    if (createError) return json({ error: createError.message }, 400);

    // handle_new_user trigger already created a 'customer' profile row — promote it
    const { error: roleError } = await adminClient
      .from("profiles").update({ role: "admin" }).eq("id", created.user.id);
    if (roleError) return json({ error: roleError.message }, 500);

    return json({ success: true, userId: created.user.id });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
