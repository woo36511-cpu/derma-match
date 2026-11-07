import { buildSimpleCarePlan } from "./simpleCarePlan";
import { cleanSimpleCareAnswers, isSimpleCareComplete } from "../data/simpleCare";
import { buildDynamicRoutine } from "./routineRecommendation";
import { hasExfoliatingActive } from "./productCatalog";

const acne = { concern: "acne", shape: "red", areaState: "comfortable", medicine: "none" };
test("existing active products and uncertain products never receive another OTC candidate", () => {
  for (const medicine of ["patima", "acnon", "salicylic", "prescribed", "other", "unknown"]) {
    for (const response of ["better", "same", "irritated", "worse", "unknown"]) {
      const plan = buildSimpleCarePlan({ ...acne, medicine, duration: "few_days", response });
      expect(plan.complete).toBe(true); expect(plan.pharmacy).toBeNull();
    }
  }
});
test("irritation, rapid spread, and worsening suppress new product lists", () => {
  for (const update of [{ areaState: "concerning" }, { areaState: "irritated" }, { medicine: "patima", duration: "long", response: "worse" }]) {
    const plan = buildSimpleCarePlan({ ...acne, ...update });
    expect(plan.complete).toBe(true); expect(plan.pharmacy).toBeNull(); expect(plan.blockNewBasics).toBe(true);
  }
});
test("dry or uncertain skin does not get salicylic acid for comedones", () => {
  for (const shape of ["closed", "blackhead"]) for (const areaState of ["dry", "unknown"]) {
    expect(buildSimpleCarePlan({ ...acne, shape, areaState }).pharmacy).toBeNull();
  }
});
test("upstream changes remove hidden medicine answers and still require visible answers", () => {
  const earlier = { ...acne, medicine: "patima", duration: "few_days", response: "same" };
  expect(cleanSimpleCareAnswers({ ...earlier, concern: "none" })).toEqual({ concern: "none" });
  const noMedicine = cleanSimpleCareAnswers({ ...earlier, medicine: "none" });
  expect(noMedicine.duration).toBeUndefined(); expect(noMedicine.response).toBeUndefined();
  expect(isSimpleCareComplete({ concern: "acne", shape: "red" })).toBe(false);
  expect(buildSimpleCarePlan({ concern: "acne", shape: "red" }).pharmacy).toBeNull();
});
test("four basic categories stay free of exfoliants and targeted treatments across hydration levels", () => {
  for (let level = 1; level <= 10; level++) {
    const routine = buildDynamicRoutine(level, { mainConcern: "none", isSensitive: true });
    expect(Object.keys(routine.products)).toEqual(["cleanser", "toner", "serum", "cream"]);
    for (const product of Object.values(routine.products)) {
      expect(product).toBeTruthy(); expect(hasExfoliatingActive(product)).toBe(false); expect((product.concerns ?? []).some(concern => ["acne", "closed_comedones", "blackhead", "deadskin"].includes(concern))).toBe(false);
    }
  }
});
