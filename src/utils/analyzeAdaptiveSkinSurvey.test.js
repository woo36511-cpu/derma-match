import { buildDynamicRoutine } from "./routineRecommendation";
import { hasExfoliatingActive, isSpecializedTreatmentProduct, isProductAllowedForContext } from "./productCatalog";
import { adaptiveObservationQuestions, adaptiveSupportQuestions, adaptiveValue, getAdaptiveObservationQuestions, cleanAdaptiveObservationAnswers, resolveAdaptiveObservations, ADAPTIVE_MEASUREMENT_VERSION } from "../data/adaptiveObservationSurvey";
import { analyzeAdaptiveSkinSurvey } from "./analyzeAdaptiveSkinSurvey";
import { questionsForSurveyVersion, analyzeSurveyVersion } from "./skinSurveyVersions";
import { buildSkinComparison, buildSkinMeasurement } from "./skinStateMeasurement";
import { buildCosmeticAddOnPlan } from "./cosmeticAddOnPlan";
const all = [...adaptiveObservationQuestions, ...adaptiveSupportQuestions];
const encode = values => Object.fromEntries(Object.entries(values).map(([id, value]) => [id, all.find(q => q.id === id).options.find(o => o.value === value).label]));
const base = { skinChange: "steady", observedOil: "tzone", drynessArea: "none", moisturizerUse: "comfortable", washResponse: "comfortable", reactionPattern: "none", surfaceObservation: "normal" };
const answers = (override = {}) => encode({ ...base, ...override });
const analyze = (override = {}) => analyzeAdaptiveSkinSurvey(answers(override));
test("clear answers finish without unrelated support questions", () => {
  expect(getAdaptiveObservationQuestions(answers()).map(q => q.id)).toEqual(adaptiveObservationQuestions.filter(q => q.id !== "drynessTiming").map(q => q.id));
  expect(analyze().observationAssessment.status).toBe("ready");
});
test("unknown/coating oil gets a location diagram and may be resolved without altering the original answer", () => {
  const a = answers({ observedOil: "coating", oilTouch: "whole" });
  expect(getAdaptiveObservationQuestions(a).find(q => q.id === "oilTouch").visual).toBe("oil_regions");
  const p = analyzeAdaptiveSkinSurvey(a);
  expect(p.skinState.oiliness).toBe(9); expect(adaptiveValue(a, "observedOil")).toBe("coating");
  expect(p.observationAssessment.resolvedWithFollowUps).toBe(true);
});
test("unknown tightness is separated into sensation, area and its course after moisturizing", () => {
  const a = answers({ drynessArea: "unknown", drynessSensation: "yes", drynessLocation: "cheeks", drynessTiming: "unknown", tightnessAfterMoisturizer: "comfortable", drynessReturn: "yes" });
  const q = getAdaptiveObservationQuestions(a).map(q => q.id);
  expect(q).toEqual(expect.arrayContaining(["drynessSensation", "drynessLocation", "drynessTiming", "tightnessAfterMoisturizer", "drynessReturn"]));
  expect(analyzeAdaptiveSkinSurvey(a).skinState.dryness).toBe(6);
});
test("before/after, different areas and different days receive contextual resolution", () => {
  const conflict = { drynessArea: "cheeks", drynessTiming: "persistent", moisturizerUse: "comfortable" };
  expect(analyze({ ...conflict, drynessContext: "before_after", contextReturn: "no" }).skinState.dryness).toBe(3);
  const areas = analyze({ ...conflict, drynessContext: "area", contextDryArea: "cheeks", contextDryTiming: "day" });
  expect(areas.skinState.dryness).toBe(6); expect(areas.observationAssessment.typeComplete).toBe(true);
  const days = analyze({ ...conflict, drynessContext: "days", contextDryArea: "none" });
  expect(days.observationAssessment.recentChange).toBe(true); expect(days.skinState.dryness).toBe(0);
});
test("no tightness plus remaining tightness is clarified, never silently averaged", () => {
  const a = answers({ moisturizerUse: "persistent", drynessContext: "persistent", contextDryArea: "whole" });
  expect(getAdaptiveObservationQuestions(a).map(q => q.id)).toContain("drynessContext");
  expect(analyzeAdaptiveSkinSurvey(a).skinState.dryness).toBe(8);
});
test("genuinely simultaneous oily T-zone and dry cheeks are not a contradiction", () => {
  const a = answers({ drynessArea: "cheeks", drynessTiming: "day" });
  expect(getAdaptiveObservationQuestions(a).map(q => q.id)).not.toContain("drynessContext");
  expect(analyzeAdaptiveSkinSurvey(a).skinType).toBe("복합성 성향");
});
test("an unresolved axis preserves another observed axis and gives scoped basic candidates", () => {
  const p = analyze({ drynessArea: "unknown", drynessSensation: "unknown" });
  expect(p.skinState.dryness).toBeNull(); expect(p.skinState.oiliness).toBe(5);
  expect(p.observationAssessment.status).toBe("partial"); expect(p.observationAssessment.canRecommendBasics).toBe(true);
  expect(p.observationAssessment.canRecommendActives).toBe(false); expect(p.hydrationLevel).toBe(7);
  expect(p.observationAssessment.careActions.length).toBeGreaterThan(0);
});
test("all unknown answers get finite help, no invented zeros, and actionable general guidance", () => {
  const a = encode(Object.fromEntries(all.map(q => [q.id, "unknown"])));
  expect(getAdaptiveObservationQuestions(a).length).toBeGreaterThan(9);
  const p = analyzeAdaptiveSkinSurvey(a);
  expect(p.skinType).toBe("기본 관리부터 시작"); expect(Object.values(p.skinState).every(v => v === null)).toBe(true);
  expect(p.hydrationLevel).toBeNull(); expect(p.observationAssessment.canRecommendBasics).toBe(false);
  expect(p.observationAssessment.careActions.length).toBeGreaterThan(0); expect(p.observationAssessment.nextObservations.length).toBeGreaterThan(0);
});
test("unknown surface can be clarified by the person's experience, and stinging does not fabricate a visible lesion", () => {
  const calm = analyze({ surfaceObservation: "unknown", surfaceCheck: "unknown", surfaceComfort: "normal" });
  expect(calm.observationAssessment.canRecommendBasics).toBe(true);
  const p = analyze({ surfaceObservation: "unknown", surfaceCheck: "unknown", surfaceComfort: "stings" });
  expect(p.observationAssessment.currentIrritation).toBe(true); expect(p.observationAssessment.canRecommendBasics).toBe(false);
  expect(p.skinState.barrierStress).toBeNull();
});
test("unknown moisturizer can be identified as non-use without manufacturing damage", () => {
  const p = analyze({ moisturizerUse: "unknown", moisturizerIdentity: "no" });
  expect(p.observationAssessment.resolvedObservations.moisturizerUse).toBe("none");
  expect(p.skinState.barrierStress).toBe(0);
});
test("changing parent answers clears obsolete helper, timing and context answers", () => {
  const a = answers({ observedOil: "unknown", oilTouch: "whole", drynessArea: "unknown", drynessSensation: "yes", drynessLocation: "cheeks", drynessTiming: "persistent", drynessContext: "days", contextDryArea: "whole", contextDryTiming: "day" });
  const next = cleanAdaptiveObservationAnswers({ ...a, ...encode({ observedOil: "none", drynessArea: "none" }) });
  expect(next.oilTouch).toBeUndefined(); expect(next.drynessLocation).toBeUndefined(); expect(next.drynessTiming).toBeUndefined(); expect(next.drynessContext).toBeUndefined();
  expect(resolveAdaptiveObservations(next).drynessArea).toBe("none");
});
test("previous survey versions retain their exact question sets and scales", () => {
  expect(questionsForSurveyVersion("observed-skin-v2", {})).toHaveLength(7);
  expect(questionsForSurveyVersion("legacy-skin-v1", {})).toHaveLength(10);
  expect(analyzeSurveyVersion("observed-skin-v2", {}).measurementVersion).toBe("observed-skin-axes-v2");
  const p = analyze();
  const before = buildSkinMeasurement(p.skinState, null, "survey", "observed-skin-axes-v2");
  const after = buildSkinMeasurement(p.skinState, null, "survey", ADAPTIVE_MEASUREMENT_VERSION);
  expect(buildSkinComparison(before, after).comparisonStatus).toBe("version_mismatch");
});
test("partial answers cannot unlock a new active cosmetic", () => {
  const p = analyze({ drynessArea: "unknown" });
  const addon = buildCosmeticAddOnPlan({ goal: "tone", comfort: "comfortable", actives: ["none"], experience: "tolerated", special: "none" }, { profile: p });
  expect(addon.product).toBeNull(); expect(addon.title).toMatch(/기본/);
});

