import { cleanAdaptiveObservationAnswers, getAdaptiveObservationQuestions } from "../data/adaptiveObservationSurvey";
import { observationQuestions } from "../data/observationSurvey";
import { productChangeQuestions } from "../data/productChangeSurvey";
import { getCatalogChangeFormula, getIngredientClue } from "./productChangeReview";
import { getRoutineLookupProduct } from "./routineLookup";

const label = (question, value) => question.options.find(option => option.value === value).label;
const change = observationQuestions.find(item => item.id === "skinChange");
const [product, reaction] = productChangeQuestions;
const answers = {
  routineIntake: { version: "routine-intake-v1", use: "yes" },
  skinChange: label(change, "product"),
  changedProduct: label(product, "toner"),
  changedProductId: 1,
  changedReaction: [label(reaction, "red"), label(reaction, "dry")],
};

test("product changes ask for the product and allow multiple changes without keeping stale selections", () => {
  expect(getAdaptiveObservationQuestions(answers).slice(0, 3).map(item => item.id)).toEqual(["skinChange", "changedProduct", "changedReaction"]);
  expect(cleanAdaptiveObservationAnswers(answers)).toMatchObject(answers);
  const steady = cleanAdaptiveObservationAnswers({ ...answers, skinChange: label(change, "steady") });
  expect(steady.changedProductId).toBeUndefined();
  expect(steady.changedReaction).toBeUndefined();
  expect(cleanAdaptiveObservationAnswers({ ...answers, changedProduct: label(product, "serum") }).changedProductId).toBeUndefined();
});

test("a clue requires a verified ingredient and a compatible reaction", () => {
  const known = getCatalogChangeFormula(getRoutineLookupProduct(1));
  expect(known.ingredients).toContain("글리세린");
  expect(getIngredientClue(known.ingredients, ["better"]).ingredient).toBe("글리세린");
  expect(getIngredientClue(known.ingredients, ["red"])).toBeNull();
  expect(getIngredientClue(["레티놀"], ["dry"]).ingredient).toBe("레티놀");
  expect(getIngredientClue(["향료"], ["sting"]).ingredient).toBe("향료");
  expect(getIngredientClue(["향료"], ["bumps"])).toBeNull();
  expect(getCatalogChangeFormula(getRoutineLookupProduct("lookup:iope:37"))).toBeNull();
});
