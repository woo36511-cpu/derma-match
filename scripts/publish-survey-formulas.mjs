import { readFile, writeFile } from "node:fs/promises";

const [reportPath, catalogPath = "src/data/routineLookupExpansion.json",
  outputPath = "src/data/verifiedRoutineFormulas.json"] = process.argv.slice(2);
if (!reportPath) throw new Error("Provide an official formula review report");
const read = async path => JSON.parse(await readFile(path, "utf8"));
const [report, catalog] = await Promise.all([read(reportPath), read(catalogPath)]);
if (report.scope !== "ingredient_signals_pending_product_fit_review") throw new Error("Unrecognized formula report");
const excluded = new Set((catalog.discontinued ?? []).map(entry => entry.id));
const formulas = {};
for (const product of catalog.products) {
  const review = report.products?.[product.id];
  if (!review || excluded.has(product.id) || (product.sourceMarket && product.sourceMarket !== "KR") ||
      review.status !== "formula_analysis_ready_for_review" || review.name !== product.name ||
      review.volume !== product.volume || review.officialUrl !== product.officialUrl ||
      !Number.isFinite(Date.parse(review.attemptedAt)) || !Array.isArray(review.ingredients)) continue;
  formulas[product.id] = {
    name: product.name, category: product.category, volume: product.volume, sourceUrl: product.officialUrl,
    checkedAt: review.attemptedAt, ingredients: review.ingredients,
    hydrationSignal: product.category !== "cleanser" && review.ingredients.some(ingredient =>
      /^(?:글리세린|판테놀|히알루론산|소듐하이알루로네이트|glycerin|panthenol|hyaluronic acid|sodium hyaluronate)$/iu.test(ingredient.trim())),
  };
}
await writeFile(outputPath, JSON.stringify(formulas, null, 2) + "\n");
console.log(`${Object.keys(formulas).length} exact-match official formulas available for routine surveys`);