test("partial basics do not gain a treatment product through the recommendation fallback", () => {
  for (const values of [{ drynessArea: "unknown" }, { observedOil: "unknown", drynessArea: "whole", drynessTiming: "day", moisturizerUse: "persistent" }]) {
    const p = analyze(values);
    const routine = buildDynamicRoutine(p.hydrationLevel, { mainConcern: "none", careNeeds: p.careNeeds, basicOnly: true });
    expect(Object.values(routine.products).filter(Boolean)).toHaveLength(4);
    for (const [category, product] of Object.entries(routine.products)) {
      expect(hasExfoliatingActive(product)).toBe(false);
      if (category !== "cleanser") expect(isSpecializedTreatmentProduct(product)).toBe(false);
    }
  }
  expect(isProductAllowedForContext({ ingredients: ["살리실산"], isAvailable: true }, "toner", { basicOnly: true })).toBe(false);
});

test("known traits remain visible when present comfort cannot yet be confirmed", () => {
  const p = analyze({ surfaceObservation: "unknown", surfaceCheck: "unknown", surfaceComfort: "unknown" });
  expect(p.skinType).toBe("복합성 성향"); expect(p.observationAssessment.canRecommendBasics).toBe(false);
  expect(p.observationAssessment.careActions.length).toBeGreaterThan(0);
  expect(p.skinState.barrierStress).toBeNull();
});
