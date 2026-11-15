const hosts = { 아누아: "anua.kr", 마녀공장: "www.manyo.co.kr" };
const types = ["cleanser", "toner", "serum", "moisturizer"];

export function supportsOfficialFormula(product) {
  return Boolean(product?.name && types.includes(product.category) && Object.keys(hosts).some(brand => product.name.startsWith(brand)));
}

export function readOfficialFormula(evidence, product, now = Date.now()) {
  if (!supportsOfficialFormula(product) || typeof evidence?.name !== "string" || evidence.name.normalize("NFKC") !== product.name.normalize("NFKC") ||
      evidence.category !== product.category || !/^\d+(?:\.\d+)?(?:ml|g)$/.test(evidence.volume ?? "") || typeof evidence.hydrationSignal !== "boolean" ||
      !Array.isArray(evidence.ingredients) || evidence.ingredients.length < 5 || evidence.ingredients.length > 135 ||
      !evidence.ingredients.every(i => typeof i === "string" && i.length >= 2 && i.length < 100 && /^[*\p{L}\p{N}/+()\-,. %·]+$/u.test(i))) return null;
  const checked = Date.parse(evidence.checkedAt);
  if (!Number.isFinite(checked) || checked > now + 300_000 || now - checked > 30 * 86400_000) return null;
  const brand = Object.keys(hosts).find(name => product.name.startsWith(name));
  try {
    const url = new URL(evidence.sourceUrl);
    const [path, param] = brand === "아누아" ? ["/product/detail.html", "product_no"] : ["/goods/goods_view.php", "goodsNo"];
    if (url.origin !== `https://${hosts[brand]}` || url.username || url.password || url.hash || url.pathname !== path ||
        url.search !== `?${param}=${url.searchParams.get(param)}` || !/^\d{1,12}$/.test(url.searchParams.get(param) ?? "")) return null;
    return { name: product.name, category: product.category, volume: evidence.volume, checkedAt: evidence.checkedAt,
      sourceUrl: url.href, ingredients: evidence.ingredients, hydrationSignal: product.category !== "cleanser" && evidence.hydrationSignal };
  } catch { return null; }
}

export async function checkOfficialFormula(product, fetcher = typeof fetch === "function" ? fetch : null) {
  if (!supportsOfficialFormula(product) || typeof fetcher !== "function") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7500);
  try {
    const res = await fetcher("/api/official-cosmetic", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: product.name, category: product.category, sourceUrl: product.officialUrl }), signal: controller.signal });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload.status === "confirmed" ? readOfficialFormula(payload.evidence, product) : null;
  } catch { return null; }
  finally { clearTimeout(timer); }
}
