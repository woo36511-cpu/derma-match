const origins = new Set(["https://dearsince.vercel.app", "http://localhost:3000"]);
const reserved = new Set(["admin", "administrator", "dearsince", "support", "system", "supabase", "service_role"]);
const fields = {
  signup: ["action", "username", "password"], signin: ["action", "username", "password"],
  recover: ["action", "username", "recoveryCode"], profile: ["action"],
  claim: ["action", "username"], rotate: ["action", "password"],
};
class AuthFailure extends Error {
  constructor(code, status = 400) { super(code); this.code = code; this.status = status; }
}
export function normalizeUsername(value) {
  const username = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[a-z0-9][a-z0-9_]{3,19}$/.test(username) || reserved.has(username)) throw new AuthFailure("invalid_username");
  return username;
}
function password(value, minimum = 8) {
  if (typeof value !== "string" || value.length < minimum || new TextEncoder().encode(value).length > 128) throw new AuthFailure("weak_password");
  return value;
}
function normalizeCode(value) {
  const code = typeof value === "string" ? value.replace(/[\s-]/g, "").toLowerCase() : "";
  if (!/^[a-f0-9]{32}$/.test(code)) throw new AuthFailure("invalid_recovery", 401);
  return code;
}
async function digest(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
async function recoverySecret() {
  const raw = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");
  return { code: raw.match(/.{4}/g).join("-").toUpperCase(), hash: await digest(raw) };
}
async function readBody(req) {
  const reader = req.body?.getReader();
  if (!reader) throw new AuthFailure("invalid_request");
  const chunks = []; let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) { await reader.cancel(); throw new AuthFailure("invalid_request", 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || Array.isArray(body) || typeof body !== "object" || !Object.hasOwn(fields, body.action) ||
      Object.keys(body).some(key => !fields[body.action].includes(key))) throw new AuthFailure("invalid_request");
    return body;
  } catch (error) {
    if (error instanceof AuthFailure) throw error;
    throw new AuthFailure("invalid_request");
  } finally { reader.releaseLock(); }
}
function authFailure(error) {
  const allowed = new Set(["invalid_credentials", "email_not_confirmed", "weak_password", "user_banned", "over_request_rate_limit"]);
  if (allowed.has(error?.code)) return new AuthFailure(error.code, error.status === 429 ? 429 : 400);
  return new AuthFailure("auth_unavailable", 503);
}
function sessionResult(session, username, extra = {}) {
  if (!session?.access_token || !session?.refresh_token) throw new AuthFailure("auth_unavailable", 503);
  return { session: { access_token: session.access_token, refresh_token: session.refresh_token }, userId: session.user?.id, username, ...extra };
}

