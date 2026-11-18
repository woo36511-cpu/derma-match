import { adaptiveObservationQuestions, getAdaptiveObservationQuestions, cleanAdaptiveObservationAnswers } from "../data/adaptiveObservationSurvey";
import { analyzeAdaptiveSkinSurvey } from "./analyzeAdaptiveSkinSurvey";
import { searchRoutineProducts } from "./routineLookup";
import { getRoutinePreferences } from "./routineAdvice";
import { buildRoutineSurveyContext, getCurrentRoutineContext } from "./currentRoutineReview";

test("redness without stinging can be reported and clarified without overwriting tightness", () => {
  const wash = adaptiveObservationQuestions.find(q => q.id === "washResponse");
  const answers = { washResponse: wash.options.find(o => o.value === "tight_red").label };
  const duration = getAdaptiveObservationQuestions(answers).find(q => q.id === "washRednessDuration");
  expect(analyzeAdaptiveSkinSurvey({ ...answers, washRednessDuration: duration.options[0].label }).observationAssessment.resolvedObservations.washResponse).toBe("tight");
  expect(analyzeAdaptiveSkinSurvey({ ...answers, washRednessDuration: duration.options[1].label }).observationAssessment.currentIrritation).toBe(true);
  expect(cleanAdaptiveObservationAnswers({ washResponse: wash.options[0].label, washRednessDuration: duration.options[1].label })).not.toHaveProperty("washRednessDuration");
});

test("an all-in-one moisturiser enters the survey as one existing step without inferring its formula", () => {
  const { matches } = searchRoutineProducts("", 12, true);
  const lotion = matches.find(p => p.id === "lookup:roundlab:234");
  expect(searchRoutineProducts("all-in-one").matches).toContainEqual(lotion);
  const context = buildRoutineSurveyContext("yes", [{ id: lotion.id, reaction: "heavy" }]);
  expect(context.cream).toMatchObject({ band: "unknown", reaction: "heavy", allInOne: true });
  expect(context).not.toHaveProperty("toner");
  expect(getAdaptiveObservationQuestions({ routineIntake: context }).find(q => q.id === "moisturizerUse").question).toMatch(/올인원/);
});

test("survey discomfort can unlock a replacement for an all-in-one without a separate product rating", () => {
  const current = getCurrentRoutineContext([{ id: "lookup:roundlab:234", reaction: null }]);
  expect(getRoutinePreferences(current, { moisturizerUse: "comfortable" }).suppressedSlots.has("cream")).toBe(true);
  expect(getRoutinePreferences(current, { moisturizerUse: "heavy" }).suppressedSlots.has("cream")).toBe(false);
});
