import references from "../data/officialPriceReferences.json";

export const PRICE_FIT_TOLERANCE = 2;
const PRICE_MAX_AGE_DAYS = 45;
const normalizeVolume = volume => String(volume ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, "");

export function getOfficialPriceReference(product, records = references, now = Date.now()) {
  const price = product && records[product.id];
  if (!price || !Number.isInteger(price.amount) || price.amount <= 0 || price.kind !== "regular_krw" || !price.volume ||
      normalizeVolume(product.volume) !== normalizeVolume(price.volume) || !/^\d{4}-\d{2}-\d{2}$/.test(price.checkedAt) ||
      !Array.isArray(product.evidence?.sources)) return null;
  const date = Date.parse(`${price.checkedAt}T00:00:00+09:00`);
  if (!Number.isFinite(date) || date > now || now - date > PRICE_MAX_AGE_DAYS * 86400_000) return null;
  try {
    const source = new URL(price.url);
    const canonicalDomain = host => host.replace(/^(?:m|www)\./i, "");
    if (source.protocol !== "https:" || source.username || source.password || source.port ||
       !product.evidence.sources.some(entry => /^official_domestic_/.test(entry.sourceType) &&
        canonicalDomain(new URL(entry.url).hostname) === canonicalDomain(source.hostname))) return null;
  } catch { return null; }
  return price;
}

// Prices are applied after the suitability and safety filters, without adding to the skin-fit score.
export function preferComparablePrice(ranked, scoreOf, preference, priceOf = getOfficialPriceReference) {
  if (preference !== "important" || ranked.length < 2) return ranked;
  const [first] = ranked;
  const bestFit = scoreOf(first);
  let chosen = first, winner = priceOf(first);
  for (const candidate of ranked.slice(1)) {
    if (bestFit - scoreOf(candidate) > PRICE_FIT_TOLERANCE) continue;
    const price = priceOf(candidate);
    if (price && (!winner || price.amount < winner.amount)) { chosen = candidate; winner = price; }
  }
  return chosen === first ? ranked : [chosen, ...ranked.filter(candidate => candidate !== chosen)];
}
