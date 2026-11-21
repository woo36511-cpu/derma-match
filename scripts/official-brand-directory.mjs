import { readFile } from "node:fs/promises";

const hostname = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|kr|shop|net)$/i;
const textField = value => typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= 80;

export async function loadCatalogStores(existing, directoryPath = process.env.ROUTINE_BRAND_DIRECTORY) {
  const bundled = new URL("../data/official-brand-candidates.json", import.meta.url);
  const read = async path => JSON.parse(await readFile(path, "utf8"));
  const catalog = await read(new URL("../src/data/routineLookupExpansion.json", import.meta.url));
  const rows = Object.entries(catalog.brands ?? {}).flatMap(([key, brand]) =>
    brand.officialCatalogUrl ? [{ key, brand: brand.name, alias: brand.alias, catalogUrl: brand.officialCatalogUrl }] : []);
  rows.push(...await read(bundled));
  if (directoryPath) {
    const approved = await read(directoryPath);
    if (!Array.isArray(approved) || approved.length > 30) throw new Error("Expected up to 30 approved official brand candidates");
    rows.push(...approved);
  }

  const candidates = new Map();
  const normalize = name => name.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const registeredNames = new Set(Object.values(existing).map(store => normalize(store.brand)));
  const registeredHosts = new Set(Object.values(existing).map(store => store.domain.replace(/^www\./, "")));
  for (const row of rows) {
    if (!row || typeof row.key !== "string" || !/^[a-z][a-z0-9]{1,39}$/.test(row.key) ||
        !textField(row.brand) || !textField(row.alias)) throw new Error("Invalid official brand identity");
    const url = new URL(row.catalogUrl);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash || !hostname.test(url.hostname) ||
        !(/^\/category\/[^/]+\/\d+\/$/.test(url.pathname) || url.pathname === "/product/list.html") ||
        !/^(?:\?cate_no=\d+)?$/.test(url.search)) throw new Error(`Invalid official catalog URL for ${row.key}`);
    if (Object.hasOwn(existing, row.key)) continue;
    const brand = normalize(row.brand);
    const host = url.hostname.replace(/^www\./, "");
    if (!brand || registeredNames.has(brand) || registeredHosts.has(host) || candidates.has(row.key)) continue;
    registeredNames.add(brand);
    registeredHosts.add(host);
    candidates.set(row.key, {
      brand: row.brand, alias: row.alias, domain: url.hostname, type: "cafe",
      paths: [["list", url.pathname + url.search], ["site", "/sitemap.xml"]],
    });
  }
  return Object.fromEntries([...candidates, ...Object.entries(existing)]);
}
