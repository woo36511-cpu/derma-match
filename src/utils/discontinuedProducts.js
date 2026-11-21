import expansion from "../data/routineLookupExpansion.json";

export const pageIdentity = value => {
  try {
    const url = new URL(value);
    const sku = url.pathname.match(/^\/product\/[^/]+\/(\d+)(?:\/|$)/)?.[1] ?? url.searchParams.get("product_no") ??
      url.searchParams.get("goodsNo") ?? url.searchParams.get("branduid");
    return `${url.hostname.replace(/^(?:www|m)\./, "")}:${sku && /^\d+$/.test(sku) ? sku : `${url.pathname}${url.search}`}`;
  } catch { return null; }
};

const discontinuedIds = new Set((expansion.discontinued ?? []).map(entry => entry.id));
const discontinuedPages = new Set((expansion.discontinued ?? []).map(entry => pageIdentity(entry.officialUrl)).filter(Boolean));
export function isDiscontinued(product) {
  if (!product) return false;
  return product.availabilityReason?.startsWith("official_discontinued") ||
    discontinuedIds.has(product.id) || product.legacyLookupIds?.some(id => discontinuedIds.has(id)) ||
    discontinuedPages.has(pageIdentity(product.officialUrl)) ||
    product.evidence?.sources?.some(source => source.sourceType === "official_domestic_product_page" &&
      discontinuedPages.has(pageIdentity(source.url))) || false;
}
