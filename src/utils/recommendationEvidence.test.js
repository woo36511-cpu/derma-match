import { products } from "../data/products";
import { getProductEvidenceStatus, PRODUCT_CARE_AXES } from "./productEvidence";
import { getProductCareProfile } from "./productCareProfile";
import { getConcernMatchScore, getRecommendationBreakdown } from "./recommendationScoring";
import { getRankedProductCandidates, buildDynamicRoutine, pickAlternativeNonExfoliatingProduct } from "./routineRecommendation";
import { buildRecommendationReasons } from "./recommendationExplanation";
const contexts = [
  { hydrationNeed: 9, barrierCareNeed: 7 }, { lightTextureNeed: 9, congestionCareNeed: 7 },
  { soothingNeed: 9, inflammationCareNeed: 8 }, {},
];
test("all newly ranked candidates, including alternatives, have domestic formula and reviewed profile data", () => {
  const unverified = products.filter(p => !getProductEvidenceStatus(p).eligible).map(p => p.id);
  expect(unverified).toEqual(expect.arrayContaining([8, 18, 20, 27, 29, 31, 34, 50]));
  expect(unverified).not.toContain(2);
  expect(unverified).not.toContain(44);
  for (const level of [1, 3, 5, 7, 10]) for (const careNeeds of contexts) for (const isSensitive of [false, true]) {
    const ctx = { mainConcern: "none", careNeeds, isSensitive, basicOnly: true };
    const routine = buildDynamicRoutine(level, ctx);
    for (const category of ["cleanser", "toner", "serum", "cream"]) {
      expect(getProductEvidenceStatus(routine.products[category]).eligible).toBe(true);
      const ranked = getRankedProductCandidates(category, level, ctx);
      for (const p of ranked) expect(getProductEvidenceStatus(p).eligible).toBe(true);
      const alternate = pickAlternativeNonExfoliatingProduct(category === "cleanser" ? "cleanser" : category, level, ctx);
      if (alternate) expect(getProductEvidenceStatus(alternate).eligible).toBe(true);
      if (isSensitive) expect(routine.products[category].sensitivitySafe).toBe(true);
    }
  }
});
test("ingredient and marketing-tag counts cannot invent product support or acne scores", () => {
  const unreviewed = { ingredients: ["판테놀", "세라마이드", "BHA"], concerns: ["acne", "barrier", "blackhead"], sensitivitySafe: true };
  expect(Object.values(getProductCareProfile(unreviewed))).toEqual(PRODUCT_CARE_AXES.map(() => 0));
  expect(getConcernMatchScore(unreviewed, "inflammatory_acne")).toBe(0);
  const product = products.find(p => p.id === 25);
  const decorated = { ...product, concerns: [...product.concerns, "acne", "blackhead", "pores", "sebum"], ingredients: [...product.ingredients, "BHA", "세라마이드"] };
  expect(getProductCareProfile(decorated)).toEqual(getProductCareProfile(product));
  for (const concern of ["inflammatory_acne", "blackhead_sebum", "oiliness"]) expect(getConcernMatchScore(decorated, concern)).toBe(getConcernMatchScore(product, concern));
});
test("a brand study grade, disclosed percentage, price or purchase link is not an efficacy ranking multiplier", () => {
  const p = products.find(p => p.id === 25), context = { mainConcern: "inflammatory_acne", careNeeds: { soothingNeed: 6 } };
  const changed = { ...p, link: "", price: 999999, evidence: { ...p.evidence, evidenceLevel: "A", concentrationDisclosure: "100_percent" }, clinicalEvidence: { satisfaction: 100 } };
  expect(getRecommendationBreakdown(changed, 5, context).total).toBe(getRecommendationBreakdown(p, 5, context).total);
});
test("saved selection evidence contains the real eligible ranking and an explicit nonclinical score breakdown", () => {
  const ctx = { mainConcern: "none", basicOnly: true, careNeeds: { hydrationNeed: 8 } };
  const routine = buildDynamicRoutine(3, ctx);
  for (const category of ["cleanser", "toner", "serum", "cream"]) {
    const record = routine.selectionEvidence[category];
    expect(record.productId).toBe(getRankedProductCandidates(category, 3, ctx)[0].id);
    expect(record.total).toBeCloseTo(Object.values(record.parts).reduce((a, b) => a + b, 0));
    expect(record.clinicalSuccessProbability).toBeNull();
    expect(record.evidence.clinicalEfficacyValidated).toBe(false);
    expect(record.alternatives.length).toBe(Math.min(2, getRankedProductCandidates(category, 3, ctx).length - 1));
    for (const alternative of record.alternatives) expect(alternative.evidence.eligible).toBe(true);
  }
});
test("recommendation wording uses the actual moisture context and does not promise acne treatment", () => {
  const p = products.find(p => p.id === 25);
  const reasons = buildRecommendationReasons(p, { level: 10, acneSupport: true, careNeeds: { lightTextureNeed: 9 } });
  expect(reasons.join(" ")).toContain("보습감 기준과 차이");
  expect(reasons.join(" ")).toContain("여드름 치료 효과로 순위");
  expect(reasons.join(" ")).not.toContain("현재 수분감 단계와 잘 맞음");
});
