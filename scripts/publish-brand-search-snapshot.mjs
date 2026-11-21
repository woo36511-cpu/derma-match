import { loadCatalogStores } from "./official-brand-directory.mjs";
import isFragranceProduct from "../src/utils/isFragranceProduct.js";
import { readFile, writeFile } from "node:fs/promises";
import { stores } from "./sync-official-routine-catalog.mjs";

const [source, destination = "src/data/routineLookupExpansion.json"] = process.argv.slice(2);
if (!source) throw new Error("Expected a discovery snapshot path");
const [fresh, existing] = await Promise.all([source, destination].map(async path => JSON.parse(await readFile(path, "utf8"))));
if (fresh.market !== "KR" || fresh.provenance !== "official_listing_identity_only" || !Array.isArray(fresh.products))
  throw new Error("Unrecognized official listing snapshot");

const catalogStores = await loadCatalogStores(stores);
const items = new Map(existing.products.map(item => [item.id, item]));
const host = name => name.replace(/^(?:www|m)\./i, "");
const discontinued = new Map((existing.discontinued ?? []).map(entry => [entry.id, entry]));
for (const entry of fresh.discontinued ?? []) {
  const key = /^lookup:([a-z0-9]+):[a-z0-9-]{1,120}$/.exec(entry?.id)?.[1];
  const store = key && Object.hasOwn(catalogStores, key) && catalogStores[key];
  if (!store) continue;
  let url;
  try { url = new URL(entry.officialUrl); } catch { continue; }
  if (url.protocol !== "https:" || url.port || url.username || url.password || host(url.hostname) !== host(store.domain)) continue;
  if (!discontinued.has(entry.id)) discontinued.set(entry.id, { id: entry.id, officialUrl: url.href });
}
for (const id of discontinued.keys()) items.delete(id);

for (const candidate of fresh.products) {
  if (discontinued.has(candidate?.id)) continue;
  const match = /^lookup:([a-z0-9]+):([a-z0-9-]{1,120})$/.exec(candidate?.id);
  const store = match && Object.hasOwn(catalogStores, match[1]) && catalogStores[match[1]];
  if (!store || (!store.sourceMarket && !(store.type === "tonymoly" ? /^\d{12,24}$/ : /^\d{1,12}$/).test(match[2])) || candidate.brand !== store.brand || typeof candidate.name !== "string" || !candidate.name.trim() ||
      candidate.name.length > 128 || isFragranceProduct(candidate.name) || !["cleanser", "toner", "serum", "moisturizer", "sunscreen"].includes(candidate.category)) continue;
  if (!Object.hasOwn(stores, match[1]) && !existing.brands?.[match[1]]?.officialCatalogUrl &&
      !(fresh.brands?.[match[1]]?.fetchedListings >= 2 && fresh.brands[match[1]].name === store.brand)) continue;
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
const publishedKeys = new Set([...items.keys()].map(id => id.split(":")[1]));
const newBrands = Object.fromEntries(Object.entries(fresh.brands ?? {}).filter(([key, metadata]) =>
  !Object.hasOwn(stores, key) && Object.hasOwn(catalogStores, key) && publishedKeys.has(key) &&
  metadata?.name === catalogStores[key].brand && metadata.fetchedListings >= 2 &&
  !Object.hasOwn(existing.brands ?? {}, key)).map(([key, metadata]) => {
    const store = catalogStores[key];
    return [key, { ...metadata, alias: store.alias, officialCatalogUrl: `https://${store.domain}${store.paths[0][1]}`,
      ...(store.paths.length === 1 && { listOnly: true }) }];
  }));
for (const { name } of Object.values(newBrands)) console.log(`New skincare brand published: ${name}`);
const products = [...items.values()].sort((a, b) => a.id.localeCompare(b.id, "en"));
const canonical = item => JSON.stringify(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)));
if (discontinued.size === (existing.discontinued ?? []).length && Object.keys(newBrands).length === 0 && products.length === existing.products.length && products.every((item, i) => canonical(item) === canonical(existing.products[i]))) {
  console.log("Product search listings are unchanged");
} else {
  await writeFile(destination, JSON.stringify({ ...existing, checkedAt: fresh.checkedAt, ...(discontinued.size && { discontinued: [...discontinued.values()] }), brands: { ...existing.brands, ...newBrands }, products }, null, 2) + "\n");
  console.log(`${products.length} listing-only search entries; no recommendation changes`);
}
