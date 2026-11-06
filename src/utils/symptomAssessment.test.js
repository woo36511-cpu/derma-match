import { assessSymptoms, getRoutineSafety, applyRoutineSafety, getFeedbackRoutineSafety } from "./symptomAssessment";
import { getVisibleSymptomQuestions, cleanSymptomAnswers } from "../data/symptomQuestions";
import { analyzeInflammatoryAcneGuide } from "./skinIssues/analyzeInflammatoryAcneGuide";
import { analyzeBlackheadSebumGuide } from "./skinIssues/analyzeBlackheadSebumGuide";
import { analyzeClosedComedoneGuide } from "./skinIssues/analyzeClosedComedoneGuide";

const base = {
  concern: "breakouts", breathing: "no", infectionWarning: "none", eruption: "yes", change: "stable", risk: "no", surface: "intact",
  barrier: "none", gut: "none", vegetables: "sometimes", probiotic: "none", habit: "observe",
  area: "face", form: "mixed", comedones: "yes", uniform: "no", itch: "none", follicular: "no",
  shaving: "no", sweat: "no", exposure: "none", pain: "none", duration: "under_week", treatment: "none",
};
const assess = changes => assessSymptoms({ ...base, ...changes });

test("every check starts with a skin concern, and ordinary care does not ask about breathing or gut health", () => {
  expect(getVisibleSymptomQuestions({})[0].id).toBe("concern");
  const normal = getVisibleSymptomQuestions({ concern: "none", habit: "observe" });
  expect(normal.map(question => question.id)).toEqual(["concern", "barrier", "habit"]);
  const selected = getVisibleSymptomQuestions({ concern: "dry", habit: "vegetables" });
  expect(selected.map(question => question.id)).toContain("vegetables");
  expect(selected.map(question => question.id)).not.toContain("probiotic");
  expect(assess({ concern: "none", breathing: "yes", infectionWarning: "rapid" })).toMatchObject({ urgency: "self_care", blockRoutine: false });
});

test("acute warning signs outrank every cosmetic and supplement path, even with otherwise missing answers", () => {
  expect(assessSymptoms({ concern: "sudden", breathing: "yes" })).toMatchObject({ complete: true, urgency: "emergency", blockRoutine: true, candidates: [] });
  for (const infectionWarning of ["spreading_fever", "eye", "rapid"]) {
    const result = assessSymptoms({ concern: "breakouts", infectionWarning });
    expect(result).toMatchObject({ complete: true, urgency: "urgent", blockRoutine: true });
    expect(applyRoutineSafety({ products: { serum: { id: 25 } } }, getRoutineSafety(result)).products).toEqual({});
  }
});

test("incomplete or uncertain answers never become a confident diagnosis or medication recommendation", () => {
  expect(assessSymptoms({})).toMatchObject({ complete: false, blockRoutine: true });
  for (const key of ["infectionWarning", "risk", "change", "form", "comedones", "itch", "exposure"]) {
    expect(assess({ [key]: "unknown" })).toMatchObject({ blockRoutine: true, diagnosticStatus: "not_diagnosed", allowMedicationRecommendation: false });
  }
  expect(getRoutineSafety(null).blocked).toBe(true);
  expect(getRoutineSafety({ ...assess({}), ruleVersion: "old" }).blocked).toBe(true);
});

test("itchy uniform pustules can overlap fungal and bacterial patterns without choosing a pathogen or a drug", () => {
  const result = assess({ area: "trunk", form: "pustules", comedones: "no", uniform: "yes", itch: "strong", follicular: "yes" });
  expect(result.complete).toBe(true);
  expect(result.candidates.map(item => item.key)).toEqual(["malassezia", "folliculitis"]);
  expect(result).toMatchObject({ urgency: "pharmacy", blockRoutine: true, clinicalValidation: "not_validated", allowMedicationRecommendation: false });
  expect(result.candidates.every(candidate => candidate.limitation)).toBe(true);
});

test("shaving-associated pustules are not automatically routed to acne medicine", () => {
  const result = assess({ area: "shaved", form: "pustules", comedones: "no", follicular: "yes", shaving: "yes", ingrown: "yes" });
  expect(result.candidates.map(item => item.key)).toEqual(["folliculitis", "shaving"]);
  expect(result.blockRoutine).toBe(true);
  const legacy = analyzeInflammatoryAcneGuide({ form: { value: "pustule" }, shaving: { value: "daily" } });
  expect(legacy.pharmacyGuide).toBeNull();
  expect(analyzeBlackheadSebumGuide({ appearance: { value: "black_plug" }, inflammation: { value: "none" }, exfoliation: { value: "none" } }).pharmacyGuide).toBeNull();
  expect(analyzeClosedComedoneGuide({ inflammation: { value: "none" }, duration: { value: "long" } }).pharmacyGuide).toBeNull();
});

test.each([{ form: "deep" }, { pain: "severe" }, { risk: "yes" }])("deep, painful, scar-forming or vulnerable cases require clinical review: %j", changes => {
  expect(assess(changes)).toMatchObject({ complete: true, urgency: "clinic", blockRoutine: true });
});

test("no benefit after a short acne trial does not mean a different organism", () => {
  const early = assess({ change: "no_effect", treatment: "acne", treatmentDuration: "under_two", adherence: "consistent" });
  expect(early).toMatchObject({ urgency: "self_care", allowMedicationRecommendation: false });
  expect(early.candidates.map(item => item.key)).toEqual(["acne"]);
  expect(assess({ change: "no_effect", treatment: "acne", treatmentDuration: "twelve_plus", adherence: "consistent" }).urgency).toBe("clinic");
});

test("worsening, irritation and persistent folliculitis-like symptoms hold new product recommendations", () => {
  expect(assess({ change: "worse" }).blockRoutine).toBe(true);
  expect(assess({ change: "irritation" }).blockRoutine).toBe(true);
  expect(assess({ form: "pustules", comedones: "no", follicular: "yes", duration: "two_six_weeks" }).urgency).toBe("clinic");
  expect(getFeedbackRoutineSafety(assess({}), { trouble: { value: 2 } }).blocked).toBe(true);
  expect(getFeedbackRoutineSafety(assess({}), { irritation: { label: "바르면 바로 불편함" } }).blocked).toBe(true);
});

test("conditional changes remove stale medicine and shaving answers and reject unlisted values", () => {
  const clean = cleanSymptomAnswers({ ...base, treatment: "none", treatmentDuration: "twelve_plus", adherence: "consistent", ingrown: "yes", bogus: "yes" });
  expect(clean).not.toHaveProperty("treatmentDuration");
  expect(clean).not.toHaveProperty("ingrown");
  expect(clean).not.toHaveProperty("bogus");
  expect(assessSymptoms({ ...base, form: "made_up" }).complete).toBe(false);
  const noRash = { ...base, concern: "none" };
  expect(getVisibleSymptomQuestions(noRash).every(q => !q.detail)).toBe(true);
  expect(assessSymptoms(noRash).blockRoutine).toBe(false);
  expect(getRoutineSafety(assess({}), { careLevel: "clinic_priority", summary: "진료" }).blocked).toBe(true);
});
