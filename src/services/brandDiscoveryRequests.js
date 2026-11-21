import { getSupabaseClient } from "./supabaseClient";

export function nextBrandDiscoveryTime(now = new Date()) {
  const seoulOffset = 9 * 60 * 60 * 1000;
  const seoul = new Date(now.getTime() + seoulOffset);
  seoul.setUTCMinutes(0, 0, 0);
  const hour = seoul.getUTCHours();
  seoul.setUTCHours(hour < 10 ? hour + 1 : 24);
  return new Date(seoul.getTime() - seoulOffset);
}

export async function requestBrandDiscovery(rawName) {
  const brandName = rawName.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (brandName.length > 100 || !/^[\p{L}\p{N} .&+'·_()/,%!-]+$/u.test(brandName) ||
      brandName.replace(/[^\p{L}\p{N}]/gu, "").length < 2) return "invalid";
  const client = getSupabaseClient();
  if (!client) return "error";
  try {
    const { error } = await client.from("brand_discovery_requests").insert({ brand_name: brandName });
    if (!error) return "accepted";
    if (error.code === "23505") return "existing";
    return error.message === "brand_discovery_request_limit" ? "busy" : "error";
  } catch {
    return "error";
  }
}