// Admin credentials stay in Edge Function environment. Passwords go only to Supabase Auth.
export function createHandler({ createClient, url, publicKey, secretKey }) {
  return async req => {
    const origin = req.headers.get("origin");
    const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin",
      "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
      "Access-Control-Allow-Methods": "POST, OPTIONS" };
    if (origin && origins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
    if (origin && !origins.has(origin)) return reply({ code: "origin_not_allowed" }, 403);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (req.method === "GET") return reply({ version: "username-auth-v2" });
    if (req.method !== "POST") return reply({ code: "method_not_allowed" }, 405);
    try {
      if (!url || !publicKey || !secretKey) throw new AuthFailure("auth_unavailable", 503);
      const body = await readBody(req);
      const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
      const admin = createClient(url, secretKey, options);
      const auth = createClient(url, publicKey, options);
      const rpc = async (name, args) => {
        const { data, error } = await admin.rpc(name, args);
        if (error) throw new AuthFailure("auth_unavailable", 503);
        return data;
      };
      const limit = async (bucket, count, seconds) => {
        if (!await rpc("username_auth_limit", { p_bucket: bucket, p_limit: count, p_seconds: seconds })) throw new AuthFailure("over_request_rate_limit", 429);
      };
      // IP-based buckets are supplemental; global and username buckets remain effective even if a forwarded header is forged.
      const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",").at(-1).trim().slice(0,100);
      const ipHash = await digest(`${secretKey}:${ip}`);
      await limit("global", 200, 60);
      await limit(`ip:${ipHash}`, 40, 60);
      const lookup = name => rpc("username_account_lookup", { p_username: name });
      const verifiedUser = async () => {
        const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
        if (!token || token.split(".").length !== 3) throw new AuthFailure("authentication_required", 401);
        const { data, error } = await admin.auth.getUser(token);
        if (error || !data?.user) throw new AuthFailure("authentication_required", 401);
        return data.user;
      };
      const getAuthUser = async id => {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (error || !data?.user?.email) throw new AuthFailure("invalid_credentials", 401);
        return data.user;
      };
      const authenticate = async (user, suppliedPassword) => {
        const { data, error } = await auth.auth.signInWithPassword({ email: user.email, password: suppliedPassword });
        if (error) throw authFailure(error);
        if (data?.user?.id !== user.id) throw new AuthFailure("auth_unavailable", 503);
        return data.session;
      };
      if (body.action === "profile") {
        const user = await verifiedUser();
        return reply({ username: await rpc("username_for_user", { p_user_id: user.id }) });
      }
      if (body.action === "claim" || body.action === "rotate") {
        const user = await verifiedUser();
        const existing = await rpc("username_for_user", { p_user_id: user.id });
        const secret = await recoverySecret();
        if (body.action === "claim") {
          const username = normalizeUsername(body.username);
          if (existing) throw new AuthFailure("username_already_set", 409);
          if (!await rpc("register_username", { p_username: username, p_user_id: user.id, p_digest: secret.hash })) throw new AuthFailure("username_taken", 409);
          return reply({ username, recoveryCode: secret.code });
        }
        if (!existing) throw new AuthFailure("username_required");
        await limit(`rotate:${user.id}`, 5, 900);
        await authenticate(user, password(body.password, 1));
        const { error } = await auth.auth.signOut({ scope: "local" });
        if (error) throw new AuthFailure("auth_unavailable", 503);
        await rpc("replace_username_recovery", { p_user_id: user.id, p_digest: secret.hash });
        return reply({ username: existing, recoveryCode: secret.code });
      }
      const username = normalizeUsername(body.username);
      await limit(`name:${username}:${body.action}`, body.action === "signup" ? 5 : 10, 900);
      if (body.action === "signup") {
        const suppliedPassword = password(body.password);
        await limit("signup:global", 100, 3600);
        await limit(`signup:${ipHash}`, 5, 3600);
        if (await lookup(username)) throw new AuthFailure("username_taken", 409);
        const secret = await recoverySecret();
        // A non-deliverable internal identifier is not a collected email address. No email is sent.
        const email = `${crypto.randomUUID()}@accounts.dearsince.invalid`;
        const { data, error } = await admin.auth.admin.createUser({ email, password: suppliedPassword, email_confirm: true,
          app_metadata: { account_type: "username" } });
        if (error || !data?.user) throw authFailure(error);
        const created = data.user;
        try {
          if (!await rpc("register_username", { p_username: username, p_user_id: created.id, p_digest: secret.hash })) throw new AuthFailure("username_taken", 409);
          const session = await authenticate(created, suppliedPassword);
          return reply(sessionResult(session, username, { recoveryCode: secret.code }));
        } catch (failure) {
          // Only the new account created by this request can be cleaned up.
          const { error: cleanupError } = await admin.auth.admin.deleteUser(created.id);
          if (cleanupError) throw new AuthFailure("auth_unavailable", 503);
          throw failure;
        }
      }
      if (body.action === "signin") {
        const suppliedPassword = password(body.password, 1);
        const userId = await lookup(username);
        if (!userId) throw new AuthFailure("invalid_credentials", 401);
        const session = await authenticate(await getAuthUser(userId), suppliedPassword);
        return reply(sessionResult(session, username));
      }
      const oldHash = await digest(normalizeCode(body.recoveryCode));
      const secret = await recoverySecret();
      const userId = await rpc("consume_username_recovery", { p_username: username, p_old_digest: oldHash, p_new_digest: secret.hash });
      if (!userId) throw new AuthFailure("invalid_recovery", 401);
      try {
        const user = await getAuthUser(userId);
        const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: user.email });
        if (error || !data?.properties?.hashed_token) throw new AuthFailure("auth_unavailable", 503);
        const verified = await auth.auth.verifyOtp({ token_hash: data.properties.hashed_token, type: "magiclink" });
        if (verified.error || verified.data?.user?.id !== userId) throw new AuthFailure("auth_unavailable", 503);
        const result = sessionResult(verified.data.session, username, { recoveryCode: secret.code, recovery: true });
        const signedOut = await auth.auth.signOut({ scope: "others" });
        if (signedOut.error) throw new AuthFailure("auth_unavailable", 503);
        return reply(result);
      } catch {
        await rpc("restore_username_recovery", { p_user_id: userId, p_expected_digest: secret.hash, p_digest: oldHash });
        throw new AuthFailure("auth_unavailable", 503);
      }
    } catch (error) {
      // Never log request bodies, passwords, recovery codes, tokens, or raw provider responses.
      return reply({ code: error instanceof AuthFailure ? error.code : "auth_unavailable" }, error instanceof AuthFailure ? error.status : 503);
    }
  };
}
