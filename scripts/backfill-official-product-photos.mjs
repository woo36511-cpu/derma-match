import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import parse5 from "parse5";
import { loadCatalogStores } from "./official-brand-directory.mjs";
import { allowsPublicCatalogPath, officialListingImage, stores } from "./sync-official-routine-catalog.mjs";

const hostKey = host => host.replace(/^(?:www|m)\./, "");
const sku = url => url.pathname.match(/^\/product\/[^/]+\/(\d+)(?:\/|$)/)?.[1] ??
  ["product_no", "goodsNo", "branduid", "idx", "prdSeq", "goods_no"].map(key => url.searchParams.get(key)).find(Boolean);
const samePage = (expected, actual) => {
  if (actual.protocol !== "https:" || actual.port || actual.username || actual.password ||
      hostKey(actual.hostname) !== hostKey(expected.hostname)) return false;
  const expectedSku = sku(expected);
  return expectedSku ? sku(actual) === expectedSku :
    actual.pathname === expected.pathname && actual.search === expected.search;
};

export function productPhoto(html, url, host) {
  const head = parse5.parse(html).childNodes.find(node => node.nodeName === "html")?.childNodes
    .find(node => node.nodeName === "head");
  let matchingPage = false;
  let currentOpenGraphPage = false;
  const images = [];
  for (const node of head?.childNodes ?? []) {
    const attrs = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
    const identity = node.nodeName === "link" && attrs.rel === "canonical" ? attrs.href
      : attrs.property === "og:url" ? attrs.content : null;
    if (identity) {
      let matches = false;
      try { matches = samePage(url, new URL(identity, url)); } catch { /* Ignore malformed metadata. */ }
      matchingPage ||= matches;
      if (attrs.property === "og:url") currentOpenGraphPage = matches;
    }
    if (node.nodeName === "meta" && ["og:image", "og:image:secure_url"].includes(attrs.property) && attrs.content) {
      images.push({ source: attrs.content, tiedToProduct: currentOpenGraphPage });
    }
  }
  if (!matchingPage) return null;
  for (const { source, tiedToProduct } of images.reverse()) {
    try {
      const photo = new URL(source, url);
      if (/logo|placeholder|no[_-]?image|default[_-]?image|share-image/i.test(photo.pathname)) continue;
      if (!tiedToProduct && images.length > 1 && !/\/web\/product\//i.test(photo.pathname)) continue;
      const image = officialListingImage(photo.href, host);
      if (image) return image;
    } catch { /* Skip malformed image URLs. */ }
  }
  return null;
}

async function fetchHtml(url, encoding = "utf-8") {
  const options = {
    headers: { "User-Agent": "DearSinceCatalog/1.0" },
    redirect: "manual",
    signal: AbortSignal.timeout(7000),
  };
  let response = await fetch(url, options);
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get("location");
    await response.body?.cancel();
    if (!location) return null;
    const target = new URL(location, url);
    if (!samePage(url, target) || target.pathname !== url.pathname || target.search !== url.search) return null;
    response = await fetch(target, options);
  }
  if (!response.ok) {
    await response.body?.cancel();
    return null;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder(encoding);
  let result = "", size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return result + decoder.decode();
    size += value.byteLength;
    if (size > 512_000) {
      await reader.cancel();
      return result;
    }
    result += decoder.decode(value, { stream: true });
    if (/<\/head\s*>/i.test(result)) {
      await reader.cancel();
      return result;
    }
  }
}

async function backfill(snapshotPath) {
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
  const overrides = JSON.parse(await readFile("src/data/officialProductPhotos.json", "utf8"));
  const catalogStores = await loadCatalogStores(stores);
  const byHost = new Map();
  const missing = snapshot.products.filter(product => !product.image && !overrides[product.id]);
  for (const product of missing) {
    const store = Object.hasOwn(catalogStores, product.id.split(":")[1]) ? catalogStores[product.id.split(":")[1]] : null;
    if (!store) continue;
    let url;
    try { url = new URL(product.officialUrl); } catch { continue; }
    if (url.protocol !== "https:" || url.port || url.username || url.password ||
        hostKey(url.hostname) !== hostKey(store.domain)) continue;
    const key = hostKey(store.domain);
    if (!byHost.has(key)) byHost.set(key, []);
    byHost.get(key).push({ product, store, url });
  }

  const queue = [...byHost.values()];
  const rotation = process.env.PHOTO_BACKFILL_ROTATION ?? Math.floor(Date.now() / 86_400_000);
  let added = 0;
  await Promise.all(Array.from({ length: 12 }, async () => {
    for (let rows; (rows = queue.shift()); ) {
      let robots;
      try { robots = await fetchHtml(new URL("/robots.txt", rows[0].url)); } catch { continue; }
      if (!robots || !/^\s*(user-agent|sitemap)\s*:/im.test(robots)) continue;
      const allowed = rows.filter(({ url }) => allowsPublicCatalogPath(robots, url.pathname + url.search));
      const perHost = rotation === "all" ? Math.max(1, allowed.length) : 20;
      const page = (rotation === "all" ? 0 : Number(rotation)) % Math.max(1, Math.ceil(allowed.length / perHost));
      for (const { product, store, url } of allowed.slice(page * perHost, (page + 1) * perHost)) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const html = await fetchHtml(url, store.encoding ?? (store.type === "makeshop" ? "euc-kr" : "utf-8"));
          const image = html && productPhoto(html, url, store.domain);
          if (image) {
            product.image = image;
            added++;
          }
        } catch { /* Retry on a future catalog run. */ }
      }
    }
  }));
  await writeFile(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Added ${added} official product photos. ${missing.length - added} listings still lack a photo.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await backfill(process.argv[2]);
