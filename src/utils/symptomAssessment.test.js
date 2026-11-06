import { assessSymptoms, getRoutineSafety, applyRoutineSafety, getFeedbackRoutineSafety } from "./symptomAssessment";
import { getVisibleSymptomQuestions, cleanSymptomAnswers } from "../data/symptomQuestions";
import { analyzeInflammatoryAcneGuide } from "./skinIssues/analyzeInflammatoryAcneGuide";
import { analyzeBlackheadSebumGuide } from "./skinIssues/analyzeBlackheadSebumGuide";
import { analyzeClosedComedoneGuide } from "./skinIssues/analyzeClosedComedoneGuide";

const base = {
  concern: "breakouts", breathing: "no", eyeWarning: "no", eruption: "yes", change: "stable", surface: "intact",
  barrier: "none", habit: "observe",
  area: "face", form: "mixed", comedones: "yes", uniform: "no", itch: "none", follicular: "no",
  shaving: "no", pain: "none", duration: "under_week", recentProduct: "none",
};
const assess = changes => assessSymptoms({ ...base, ...changes });

test("the survey stays on skin and topical products, including the breakout path", () => {
  expect(getVisibleSymptomQuestions({})[0].id).toBe("concern");
  const normal = getVisibleSymptomQuestions({ concern: "none", habit: "observe" });
  expect(normal.map(question => question.id)).toEqual(["concern", "barrier", "habit"]);
  const breakouts = getVisibleSymptomQuestions(base).map(question => question.id);
  expect(breakouts).toEqual(expect.arrayContaining(["duration", "area", "form", "recentProduct"]));
  for (const id of ["breathing", "eyeWarning", "risk", "exposure", "gut", "probiotic", "vegetables", "treatmentDuration", "uniform"]) {
    expect(breakouts).not.toContain(id);
  }
  expect(assess({ concern: "none", breathing: "yes", change: "rapid" })).toMatchObject({ urgency: "self_care", blockRoutine: false });
});

test("an urgent answer about the skin or eye still stops product recommendations immediately", () => {
  expect(assessSymptoms({ concern: "sudden", breathing: "yes" })).toMatchObject({ complete: true, urgency: "emergency", blockRoutine: true });
  for (const answers of [{ concern: "breakouts", change: "rapid" }, { concern: "sudden", breathing: "no", eyeWarning: "yes" }]) {
    const result = assessSymptoms(answers);
    expect(result).toMatchObject({ complete: true, urgency: "urgent", blockRoutine: true });
    expect(applyRoutineSafety({ products: { serum: { id: 25 } } }, getRoutineSafety(result)).products).toEqual({});
  }
});

test("incomplete or uncertain answers never become a confident diagnosis or medication recommendation", () => {
  expect(assessSymptoms({})).toMatchObject({ complete: false, blockRoutine: true });
  for (const key of ["change", "form", "comedones", "itch", "surface"]) {
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

test.each([{ form: "deep" }, { pain: "severe" }, { surface: "damaged" }])("deep, painful, scar-forming or damaged-skin cases require clinical review: %j", changes => {
  expect(assess(changes)).toMatchObject({ complete: true, urgency: "clinic", blockRoutine: true });
});

test("an existing prescription on the same area holds new product recommendations without asking for the drug type", () => {
  const result = assess({ recentProduct: "prescribed" });
  expect(result).toMatchObject({ blockRoutine: true, allowMedicationRecommendation: false });
  expect(result.answers).not.toHaveProperty("treatment");
  expect(result.nextAction).toContain("새 기능성 화장품");
});

test("worsening, irritation and persistent folliculitis-like symptoms hold new product recommendations", () => {
  expect(assess({ change: "worse" }).blockRoutine).toBe(true);
  expect(assess({ change: "irritation" }).blockRoutine).toBe(true);
  expect(assess({ form: "pustules", comedones: "no", follicular: "yes", duration: "two_six_weeks" }).urgency).toBe("clinic");
  expect(getFeedbackRoutineSafety(assess({}), { trouble: { value: 2 } }).blocked).toBe(true);
  expect(getFeedbackRoutineSafety(assess({}), { irritation: { label: "바르면 바로 불편함" } }).blocked).toBe(true);
});

test("conditional changes remove old broad health and hidden shaving answers and reject unlisted values", () => {
  const clean = cleanSymptomAnswers({ ...base, treatmentDuration: "twelve_plus", gut: "loose", probiotic: "recent", ingrown: "yes", bogus: "yes" });
  expect(clean).not.toHaveProperty("treatmentDuration");
  expect(clean).not.toHaveProperty("gut");
  expect(clean).not.toHaveProperty("probiotic");
  expect(clean).not.toHaveProperty("ingrown");
  expect(clean).not.toHaveProperty("bogus");
  expect(assessSymptoms({ ...base, form: "made_up" }).complete).toBe(false);
  const noRash = { ...base, concern: "none" };
  expect(getVisibleSymptomQuestions(noRash).every(q => !q.detail)).toBe(true);
  expect(assessSymptoms(noRash).blockRoutine).toBe(false);
  expect(getRoutineSafety(assess({}), { careLevel: "clinic_priority", summary: "진료" }).blocked).toBe(true);
});
