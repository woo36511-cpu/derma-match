import parse5 from "parse5";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { extractOfficialListings, stores } from "./sync-official-routine-catalog.mjs";

const host = "roundlab.co.kr";
const listings = [
  `https://${host}/sitemap.xml`,
  ...[100, 102].flatMap(cate => [1, 2, 3, 4, 5].map(page =>
    `https://m.${host}/product/list.html?cate_no=${cate}&page=${page}`)),
];
const validHost = url => url.protocol === "https:" && !url.port && !url.username && !url.password &&
  [host, `m.${host}`, `www.${host}`].includes(url.hostname);
const text = node => node?.nodeName === "#text" ? node.value : ["script", "style", "img"].includes(node?.nodeName) ? "" :
  (node?.childNodes ?? []).map(text).join(" ");
const normalize = value => String(value ?? "").normalize("NFKC").replace(/\s+/gu, " ").trim();
const identity = value => normalize(value).replace(/^(라운드랩|round\s*lab)\s*/iu, "")
  .replace(/\d+(?:\.\d+)?\s*(?:ml|g)(?![a-z])/giu, "").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
function* walk(node) {
  if (["script", "style", "template", "noscript"].includes(node.nodeName)) return;
  yield node;
  for (const child of node.childNodes ?? []) yield* walk(child);
}
function fieldValues(html) {
  const fields = new Map();
  for (const row of walk(parse5.parse(html))) {
    const [label, value, extra] = (row.childNodes ?? []).filter(node =>
      row.nodeName === "tr" ? ["th", "td"].includes(node.nodeName) : row.nodeName === "dl" && ["dt", "dd"].includes(node.nodeName));
    if (!label || !value || extra) continue;
    const key = normalize(text(label)).replace(/\s/gu, "");
    const values = fields.get(key) ?? new Set();
    values.add(normalize(text(value)));
    fields.set(key, values);
  }
  return fields;
}
function oneField(fields, pattern) {
  const values = new Set([...fields].filter(([key]) => pattern.test(key)).flatMap(([, set]) => [...set]));
  return values.size === 1 ? [...values][0] : "";
}
export function readRoundLabFormula(html, product) {
  const fields = fieldValues(html);
  const name = oneField(fields, /^(제품명|상품명)$/u);
  const volume = oneField(fields, /^(내용물의)?(용량|중량|용량또는중량|용량및중량)$/u);
  const ingredients = oneField(fields, /^(전성분|화장품법에따라기재[·ㆍ]?표시하여야하는모든성분|화장품법에따라기재해야하는모든성분)$/u);
  if (!name || identity(name) !== identity(product.name) || !/^\d+(?:\.\d+)?\s*(?:ml|g)$/iu.test(volume) ||
      !product.volume || volume.replace(/\s/gu, "").toLowerCase() !== product.volume.toLowerCase()) return null;
  if (!ingredients || /주요성분|일부성분|상세페이지|별도표기|리뉴얼|및기타/u.test(ingredients.replace(/\s/gu, ""))) return null;
  const parts = ingredients.split(/,(?!\d)(?![^()]*\))/u).map(normalize);
  if (parts.length < 5 || parts.length > 135 || !parts.every(item => /^[\p{L}\p{N}()·+/.% -]{2,90}$/u.test(item))) return null;
  return { ingredients: parts, hash: createHash("sha256").update(JSON.stringify(parts)).digest("hex") };
}

async function fetchSource(input, fetcher) {
  let url = new URL(input);
  for (let i = 0; i < 3; i++) {
    if (!validHost(url)) throw new Error("Not an official Round Lab host");
    const response = await fetcher(url, { redirect: "manual", signal: AbortSignal.timeout(8000) });
    if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.get("location")) {
      url = new URL(response.headers.get("location"), url);
      continue;
    }
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let size = 0, output = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return output + decoder.decode();
      size += value.byteLength;
      if (size > 3_000_000) { await reader.cancel(); throw new Error("Page too large"); }
      output += decoder.decode(value, { stream: true });
    }
  }
  throw new Error("Too many redirects");
}

export async function watchRoundLab({ previous = {}, fetcher = fetch, sources = listings, now = new Date() } = {}) {
  const checkedAt = now.toISOString();
  const discovered = new Map();
  let workingSources = 0;
  for (const source of sources) {
    try {
      const products = extractOfficialListings(await fetchSource(source, fetcher), "roundlab", stores.roundlab, source.endsWith(".xml"));
      if (products.length) workingSources++;
      for (const product of products) {
        if (!discovered.has(product.id) || (!discovered.get(product.id).volume && product.volume)) discovered.set(product.id, product);
      }
    } catch { /* A failed source cannot imply a removed product. */ }
  }
  if (!workingSources) throw new Error("No usable Round Lab listings; retain the previous snapshot");
  const products = structuredClone(previous.products ?? {});
  const events = [];
  // Visit products least recently attempted first, so repeated runs cover the catalog without a burst of requests.
  const sample = [...discovered.values()].sort((a, b) => (products[a.id]?.lastAttemptAt ?? "").localeCompare(products[b.id]?.lastAttemptAt ?? "")).slice(0, 12);
  for (const product of discovered.values()) {
    if (!products[product.id]) {
      products[product.id] = { listing: product, state: "listing_only", versions: [] };
      events.push({ id: product.id, type: "discovered" });
    }
  }
  for (const product of sample) {
    const row = products[product.id];
    row.lastAttemptAt = checkedAt;
    let html;
    try { html = await fetchSource(product.officialUrl, fetcher); }
    catch { row.lastAttempt = "fetch_failed"; continue; }
    const formula = readRoundLabFormula(html, product);
    if (!formula) {
      if (row.state === "formula_captured") events.push({ id: product.id, type: "formula_needs_recheck" });
      row.state = "needs_review";
      row.lastAttempt = "formula_unconfirmed";
      continue;
    }
    if (row.versions.at(-1)?.hash !== formula.hash) {
      events.push({ id: product.id, type: row.versions.length ? "formula_changed" : "formula_discovered" });
      row.versions.push({ ...formula, officialUrl: product.officialUrl, name: product.name, volume: product.volume, checkedAt });
    }
    row.listing = product;
    row.state = "formula_captured";
    row.lastAttempt = "captured";
    row.formulaCheckedAt = checkedAt;
  }
  return { market: "KR", brand: "라운드랩", checkedAt, workingSources, discovered: discovered.size, products, events };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [output = "roundlab-snapshot.json", previousPath] = process.argv.slice(2);
  const previous = previousPath ? JSON.parse(await readFile(previousPath, "utf8")) : {};
  const snapshot = await watchRoundLab({ previous });
  await writeFile(output, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Round Lab: ${snapshot.discovered} listings; ${snapshot.events.length} changes; ${snapshot.workingSources} usable sources.`);
}
