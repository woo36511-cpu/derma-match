import { getSupabaseClient } from "./supabaseClient";

const table = "product_review_requests";
const publicFields = "product_name,category,status,requested_at";

export function getOfficialIngredientSearchUrl(name) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} 공식 브랜드 국내 전성분`)}`;
}

function parseSourceUrl(raw) {
  if (!raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) return false;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|gclid$|fbclid$|token$|session|email$|access_token$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.href.length <= 512 ? url.href : false;
  } catch { return false; }
}

export async function requestProductReview(product, source = "") {
  const url = parseSourceUrl(source);
  if (url === false) return "invalid_url";
  if (!product || !/^[^<>@\x00-\x1f\x7f]+$/.test(product.name)) return "invalid_name"; // eslint-disable-line no-control-regex
  const client = getSupabaseClient();
  if (!client) return "error";
  const { error } = await client.from(table).insert({ product_name: product.name, category: product.category, source_url: url });
  if (!error) return "pending";
  if (error.code === "23505") return "existing";
  if (error.message === "product_review_request_limit") return "limited";
  if (error.code === "23514") return "invalid_name";
  return "error";
}

export async function listProductReviewRequests() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Product review is unavailable.");
  const { data, error } = await client.from(table).select(publicFields).order("requested_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}
