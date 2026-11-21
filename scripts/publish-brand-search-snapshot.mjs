import isFragranceProduct from "../src/utils/isFragranceProduct.cjs";
import { readFile, writeFile } from "node:fs/promises";
import { stores } from "./sync-official-routine-catalog.mjs";

const [source, destination = "src/data/routineLookupExpansion.json"] = process.argv.slice(2);
if (!source) throw new Error("Expected a discovery snapshot path");
const [fresh, existing] = await Promise.all([source, destination].map(async path => JSON.parse(await readFile(path, "utf8"))));
if (fresh.market !== "KR" || fresh.provenance !== "official_listing_identity_only" || !Array.isArray(fresh.products))
  throw new Error("Unrecognized official listing snapshot");

const items = new Map(existing.products.map(item => [item.id, item]));
const host = name => name.replace(/^(?:www|m)\./i, "");
for (const candidate of fresh.products) {
  const match = /^lookup:([a-z0-9]+):([a-z0-9-]{1,120})$/.exec(candidate?.id);
  const store = match && Object.hasOwn(stores, match[1]) && stores[match[1]];
  if (!store || (!store.sourceMarket && !/^\d{1,12}$/.test(match[2])) || candidate.brand !== store.brand || typeof candidate.name !== "string" || !candidate.name.trim() ||
      candidate.name.length > 128 || isFragranceProduct(candidate.name) || !["cleanser", "toner", "serum", "moisturizer", "sunscreen"].includes(candidate.category)) continue;
  let url;
  try { url = new URL(candidate.officialUrl); } catch { continue; }
  if (url.protocol !== "https:" || url.port || url.username || url.password || host(url.hostname) !== host(store.domain)) continue;
  const { id, name, brand, category } = candidate;
  const old = items.get(id);
  // Keep existing names and deep links stable unless discovery reports fields for the same product.
  if (old && (old.brand !== brand || old.category !== category ||
    (old.volume && candidate.volume && old.volume !== candidate.volume))) continue;
  items.set(id, { id, name, brand, brandAlias: store.alias, category,
    ...(candidate.volume === undefined ? (old?.volume ? { volume: old.volume } : {}) :
      typeof candidate.volume === "string" && /^\d+(?:\.\d+)?(?:ml|g|매)$/.test(candidate.volume) ? { volume: candidate.volume } : {}),
    officialUrl: url.href, ...(store.sourceMarket && { sourceMarket: store.sourceMarket }), ...(old?.image && { image: old.image }) });
}
const products = [...items.values()].sort((a, b) => a.id.localeCompare(b.id, "en"));
const canonical = item => JSON.stringify(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)));
if (products.length === existing.products.length && products.every((item, i) => canonical(item) === canonical(existing.products[i]))) {
  console.log("Product search listings are unchanged");
} else {
  await writeFile(destination, JSON.stringify({ ...existing, checkedAt: fresh.checkedAt, products }, null, 2) + "\n");
  console.log(`${products.length} listing-only search entries; no recommendation changes`);
}
