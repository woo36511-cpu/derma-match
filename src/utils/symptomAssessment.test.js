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

test("sudden swelling bypasses follow-up questions and urgent answers stop recommendations", () => {
  expect(getVisibleSymptomQuestions({ concern: "sudden" }).map(q => q.id)).toEqual(["concern"]);
  for (const answers of [{ concern: "breakouts", change: "rapid" }, { concern: "sudden" }]) {
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

const noseCase = {
  ...base, concern: "breakouts", area: "nose_skin", noseExtent: "local", form: "deep",
  pain: "mild", basicRoutine: "both", secondaryConcerns: ["none"],
  noseMedication: "patima", noseMedicationDuration: "few_days", noseMedicationResponse: "unchanged",
};
const assessNose = changes => assessSymptoms({ ...noseCase, ...changes }, { guided: true });

test("a recent localized outer nose bump checks existing medication before offering home care", () => {
  const result = assessNose({});
  expect(result).toMatchObject({ complete: true, urgency: "review", blockRoutine: true, allowMedicationRecommendation: false });
  expect(result.nextAction).toContain("사용 1~3일");
  expect(result.nextAction).toContain("추가하지 마세요");
});

test("nose spread interrupts the survey and keeps urgent care", () => {
  expect(assessNose({ noseExtent: "spreading" }))
    .toMatchObject({ complete: true, urgency: "urgent", blockRoutine: true });
});

test.each([
  { pain: "severe" }, { surface: "damaged" }, { duration: "long" },
  { change: "worse" },
])("localized home care does not bypass a higher-risk nose answer: %j", change => {
  expect(assessNose(change).urgency).not.toBe("review");
});

test("inside nostril symptoms are not treated as ordinary outer skin acne", () => {
  const result = assessNose({ area: "nose_inside" });
  expect(result).toMatchObject({ complete: true, urgency: "clinic", blockRoutine: true });
  expect(result.nextAction).toContain("콧구멍 안에");
});

test("new irritation from patima prompts a pause rather than another acne medicine", () => {
  expect(assessNose({ noseMedicationResponse: "irritated" }).nextAction).toContain("파티마겔은 중단");
});

test("changing medication clears hidden duration and response answers", () => {
  const cleaned = cleanSymptomAnswers({ ...noseCase, noseMedication: "none" }, { guided: true });
  expect(cleaned).not.toHaveProperty("noseMedicationDuration");
  expect(cleaned).not.toHaveProperty("noseMedicationResponse");
});

test("uncertain nose extent never authorizes routine or new medicine", () => {
  expect(assessNose({ noseExtent: "unknown" })).toMatchObject({ blockRoutine: true, allowMedicationRecommendation: false });
});
