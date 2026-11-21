import publishedFormulas from "../data/verifiedRoutineFormulas.json";
import { readOfficialFormula } from "../services/officialCosmetics";
import { buildRoutineSurveyContext, getCurrentRoutineContext } from "./currentRoutineReview";
import { getRoutineLookupProduct } from "./routineLookup";

test("exact official formulas inform the user's existing routine without assigning a product-fit score", () => {
  const product = getRoutineLookupProduct("lookup:numbuzin:28");
  publishedFormulas[product.id] = {
    name: product.name, category: product.category, volume: product.volume, sourceUrl: product.officialUrl,
    checkedAt: new Date().toISOString(), hydrationSignal: true,
    ingredients: ["정제수", "글리세린", "판테놀", "나이아신아마이드", "알란토인"],
  };
  try {
    const entry = { id: product.id, reaction: "heavy" };
    expect(buildRoutineSurveyContext("yes", [entry]).serum).toMatchObject({
      band: "unknown", reaction: "heavy", listedHumectants: true,
    });
    expect(getCurrentRoutineContext([entry]).currentFamilies).toContain("niacinamide");
    expect(readOfficialFormula(null, { ...product, volume: "100ml" })).toBeNull();
    expect(readOfficialFormula(null, { ...product, officialUrl: "https://example.com/product" })).toBeNull();
  } finally {
    delete publishedFormulas[product.id];
  }
});
