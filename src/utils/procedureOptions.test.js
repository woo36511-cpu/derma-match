import { buildSimpleCarePlan } from "./simpleCarePlan";
import { getProcedureTopics } from "./procedureOptions";

const profile = { observationAssessment: { canRecommendBasics: true, currentIrritation: false } };
const topics = (answers, skin = profile) => getProcedureTopics(buildSimpleCarePlan(answers), skin);
const acne = { concern: "acne", areaState: "comfortable", medicine: "none", breakoutExtent: "local" };

test("only clearly scoped acne and marks have matching procedure topics", () => {
  expect(topics({ ...acne, shape: "deep" })).toEqual(["deep"]);
  expect(topics({ ...acne, shape: "deep", breakoutExtent: "unknown" })).toEqual([]);
  expect(topics({ ...acne, shape: "blackhead" })).toEqual(["extraction"]);
  expect(topics({ ...acne, shape: "blackhead", areaState: "dry" })).toEqual([]);
  expect(topics({ ...acne, shapes: ["red_mark", "dark_mark"], primaryShape: "red_mark" })).toEqual(["red_mark", "dark_mark"]);
  expect(topics({ ...acne, shape: "unknown" })).toEqual([]);
  expect(topics({ ...acne, concern: "folliculitis" })).toEqual([]);
});

test("safety holds suppress the elective entry and basic results require a separate choice", () => {
  expect(topics({ ...acne, shape: "raised_scar", areaState: "concerning" })).toEqual([]);
  expect(topics({ ...acne, shape: "red_mark", areaState: "irritated" })).toEqual([]);
  expect(topics({ ...acne, shape: "red_mark" }, { observationAssessment: { currentIrritation: true } })).toEqual([]);
  expect(topics({ concern: "none" })).toEqual(["pores", "expression", "vessels"]);
  expect(topics({ concern: "none" }, { observationAssessment: { canRecommendBasics: false } })).toEqual([]);
});
