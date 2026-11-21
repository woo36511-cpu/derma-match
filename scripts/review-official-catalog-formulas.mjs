import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { ingredientsInfo } from "../src/data/ingredients.js";
import { loadCatalogStores } from "./official-brand-directory.mjs";
import { allowsPublicCatalogPath, stores } from "./sync-official-routine-catalog.mjs";
import { readOfficialFormula } from "./watch-roundlab-catalog.mjs";

const exec = promisify(execFile);
const normalize = value => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const host = value => value.replace(/^(?:www|m)\./, "");

const signals = [
  [/^(?:세라마이드(?:엔피|에이피|이오피|엔에스|엔지)?|ceramide(?:np|ap|eop|ns|ng)?)$/, "세라마이드"],
  [/^(?:히알루론산|소듐하이알루로네이트|hyaluronicacid|sodiumhyaluronate)$/, "히알루론산"],
  [/^(?:판테놀|panthenol)$/, "판테놀"],
  [/^(?:나이아신아마이드|niacinamide)$/, "나이아신아마이드"],
  [/^(?:살리실릭애씨드|salicylicacid)$/, "BHA"],
];

export function analyzeOfficialFormula(html, product) {
  const prefixes = [product.brand, product.brandAlias].filter(Boolean).map(normalize)
    .filter(Boolean).sort((a, b) => b.length - a.length);
  const identity = value => {
    const name = normalize(value.replace(/\d+(?:\.\d+)?\s*(?:ml|g)(?![a-z])/giu, ""));
    const prefix = prefixes.find(prefix => name.startsWith(prefix));
    return prefix ? name.slice(prefix.length) : name;
  };
  const formula = readOfficialFormula(html, product, identity);
  if (!formula) return { status: "full_formula_or_identity_unconfirmed" };

  const ingredientSignals = formula.ingredients.flatMap(ingredient => {
    const match = signals.find(([pattern]) => pattern.test(normalize(ingredient)));
    if (!match) return [];
    const { target, recommendFor, caution } = ingredientsInfo[match[1]];
    return [{ ingredient, concerns: target, possibleFit: recommendFor, caution }];
  });
  return { status: "formula_analysis_ready_for_review", ...formula, ingredientSignals };
}

async function main(source, output, previousPath) {
  if (!source || !output) throw new Error("Provide a discovery snapshot and output path");
  const read = async path => JSON.parse(await readFile(path, "utf8"));
  const discovery = await read(source);
  if (discovery.market !== "KR" || discovery.provenance !== "official_listing_identity_only" ||
      !Array.isArray(discovery.products)) throw new Error("Unrecognized official listing snapshot");
  const previous = previousPath ? await read(previousPath) : {};
  const existing = await read("src/data/routineLookupExpansion.json");
  const known = new Set(existing.products.map(product => product.id));
  const catalogStores = await loadCatalogStores(stores);
  const allowed = new Map();
  const reports = new Map(Object.entries(previous.products ?? {}));
  const eligible = discovery.products.flatMap(product => {
    const key = /^lookup:([a-z0-9]+):[a-z0-9-]+$/.exec(product.id)?.[1];
    const store = key && Object.hasOwn(catalogStores, key) && catalogStores[key];
    if (!store || product.brand !== store.brand || !/^\d+(?:\.\d+)?(?:ml|g)$/i.test(product.volume ?? "")) return [];
    let url;
    try { url = new URL(product.officialUrl); } catch { return []; }
    if (url.protocol !== "https:" || url.port || url.username || url.password || host(url.hostname) !== host(store.domain)) return [];
    return [{ product, url }];
  });
  const byOldest = (a, b) => (reports.get(a.product.id)?.attemptedAt ?? "").localeCompare(reports.get(b.product.id)?.attemptedAt ?? "");
  eligible.sort(byOldest);
  const first = eligible.filter(({ product }) => !known.has(product.id)).slice(0, 12);
  const priority = new Set(first.map(({ product }) => product.id));
  const batch = [...first, ...eligible.filter(({ product }) => !priority.has(product.id))].slice(0, 24);
  const checkedAt = new Date().toISOString();
  const readSource = async url => (await exec("curl", ["-fsS", "--proto", "=https", "--max-time", "8", "--max-filesize", "3000000",
    "-A", "DearSinceCatalog/1.0", "--", url], { maxBuffer: 3_000_000 })).stdout;
  for (const { product, url } of batch) {
    let result = { status: "official_source_unavailable" };
    try {
      if (!allowed.has(url.origin)) allowed.set(url.origin, await readSource(new URL("/robots.txt", url).href).catch(() => ""));
      const robots = allowed.get(url.origin);
      if (/^\s*(?:user-agent|sitemap)\s*:/im.test(robots) && allowsPublicCatalogPath(robots, url.pathname + url.search)) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        result = analyzeOfficialFormula(await readSource(url.href), product);
      }
    } catch { /* Retry unavailable pages on their next turn. */ }
    const lastFormulaHash = reports.get(product.id)?.lastFormulaHash;
    const formulaChanged = Boolean(lastFormulaHash && result.hash && result.hash !== lastFormulaHash);
    reports.set(product.id, { name: product.name, officialUrl: url.href, volume: product.volume, attemptedAt: checkedAt, ...result,
      lastFormulaHash: result.hash ?? lastFormulaHash,
      formulaChanged: formulaChanged || reports.get(product.id)?.formulaChanged === true,
    });
  }
  await writeFile(output, JSON.stringify({ checkedAt, scope: "ingredient_signals_pending_product_fit_review",
    products: Object.fromEntries(reports) }, null, 2) + "\n");
  console.log(`${batch.length} official product pages checked; ${batch.filter(({ product }) =>
    reports.get(product.id).status === "formula_analysis_ready_for_review").length} analyses ready for review.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main(...process.argv.slice(2));
