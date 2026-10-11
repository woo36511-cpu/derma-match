import {
  calculateNextLevel,
  buildFeedbackDataQuality,
  buildSkinStateDelta,
} from "./feedbackAnalysis";
import {
  buildDynamicRoutine,
  getRecommendedIngredients,
} from "./routineRecommendation";
import { getProductById, hasExfoliatingActive, isProductAvailable } from "./productCatalog";
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


test("420 synthetic skin contexts retain four safe available routine slots", () => {
  const concerns = [
    "none",
    "inflammatory_acne",
    "closed_comedones",
    "blackhead_sebum",
    "dehydration",
    "sensitivity_redness",
    "oiliness",
  ];
  const states = [
    { careNeeds: {} },
    { careNeeds: { hydrationNeed: 9, lightTextureNeed: 2 } },
    { careNeeds: { lightTextureNeed: 9, congestionCareNeed: 7 } },
    { careNeeds: { soothingNeed: 9, inflammationCareNeed: 8 } },
    { isSensitive: true, careNeeds: { soothingNeed: 9, hydrationNeed: 7 } },
    { isSensitive: true, careNeeds: { inflammationCareNeed: 9, soothingNeed: 9 } },
  ];
  let scenarios = 0;
  for (let level = 1; level <= 10; level += 1) {
    for (const mainConcern of concerns) {
      for (const state of states) {
        const routine = buildDynamicRoutine(level, { mainConcern, ...state });
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
        scenarios += 1;
      }
    }
  }
  expect(scenarios).toBe(420);
});


test("catalog review excludes unmatched ID11 cream and distinguishes ID1 retailer formula", () => {
  const outdatedCream = getProductById(11);
  expect(isProductAvailable(outdatedCream)).toBe(false);
  const dokdoToner = getProductById(1);
  expect(dokdoToner.ingredients).not.toContain("히알루론산");
  expect(dokdoToner.fullIngredients).toHaveLength(16);
  expect(dokdoToner.evidence.fullIngredientsMarket).toBe("domestic_retailer");
  expect(dokdoToner.evidence.domesticFormulaVerified).toBe(false);
});


test("cleanser evidence retains volume uncertainty and avoids discontinued ID32", () => {
  const cetaphil = getProductById(4);
  expect(cetaphil.fullIngredients).toHaveLength(10);
  expect(cetaphil.evidence.domesticFormulaVerified).toBe(false);
  expect(cetaphil.evidence.fullIngredientsMarket).toBe("domestic_official_other_volume");

  const avene = getProductById(32);
  expect(avene.fullIngredients).toHaveLength(7);
  expect(avene.ingredients).not.toContain("판테놀");
  expect(isProductAvailable(avene)).toBe(false);
  expect(avene.evidence.fullIngredientsMarket).toBe("us_official_discontinued");
});


test("cream audit records provenance and disclosed ppm without treating legacy B5 as B5+", () => {
  const physiogel = getProductById(3);
  expect(physiogel.fullIngredients).toHaveLength(13);
  expect(physiogel.fullIngredients).toContain("세라마이드엔피");
  expect(physiogel.evidence.fullIngredientsMarket).toBe("domestic_retailer");
  expect(physiogel.evidence.domesticFormulaVerified).toBe(false);

  const illiyoon = getProductById(12);
  expect(illiyoon.fullIngredients).toHaveLength(45);
  expect(illiyoon.evidence.fullIngredientsMarket).toBe("domestic_official");
  expect(illiyoon.evidence.domesticFormulaVerified).toBe(true);
  expect(illiyoon.activeIngredients.map((i) => i.concentration)).toEqual([
    65.5, 4.04,
  ]);
  expect(illiyoon.activeIngredients.every((i) => i.unit === "ppm")).toBe(true);
  expect(illiyoon.careProfile.barrierSupport).toBeGreaterThan(0);

  const oldB5 = getProductById(24);
  expect(oldB5.name).toBe("라로슈포제 시카플라스트 밤 B5");
  expect(isProductAvailable(oldB5)).toBe(false);
  expect(oldB5.evidence.fullIngredientsVerified).toBe(false);
});

test.each([
  { level: 2, mainConcern: "dehydration" },
  { level: 3, mainConcern: "sensitivity_redness" },
  { level: 5, mainConcern: "none" },
])("cream audit keeps active available four-step routine at level $level", (state) => {
  const { products: routine } = buildDynamicRoutine(state.level, {
    mainConcern: state.mainConcern,
    isSensitive: true,
    careNeeds: { hydrationNeed: 7, soothingNeed: 7 },
  });
  expect(Object.keys(routine)).toEqual(["cleanser", "toner", "serum", "cream"]);
  expect(Object.values(routine).every(isProductAvailable)).toBe(true);
  expect(routine.cream.id).not.toBe(24);
});


test("toner audit separates verified retailer list from incompatible product versions", () => {
  const birchToner = getProductById(15);
  expect(birchToner.fullIngredients).toHaveLength(21);
  expect(birchToner.activeIngredients[0]).toMatchObject({
    name: "자작나무수액",
    concentration: 10000,
    unit: "ppm",
  });
  expect(birchToner.evidence.domesticFormulaVerified).toBe(false);
  expect(birchToner.evidence.fullIngredientsMarket).toBe("domestic_retailer");

  const oldAnua = getProductById(9);
  const birchCream = getProductById(19);
  expect(isProductAvailable(oldAnua)).toBe(false);
  expect(isProductAvailable(birchCream)).toBe(false);
  expect(oldAnua.evidence.fullIngredientsVerified).toBe(false);
  expect(birchCream.evidence.fullIngredientsVerified).toBe(false);
});

test("default routines never include unverifiable ID9 and ID19", () => {
  for (let level = 1; level <= 10; level += 1) {
    const products = Object.values(
      buildDynamicRoutine(level, { mainConcern: "none" }).products,
    );
    expect(products.map((p) => p.id)).not.toContain(9);
    expect(products.map((p) => p.id)).not.toContain(19);
    expect(products.every(isProductAvailable)).toBe(true);
  }
});
