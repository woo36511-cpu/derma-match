import { observationQuestions, drynessClarification, getObservationQuestions, cleanObservationAnswers, OBSERVATION_MEASUREMENT_VERSION } from "../data/observationSurvey";
import { analyzeObservationSurvey } from "./analyzeObservationSurvey";
import { buildSkinMeasurement, buildSkinComparison } from "./skinStateMeasurement";
import { buildCosmeticAddOnPlan } from "./cosmeticAddOnPlan";
const encode = values => Object.fromEntries(Object.entries(values).map(([id, value]) => [id, [...observationQuestions, drynessClarification].find(q => q.id === id)?.options.find(o => o.value === value)?.label]));
const base = { skinChange: "steady", observedOil: "none", drynessArea: "none", moisturizerUse: "comfortable", reactionPattern: "none", washResponse: "comfortable", surfaceObservation: "normal" };
const profile = values => analyzeObservationSurvey(encode({ ...base, ...values }));
test("unknown is not normal or a measured zero", () => {
  const p = analyzeObservationSurvey({});
  expect(p.skinType).toBe("피부 성향 판단 보류"); expect(p.hydrationLevel).toBeNull();
  expect(p.observationAssessment.canRecommendBasics).toBe(false);
  expect(Object.values(p.skinState).every(v => v === null)).toBe(true);
  expect(profile({}).skinType).toBe("중성 성향");
});
test("non-use, heavy moisturizer and unrelated legacy answers do not manufacture oily or damaged skin", () => {
  for (const moisturizerUse of ["none", "heavy", "comfortable"]) {
    const p = profile({ moisturizerUse });
    expect(p.skinState.oiliness).toBe(0); expect(p.skinState.barrierStress).toBe(0);
  }
  const plain = analyzeObservationSurvey(encode(base));
  const extra = analyzeObservationSurvey({ ...encode(base), routineLevel: "거의 안 함", lifestyle: ["잠이 부족하다"], poreSebum: "모공이 신경 쓰여요" });
  expect(extra.skinState).toEqual(plain.skinState);
});
test("one product reaction does not imply recurrent sensitivity", () => {
  expect(profile({ reactionPattern: "one" }).skinState.sensitivity).toBeNull();
  expect(profile({ reactionPattern: "repeated" }).skinState.sensitivity).toBe(8);
});
test("oily and persistently tight observations coexist without measuring water deficiency", () => {
  const p = profile({ observedOil: "whole", drynessArea: "whole", drynessTiming: "persistent", moisturizerUse: "persistent" });
  expect(p.skinType).toBe("유분·당김 동반"); expect(p.hydrationLevel).toBe(5);
  expect(p.careNeeds.hydrationNeed).toBeGreaterThan(profile({}).careNeeds.hydrationNeed);
  expect(p.skinState.dehydration).toBeNull(); expect(p.skinState.acneActivity).toBeNull();
});
test("contradicting answers add a clarification and unresolved answers hold selection", () => {
  const a = encode({ ...base, drynessArea: "cheeks", drynessTiming: "persistent" });
  expect(getObservationQuestions(a)).toHaveLength(9);
  expect(analyzeObservationSurvey(a).observationAssessment.status).toBe("inconsistent");
  expect(analyzeObservationSurvey(a).hydrationLevel).toBeNull();
  const resolved = { ...a, ...encode({ drynessClarification: "comfortable" }) };
  expect(analyzeObservationSurvey(resolved).observationAssessment.canRecommendBasics).toBe(true);
  const changed = cleanObservationAnswers({ ...resolved, ...encode({ drynessArea: "none" }) });
  expect(changed.drynessTiming).toBeUndefined(); expect(changed.drynessClarification).toBeUndefined();
  expect(getObservationQuestions(changed)).toHaveLength(7);
});
test("recent changes keep the type provisional and suppress active add-ons", () => {
  const p = profile({ skinChange: "product" }); expect(p.observationAssessment.status).toBe("provisional");
  const addon = buildCosmeticAddOnPlan({ goal: "tone", comfort: "comfortable", actives: ["none"], experience: "tolerated", special: "none" }, { profile: p, surveyAnswers: encode(base) });
  expect(addon.product).toBeNull(); expect(addon.title).toMatch(/최근 변한/);
});
test("current irritation withholds new products even with known type observations", () => {
  const p = profile({ moisturizerUse: "stings" });
  expect(p.observationAssessment.currentIrritation).toBe(true);
  expect(p.observationAssessment.canRecommendBasics).toBe(false); expect(p.hydrationLevel).toBeNull();
});
test("new ordinal scores never compare against the previous scale", () => {
  const p = profile({}); const old = buildSkinMeasurement(p.skinState, "2026-01-01");
  const current = buildSkinMeasurement(p.skinState, "2026-01-02", "survey", OBSERVATION_MEASUREMENT_VERSION);
  expect(buildSkinComparison(old, current).comparisonStatus).toBe("version_mismatch");
  const compared = buildSkinComparison(current, current);
  expect(compared.comparableAxisCount).toBe(4); expect(compared.delta.acneActivity).toBeNull();
});
