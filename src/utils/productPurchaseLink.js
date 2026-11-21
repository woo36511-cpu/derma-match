import coupangLinks from "../data/productCoupangLinks.json";

export function isWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && (!url.port || url.port === "443");
  } catch {
    return false;
  }
}

export function isCoupangAffiliateUrl(value) {
  if (!isWebUrl(value)) return false;
  return ["link.coupang.com", "coupa.ng"].includes(new URL(value).hostname);
}

export function getProductPurchaseLink(product, overrides = {}) {
  if (!product) return { url: "", label: "링크 준비중", affiliate: false };
  const listing = product.marketplaceListing;
  const exactListing = listing?.provider === "coupang" && listing.productName === product.name &&
    listing.volume === product.volume && listing.verification === "search_index_identity_match";
  const direct = coupangLinks[product.id] ?? (exactListing ? listing.url : null);
  if (isWebUrl(direct) && /^(www\.)?coupang\.com$/.test(new URL(direct).hostname)) {
    return { url: direct, label: "쿠팡에서 보기", affiliate: false };
  }
  const original = isWebUrl(product.link) ? product.link : "";
  if (!original) return { url: "", label: "링크 준비중", affiliate: false };
  const host = new URL(original).hostname;
  const isCoupang = ["www.coupang.com", "coupang.com"].includes(host);
  const saved = overrides[product.id];
  // The exact original URL must match: changed products/options cannot inherit an old affiliate link.
  const override = isCoupang && saved?.originalUrl === original && isCoupangAffiliateUrl(saved.affiliateUrl);
  if (!override && isCoupangAffiliateUrl(original) && product.name) {
    const query = encodeURIComponent([product.name, product.volume].filter(Boolean).join(" "));
    return { url: `https://www.coupang.com/np/search?q=${query}`, label: "쿠팡에서 검색", affiliate: false,
      note: "검색 결과에서 제품명과 용량을 확인해요." };
  }
  const affiliate = Boolean(override || isCoupangAffiliateUrl(original));
  const url = override ? saved.affiliateUrl : original;
  const retailer = isCoupang || affiliate ? "쿠팡" : product.purchaseSource?.label || "판매처";
  const isSearch = override && saved.destination === "search";
  const label = isSearch ? "쿠팡에서 검색" : retailer + "에서 보기";
  const note = isSearch && product.volume
    ? `검색 결과에서 ${product.volume} 옵션을 확인해요.`
    : product.purchaseSource?.note || "";
  return { url, affiliate, label, note };
}
