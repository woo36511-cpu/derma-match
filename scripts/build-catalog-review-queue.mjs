import { readFile, writeFile } from "node:fs/promises";
const [source, output] = process.argv.slice(2);
if (!source || !output) throw new Error("Provide discovery snapshot and queue output paths");
const discovery = JSON.parse(await readFile(source, "utf8"));
if (discovery.market !== "KR" || discovery.provenance !== "official_listing_identity_only" || !Array.isArray(discovery.products))
  throw new Error("Expected a Korean official listing snapshot");
const queue = discovery.products.map(({ id, brand, name, category, volume, officialUrl }) => ({
  id, brand, name, category, volume: volume ?? null, officialUrl,
  next: volume ? "match_exact_domestic_product_and_review_full_formula" : "confirm_product_size_then_review_full_formula",
})).sort((a,b) => Number(!a.volume) - Number(!b.volume) || a.brand.localeCompare(b.brand, "ko") || a.name.localeCompare(b.name,"ko"));
await writeFile(output, JSON.stringify({ checkedAt: discovery.checkedAt, purpose: "review_triage_not_recommendation", products: queue }, null, 2) + "\n");
console.log(`${queue.length} official listings queued for ingredient-source reconciliation`);
