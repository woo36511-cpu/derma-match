import { cleanAdaptiveObservationAnswers, getAdaptiveObservationQuestions } from "../data/adaptiveObservationSurvey";
import { reactionProductQuestion } from "../data/productChangeSurvey";
import { getReactionIngredientClues } from "./reactionIngredientFit";
import { getRecommendationBreakdown } from "./recommendationScoring";
import { isProductAllowedForContext } from "./productCatalog";
import { products } from "../data/products";

test("a specific reaction opens the named-product question and stale answers are dropped", () => {
  const answers = {
    routineIntake: { version: "routine-intake-v1", use: "skip" },
    reactionPattern: "특정 제품 한 가지에서만 그랬어요",
    reactionProduct: reactionProductQuestion.options.find(option => option.value === "toner").label,
    reactionProductId: 1,
  };
  expect(getAdaptiveObservationQuestions(answers).map(item => item.id)).toContain("reactionProduct");
  expect(cleanAdaptiveObservationAnswers(answers).reactionProductId).toBe(1);
  expect(cleanAdaptiveObservationAnswers({ ...answers, reactionPattern: "서로 다른 여러 제품에서 반복돼요" }).reactionProductId).toBeUndefined();
});

test("only matching ingredient families in verified formulas lower the recommendation score", () => {
  const [base] = products;
  const product = { ...base, fullIngredients: ["정제수", "parfum", "판테놀"] };
  const context = { reactionIngredientFamilies: getReactionIngredientClues(["향료"]).map(clue => clue.family) };
  expect(getRecommendationBreakdown(product, 5, context).parts.reactionFit).toBeLessThan(0);
  expect(getRecommendationBreakdown(base, 5, context).parts.reactionFit).toBeUndefined();
  expect(getRecommendationBreakdown({ ...product, evidence: {} }, 5, context).parts.reactionFit).toBeUndefined();
  expect(isProductAllowedForContext(base, "toner", { reactionProductId: base.id })).toBe(false);
});
