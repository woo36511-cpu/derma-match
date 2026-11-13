import { buildCosmeticAddOnPlan, snapshotCosmeticAddOn } from "./cosmeticAddOnPlan";
import { buildDynamicRoutine } from "./routineRecommendation";
import { getProductById, hasExfoliatingActive } from "./productCatalog";
import { cleanCosmeticAnswers } from "../data/cosmeticAddOns";

const surveyAnswers = { afterWash: "별로 불편하지 않다", afternoonFeel: "얼굴 전체가 번들거린다", areaDifference: "얼굴 전체가 기름진 편이다", creamFeel: "적당히 편안하다", innerDryness: "거의 없다", sensitivity: "거의 없다", mainIssue: "특별한 고민은 없다" };
const profile = { skinType: "지성", hydrationLevel: 8, scores: { sensitivity: 0 }, careNeeds: {} };
const context = { profile, surveyAnswers, carePlan: { answers: { concern: "none" } } };
const choices = { goal: "tone", comfort: "comfortable", actives: ["none"], experience: "new", special: "none" };
test("the same goal picks a different moisture fit for dry and oily skin", () => {
  const dry = buildCosmeticAddOnPlan(choices, { ...context, profile: { ...profile, skinType: "건성", hydrationLevel: 2 } });
  const oily = buildCosmeticAddOnPlan(choices, context);
  expect(dry.product.id).toBe(23); expect(oily.product.id).toBe(51);
  expect(oily.product.hydrationLevel).toBe(7);
  expect(oily.fit).toContain("가벼운 사용감");
});
test("irritation, worsening care plans, unknown actives and poor skin data cannot generate add-ons", () => {
  for (const [answers, ctx] of [[{ ...choices, comfort: "irritated" }, context], [{ ...choices, comfort: "concerning" }, context], [choices, { ...context, carePlan: { blockNewBasics: true } }], [{ ...choices, actives: ["unknown"] }, context], [choices, { ...context, surveyAnswers: {} }]]) {
    expect(buildCosmeticAddOnPlan(answers, ctx).product).toBeNull();
  }
});
test("duplicate niacinamide, active medicine, and vulnerable contexts withhold new treatment cosmetics", () => {
  for (const actives of [["niacinamide"], ["benzoyl"], ["medicine"], ["none", "medicine"]]) expect(buildCosmeticAddOnPlan({ ...choices, actives }, context).product).toBeNull();
  for (const special of ["restricted", "unknown"]) expect(buildCosmeticAddOnPlan({ ...choices, special }, context).product).toBeNull();
  expect(buildCosmeticAddOnPlan(choices, { ...context, carePlan: { answers: { medicine: "patima" } } }).product).toBeNull();
  expect(buildCosmeticAddOnPlan(choices, { ...context, surveyAnswers: { ...surveyAnswers, mainIssue: "붉고 아픈 여드름" } }).product).toBeNull();
});
test("acids are withheld for dry/sensitive skin or alongside acids, retinoids, vitamin C and drugs", () => {
  const acid = { ...choices, goal: "texture" };
  for (const actives of [["acid"], ["retinoid"], ["vitaminC"], ["benzoyl"], ["medicine"]]) expect(buildCosmeticAddOnPlan({ ...acid, actives }, context).product).toBeNull();
  expect(buildCosmeticAddOnPlan({ ...acid, comfort: "dry" }, context).product).toBeNull();
  expect(buildCosmeticAddOnPlan(acid, { ...context, profile: { ...profile, skinType: "민감 지성", scores: { sensitivity: 5 } } }).product).toBeNull();
  expect(buildCosmeticAddOnPlan(acid, context).product).not.toBeNull();
});
test("explicit cosmetic-first selection suppresses the OTC candidate only after all eligibility checks pass", () => {
  const carePlan = { pharmacy: { name: "클리어틴" }, answers: { concern: "acne", shape: "blackhead", medicine: "none" } };
  const acid = { ...choices, goal: "texture", route: "cosmetic_first" };
  const plan = buildCosmeticAddOnPlan(acid, { ...context, carePlan });
  expect(hasExfoliatingActive(plan.product)).toBe(true); expect(plan.suppressPharmacy).toBe(true);
  const held = buildCosmeticAddOnPlan({ ...acid, route: "keep_medicine" }, { ...context, carePlan });
  expect(held.product).toBeNull(); expect(held.suppressPharmacy).toBe(false);
  const unknown = buildCosmeticAddOnPlan({ ...acid, actives: ["unknown"] }, { ...context, carePlan });
  expect(unknown.suppressPharmacy).toBe(false);
});
test("basic overlap is marked as covered and a snapshot never invents actual usage", () => {
  const plan = buildCosmeticAddOnPlan(choices, { ...context, routine: { products: { serum: getProductById(51) } } });
  expect(plan.status).toBe("covered");
  expect(snapshotCosmeticAddOn(plan)).toMatchObject({ recommendedProductId: 51, status: "covered" });
  expect(snapshotCosmeticAddOn(plan)).not.toHaveProperty("actualUsage");
});
test("the new catalog entry has exact 3.0 identity, verified strengths, photo, and no purchase link; basic routines exclude it", () => {
  const product = getProductById(51);
  expect(product.name).toBe("마녀공장 갈락 나이아신 3.0 에센스"); expect(product.volume).toBe("60ml"); expect(product.fullIngredients).toHaveLength(24);
  expect(product.activeIngredients.find(i => i.name === "나이아신아마이드").concentration).toBe(4);
  expect(product.image).toBe("/products/manyo-galac-niacin-3.png"); expect(product.link).toBe(""); expect(product.price).toBeNull();
  for (let level = 1; level <= 10; level++) expect(Object.values(buildDynamicRoutine(level).products).map(p => p.id)).not.toContain(51);
});
test("changing the goal drops hidden route and restrictions rather than storing stale answers", () => {
  expect(cleanCosmeticAnswers({ ...choices, goal: "support", route: "cosmetic_first" })).toEqual({ goal: "support", comfort: "comfortable", actives: ["none"] });
});

test("oil-control serum is optional, scoped to the oily area and not doubled with current niacinamide", () => {
  const oil = { ...choices, goal: "sebum", shine: "later", oilArea: "tzone" };
  const candidate = buildCosmeticAddOnPlan(oil, context);
  expect(candidate.product?.id).toBe(75);
  expect(candidate.fit).toContain("이마·코 주변");
  expect(candidate.product.activeIngredients.find(x => x.name === "나이아신아마이드").concentration).toBeNull();
  expect(buildCosmeticAddOnPlan({ ...oil, shine: "immediate" }, context).title).toContain("무거운 제품 하나");
  expect(buildCosmeticAddOnPlan({ ...oil, shine: "fine" }, context).product).toBeNull();
  expect(buildCosmeticAddOnPlan({ ...oil, oilArea: "unknown" }, context).product).toBeNull();
  expect(buildCosmeticAddOnPlan(oil, { ...context, knownSerumFamilies: ["niacinamide"] }).title).toContain("이미 쓰는 나이아신아마이드");
  expect(buildCosmeticAddOnPlan(oil, { ...context, serumIrritation: true }).product).toBeNull();
  expect(buildDynamicRoutine(7).products.serum?.id).not.toBe(75);
});
