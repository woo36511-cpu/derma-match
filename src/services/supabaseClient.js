import { createClient } from "@supabase/supabase-js";

export function readCloudConfig(env = process.env) {
  const url = (env.REACT_APP_SUPABASE_URL || "").trim();
  const key = (env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || "").trim();
  if (!url && !key) return { configured: false, url: null, key: null };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/") throw new Error();
    // Secret/service-role keys must never be compiled into a browser bundle.
    if (!key.startsWith("sb_publishable_")) throw new Error();
    return { configured: true, url: parsed.origin, key };
  } catch {
    return { configured: false, url: null, key: null, error: "클라우드 연결 설정을 확인해야 해요." };
  }
}

let client;
export function getSupabaseClient() {
  if (client !== undefined) return client;
  const config = readCloudConfig();
  client = config.configured ? createClient(config.url, config.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  }) : null;
  return client;
}
