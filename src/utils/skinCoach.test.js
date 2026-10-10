import {
  calculateNextLevel,
  buildFeedbackDataQuality,
  buildSkinStateDelta,
} from "./feedbackAnalysis";
import {
  buildDynamicRoutine,
  getRecommendedIngredients,
} from "./routineRecommendation";
import { hasExfoliatingActive, isProductAvailable } from "./productCatalog";
import { buildProductUsagePlan } from "./productUsagePlan";
import { buildJourneySummary } from "./journeySummary";

test("hydration feedback accepts numeric and option answers, limits each change and stays within 1–10", () => {
  expect(
    calculateNextLevel(5, {
      dry: -2,
      feel: { value: -2 },
      usage: { value: "consistent" },
    }),
  ).toBe(2);
  expect(calculateNextLevel(5, { oil: 2, feel: { value: 2 } })).toBe(8);
  expect(calculateNextLevel(1, { dry: -2 })).toBe(1);
  expect(calculateNextLevel(10, { oil: 2 })).toBe(10);
  expect(calculateNextLevel(5, {})).toBe(5);
});

test("BHA ingredient guidance is withheld when inflammation or irritation accompanies congestion", () => {
  expect(getRecommendedIngredients(5, { clogged: 2, trouble: 0 })).toContain(
    "BHA",
  );
  expect(
    getRecommendedIngredients(5, { clogged: 2, trouble: 1 }),
  ).not.toContain("BHA");
  expect(
    getRecommendedIngredients(5, { clogged: 2, irritated: true }),
  ).not.toContain("BHA");
});

test.each(Array.from({ length: 10 }, (_, index) => index + 1))(
  "starter recommendations at level %i contain available products without exfoliating leave-on actives",
  (level) => {
    const routine = buildDynamicRoutine(level);
    expect(Object.keys(routine.products)).toEqual([
      "cleanser",
      "toner",
      "serum",
      "cream",
    ]);
    for (const product of Object.values(routine.products)) {
      expect(isProductAvailable(product)).toBe(true);
    }
    for (const category of ["toner", "serum", "cream"]) {
      expect(hasExfoliatingActive(routine.products[category])).toBe(false);
    }
  },
);

test("usage snapshots retain evidence and recommended amount without assuming actual usage", () => {
  const product = {
    id: 99,
    name: "test cream",
    hydrationLevel: 5,
    ingredients: [],
    concerns: [],
    usageAmount: { oily: "small", normal: "medium", dry: "large" },
    usage: { when: "night" },
  };
  const [plan] = buildProductUsagePlan(
    { cream: product, toner: null },
    "수부지",
    "2026-10-10",
  );
  expect(plan.startedAt).toBe("2026-10-10");
  expect(plan.productNameSnapshot).toBe("test cream");
  expect(plan.recommendationSnapshot.recommendedAmount).toBe("small");
  expect(plan.recommendationSnapshot.evidence.evidenceLevel).toBe("unverified");
  expect(plan.actualUsage).toEqual({
    amount: null,
    frequency: null,
    stoppedEarly: null,
    stopReason: null,
  });
});

test("short or inconsistent use and confounding changes lower feedback confidence", () => {
  const high = buildFeedbackDataQuality({
    routineUsage: { value: "consistent" },
    usageDuration: { value: "28_plus" },
  });
  const low = buildFeedbackDataQuality({
    routineUsage: { value: "rare" },
    usageDuration: { value: "under_7" },
    otherSkincareChange: { value: "multiple" },
    sleepStressChange: { value: "major" },
  });
  expect(high.confidenceLevel).toBe("high");
  expect(low.confidenceLevel).toBe("low");
  expect(low.confidenceScore).toBeGreaterThanOrEqual(0);
  expect(low.majorConfounderCount).toBe(2);
  expect(low.productAttributionReady).toBe(false);
  expect(buildSkinStateDelta(null, {})).toBeNull();
});

test("journey summaries group version 2 records by journeyId and allow viewing older journeys", () => {
  const journeyHistory = [
    {
      id: "s1",
      journeyId: "j1",
      type: "initial_survey",
      result: { hydrationLevel: 5, skinType: "수부지" },
      mainConcern: "none",
      routine: { cream: 1 },
    },
    {
      id: "f1",
      journeyId: "j1",
      type: "feedback",
      previousState: { hydrationLevel: 5 },
      nextState: { hydrationLevel: 6 },
      routine: { cream: 2 },
    },
    {
      id: "s2",
      journeyId: "j2",
      type: "initial_survey",
      source: "quick",
      result: { hydrationLevel: 8, skinType: "지성" },
      routine: {},
    },
  ];
  const current = buildJourneySummary({
    journeyHistory,
    step: "start",
    viewJourneyId: null,
  });
  expect(current.latestJourneyLevel).toBe(8);
  expect(current.isQuickJourney).toBe(true);
  const older = buildJourneySummary({
    journeyHistory,
    step: "journey",
    viewJourneyId: "j1",
  });
  expect(older.activeJourneyRecords.map((record) => record.id)).toEqual([
    "s1",
    "f1",
  ]);
  expect(older.feedbackCount).toBe(1);
  expect(older.journeyLevelChange).toBe(1);
  expect(older.journeyRoundSummaries[0].changedProductCount).toBe(1);
});

test("legacy records without journeyId remain bounded by the next initial survey", () => {
  const journeyHistory = [
    {
      id: "old1",
      type: "initial_survey",
      result: { hydrationLevel: 3 },
      routine: {},
    },
    {
      id: "old-feedback",
      type: "feedback",
      nextState: { hydrationLevel: 4 },
      routine: {},
    },
    {
      id: "old2",
      type: "initial_survey",
      result: { hydrationLevel: 8 },
      routine: {},
    },
  ];
  const summary = buildJourneySummary({
    journeyHistory,
    step: "journey",
    viewJourneyId: "old1",
  });
  expect(summary.activeJourneyRecords.map((record) => record.id)).toEqual([
    "old1",
    "old-feedback",
  ]);
  expect(summary.latestJourneyLevel).toBe(4);
  expect(
    buildJourneySummary({
      journeyHistory: [],
      step: "start",
      viewJourneyId: null,
    }).activeJourneyRecords,
  ).toEqual([]);
});
