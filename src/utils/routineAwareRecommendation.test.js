import { buildCosmeticAddOnPlan } from "./cosmeticAddOnPlan";
import { getCurrentRoutineContext, makeManualRoutineEntry } from "./currentRoutineReview";
import { getProductById } from "./productCatalog";
import { getRoutineFitSignals } from "./routineFitContext";
import { buildDynamicRoutine, getRankedProductCandidates } from "./routineRecommendation";

const profile = { hydrationLevel: 6, skinType: "복합성", careNeeds: {},
  observationAssessment: { canRecommendBasics: true, canRecommendActives: true, isSensitive: false } };
const choices = { goal: "texture", comfort: "comfortable", actives: ["none"], experience: "new", special: "none" };
const addOn = (input, entries) => buildCosmeticAddOnPlan(input, { profile, currentRoutine: getCurrentRoutineContext(entries) });

test("exact manual product names resolve to owned IDs, so basic and supplemental searches cannot resell them", () => {
  const owned = makeManualRoutineEntry(getProductById(76).name, "serum");
  const context = getCurrentRoutineContext([owned]);
  expect(context.ownedProductIds.has(76)).toBe(true);
  expect(context.uncertainActives).toHaveLength(0);
  expect(context.currentFamilies).toEqual(expect.arrayContaining(["pdrn", "niacinamide"]));
  expect(addOn({ ...choices, goal: "support", serumFocus: "pdrn" }, [owned]).product?.id).not.toBe(76);
  expect(getRankedProductCandidates("serum", 6, { ...getCurrentRoutineContext([{ id: 2 }]), basicOnly: true }).map(p => p.id)).not.toContain(2);
});

test("unknown leave-on formulas pause exfoliation, but allow a verified gentle support candidate", () => {
  const unknown = makeManualRoutineEntry("매일 쓰는 로션", "moisturizer");
  expect(addOn(choices, []).product).not.toBeNull();
  expect(addOn(choices, [unknown])).toMatchObject({ product: null, title: expect.stringContaining("포장 성분표") });
  expect(addOn({ ...choices, unlistedIngredientsChecked: true }, [unknown]).product).not.toBeNull();
  expect(addOn({ ...choices, goal: "support" }, [unknown]).product).not.toBeNull();
  const retinol = makeManualRoutineEntry("저녁 레티놀 토너", "toner");
  expect(addOn({ ...choices, unlistedIngredientsChecked: true }, [retinol]).product).toBeNull();
});

test("T-zone oil keeps cheek hydration, immediate heaviness changes the texture, and irritation vetoes every new slot", () => {
  const context = { mainConcern: "none", basicOnly: true, isSensitive: false,
    careNeeds: { hydrationNeed: 7, lightTextureNeed: 8, barrierCareNeed: 5 },
    observedSkin: { observedOil: "tzone", drynessArea: "cheeks", drynessTiming: "day", washResponse: "tight" } };
  expect(getRoutineFitSignals("cleanser", context)).toMatchObject({ hydration: 7, texture: 3, washTight: true });
  expect(getRoutineFitSignals("cream", context)).toMatchObject({ hydration: 7, texture: 4, distinctAreas: true });
  expect(getRoutineFitSignals("cream", { ...context, observedSkin: { ...context.observedSkin, observedOil: "whole" } }).texture).toBe(8);
  const original = buildDynamicRoutine(5, context);
  expect(original.products.cream).toBeTruthy();
  const heavy = buildDynamicRoutine(5, { ...context, slotReactions: { cream: "heavy" }, ownedProductIds: new Set([original.products.cream.id]) });
  expect(heavy.products.cream.id).not.toBe(original.products.cream.id);
  expect(heavy.products.cream.careProfile.lightweightFit).toBeGreaterThanOrEqual(7);
  expect(heavy.selectionEvidence.cream.alternatives.map(item => item.productId)).not.toContain(original.products.cream.id);
  expect(Object.values(buildDynamicRoutine(5, { ...context, irritated: ["불편했던 크림"] }).products).every(p => !p)).toBe(true);
});
