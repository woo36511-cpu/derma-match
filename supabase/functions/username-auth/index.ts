import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { createHandler } from "./handler.mjs";

function defaultKey(name: string, legacy: string) {
  const value = Deno.env.get(name);
  return (value ? JSON.parse(value).default : null) || Deno.env.get(legacy) || "";
}
Deno.serve(createHandler({
  createClient,
  url: Deno.env.get("SUPABASE_URL") || "",
  publicKey: defaultKey("SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY"),
  secretKey: defaultKey("SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY"),
}));
