import { buildSimpleCarePlan } from "./simpleCarePlan";
import { cleanSimpleCareAnswers, isSimpleCareComplete } from "../data/simpleCare";
import { buildDynamicRoutine } from "./routineRecommendation";
import { hasExfoliatingActive } from "./productCatalog";

const acne = { concern: "acne", shape: "red", areaState: "comfortable", breakoutExtent: "local", medicine: "none" };
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
test("mixed observations require a selected priority and keep only valid per-concern locations", () => {
  const input = { ...acne, shapes: ["red", "closed", "dark_mark", "red", "unknown"], primaryShape: "dark_mark", locations: { red: "chin", closed: "forehead", dark_mark: "cheeks", deep: "nose" } };
  expect(isSimpleCareComplete({ ...input, primaryShape: "deep" })).toBe(false);
  const plan = buildSimpleCarePlan(input);
  expect(plan.answers.shapes).toEqual(["closed", "red", "dark_mark"]);
  expect(plan.answers.locations).toEqual({ red: "chin", closed: "forehead", dark_mark: "cheeks" });
  expect(plan.concernSummary.primary).toMatchObject({ shape: "dark_mark", area: "볼" });
  expect(plan.pharmacy).toBeNull();
  expect(plan.careReview).toBeNull();
});
test("salicylic acid for a primary comedone is withheld unless the inflamed area is explicitly distinct", () => {
  const mixed = { ...acne, shapes: ["closed", "red"], primaryShape: "closed" };
  expect(buildSimpleCarePlan(mixed).pharmacy).toBeNull();
  expect(buildSimpleCarePlan({ ...mixed, locations: { closed: "chin", red: "chin" } }).pharmacy).toBeNull();
  expect(buildSimpleCarePlan({ ...mixed, locations: { closed: "forehead", red: "chin" } }).pharmacy.name).toContain("클리어틴");
  expect(buildSimpleCarePlan({ ...mixed, shapes: ["closed", "deep"], locations: { closed: "forehead", deep: "chin" } }).pharmacy).toBeNull();
});
test.each(["dark_mark", "red_mark", "indented_scar", "raised_scar"])("a flat mark or suspected scar (%s) never falls into the active acne medicine path", shape => {
  const plan = buildSimpleCarePlan({ ...acne, shapes: [shape] });
  expect(plan.complete).toBe(true);
  expect(plan.pharmacy).toBeNull();
  expect(plan.careReview).toBeNull();
  expect(buildSimpleCarePlan({ ...acne, shapes: [shape], areaState: "concerning" }).blockNewBasics).toBe(true);
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

test("reviewing a current product distinguishes improvement, a use mismatch, and an unknown product", () => {
  const base = { concern: "acne", shape: "red", areaState: "comfortable", breakoutExtent: "local", duration: "few_weeks" };
  const improving = buildSimpleCarePlan({ ...base, medicine: "patima", response: "better" });
  expect(improving.title).toContain("유지");
  expect(improving.pharmacy).toBeNull();
  const mismatch = buildSimpleCarePlan({ ...base, medicine: "clearteen", response: "same" });
  expect(mismatch).toMatchObject({ replacementOnly: true, pharmacy: { name: "애크논크림" } });
  expect(buildSimpleCarePlan({ ...base, medicine: "clearteen", response: "same", breakoutExtent: "multiple" }).pharmacy).toBeNull();
  expect(buildSimpleCarePlan({ ...base, medicine: "salicylic", response: "same" }).pharmacy).toBeNull();
});

test.each(["dark_mark", "red_mark", "indented_scar", "raised_scar"])("evaluates a local active breakout independently of %s", trace => {
  const input = { ...acne, shapes: ["pus", trace], primaryShape: trace, areaState: "irritated" };
  for (const state of ["overlap", "unknown", undefined]) {
    expect(buildSimpleCarePlan({ ...input, breakoutSiteState: state }).separateBreakout?.pharmacy ?? null).toBeNull();
  }
  const isolated = { ...input, breakoutSiteState: "separate_comfortable" };
  expect(buildSimpleCarePlan(isolated)).toMatchObject({ blockNewBasics: true, pharmacy: null, separateBreakout: { shape: "pus", pharmacy: { name: "애크논크림" } } });
  for (const extent of ["crowded", "multiple", "unknown"]) {
    expect(buildSimpleCarePlan({ ...isolated, breakoutExtent: extent }).separateBreakout.pharmacy).toBeNull();
  }
  expect(buildSimpleCarePlan({ ...isolated, medicine: "prescribed", duration: "long", response: "same" }).separateBreakout.pharmacy).toBeNull();
  expect(buildSimpleCarePlan({ ...isolated, medicine: "patima", duration: "long", response: "worse" }).separateBreakout.pharmacy).toBeNull();
  expect(buildSimpleCarePlan({ ...isolated, areaState: "concerning" }).separateBreakout).toBeNull();
});
