import { getMakeupCleansingQuestions, makeupUseQuestion } from "../data/makeupCleansingSurvey";
import { getMakeupCleansingPlan } from "./makeupCleansingPlan";

function answersFor(use, removal) {
  const answers = { makeupUse: makeupUseQuestion.options.find(option => option.value === use).label };
  const [, question] = getMakeupCleansingQuestions(answers);
  return { ...answers, makeupRemoval: question?.options.find(option => option.value === removal)?.label };
}

test("legacy or uncertain answers never guess a remover", () => {
  expect(getMakeupCleansingPlan({})).toBeNull();
  expect(getMakeupCleansingPlan(answersFor("none", "face"))).toBeNull();
  expect(getMakeupCleansingPlan(answersFor("base", "unknown"))).toBeNull();
});

test("remaining facial makeup offers a face remover unless the removal process is uncomfortable", () => {
  const answers = answersFor("base", "face");
  expect(getMakeupCleansingPlan(answers).product.name).toBe("바이오더마 센시비오 H2O");
  const action = getMakeupCleansingPlan(answers, { cleanserDiscomfort: true });
  expect(action.skipNewCleanser).toBe(true);
  expect(action.product).toBeUndefined();
});

test("cloth friction offers a rinse-off option without suggesting the scented milk for sensitive skin", () => {
  const answers = answersFor("base", "face_friction");
  expect(getMakeupCleansingPlan(answers, { sensitive: false }).product.name).toBe("라운드랩 1025 독도 클렌징 밀크");
  expect(getMakeupCleansingPlan(answers, { sensitive: true }).product).toBeNull();
});
