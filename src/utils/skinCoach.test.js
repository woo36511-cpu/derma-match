import {
  calculateNextLevel,
  buildFeedbackConfounders,
  buildFeedbackDataQuality,
  buildSkinStateDelta,
} from "./feedbackAnalysis";
import {
  adjustCareNeedsForIssue,
  analyzeSkinSurvey,
} from "./analyzeSkinSurvey";
import {
  buildDynamicRoutine,
  getRecommendedIngredients,
} from "./routineRecommendation";
import {
  getProductById,
  hasExfoliatingActive,
  isProductAvailable,
} from "./productCatalog";
import {
  buildProductUsagePlan,
  buildProductUsageRecord,
} from "./productUsagePlan";
import { buildJourneySummary } from "./journeySummary";
import { products } from "../data/products";
import { skinSurveyQuestions } from "../data/skinSurvey";

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
  expect(plan.productVolumeSnapshot).toBeNull();
  expect(plan.recommendationSnapshot.recommendedAmount).toBe("small");
  expect(plan.recommendationSnapshot.evidence.evidenceLevel).toBe("unverified");
  expect(plan.recommendationSnapshot.evidence.domesticFormulaVerified).toBe(
    false,
  );
  expect(plan.recommendationSnapshot.evidence.fullIngredientsMarket).toBe(
    "unknown",
  );
  expect(plan.recommendationSnapshot.catalogAuditDate).toBeNull();
  expect(plan.recommendationSnapshot.formulaStatus).toBeNull();
  expect(plan.actualUsage).toEqual({
    status: "unknown",
    amount: null,
    frequency: null,
    durationDays: null,
    stoppedEarly: null,
    stopReason: null,
    irritationObserved: null,
    usedAsDirected: null,
  });
});

test("product usage records preserve per-product actual usage fields", () => {
  const product = products.find((item) => item.id === 24);
  const record = buildProductUsageRecord(product, "cream", {
    24: {
      status: "consistent",
      amount: "pea",
      frequency: "daily",
      durationDays: 21,
      stoppedEarly: false,
      irritationObserved: false,
      usedAsDirected: true,
    },
  });

  expect(record.productVolumeSnapshot).toBe("100ml");
  expect(record.usageStatus).toBe("consistent");
  expect(record.actualUsage).toMatchObject({
    status: "consistent",
    amount: "pea",
    frequency: "daily",
    durationDays: 21,
    stoppedEarly: false,
    irritationObserved: false,
    usedAsDirected: true,
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
  expect(low.confounderLevel).toBe("high");
  expect(low.productAttributionReady).toBe(false);
  expect(buildSkinStateDelta(null, {})).toBeNull();
});

test("survey analysis stores care need confidence and lifestyle confounder profile", () => {
  const result = analyzeSkinSurvey(
    {
      afterWash: "많이 당기고 건조하다",
      afternoonFeel: "기름은 올라오는데 피부는 편하지 않고 당긴다",
      areaDifference: "볼은 건조한데 코나 이마는 번들거린다",
      creamFeel: "발라도 금방 다시 건조해진다",
      innerDryness: "자주 그렇다",
      sensitivity: "자주 따갑고 붉어진다",
      mainIssue: "붉어짐이나 따가움",
      poreSebum: "조금 신경 쓰인다",
      routineLevel: "각질제거제, BHA, 레티놀 같은 기능성도 쓴다",
      lifestyle: ["잠을 부족하게 잔다", "스트레스를 많이 받는다"],
    },
    skinSurveyQuestions,
  );

  expect(result.careNeeds.barrierCareNeed).toBeGreaterThanOrEqual(6);
  expect(result.careNeeds.confidence).toBe("high");
  expect(result.lifestyleConfounders.confounderLevel).toBe("medium");
  expect(result.lifestyleConfounders.inflammationTriggers).toEqual([
    "sleep_lack",
    "stress",
  ]);
});

test("issue answers refine barrier and inflammation care needs", () => {
  const adjusted = adjustCareNeedsForIssue(
    {
      hydrationNeed: 4,
      lightTextureNeed: 2,
      soothingNeed: 5,
      congestionCareNeed: 1,
      inflammationCareNeed: 4,
      barrierCareNeed: 4,
    },
    "sensitivity_redness",
    {
      skinDamage: { value: "flaking" },
      moisturizerSting: { value: "frequent" },
      duration: { value: "days" },
    },
  );

  expect(adjusted.soothingNeed).toBe(10);
  expect(adjusted.inflammationCareNeed).toBe(6);
  expect(adjusted.barrierCareNeed).toBe(7);
});

test("feedback confounders carry summary counts and severity", () => {
  expect(
    buildFeedbackConfounders({
      otherSkincareChange: { value: "one" },
      sleepStressChange: { value: "major" },
      dietChange: { value: "mild" },
    }),
  ).toMatchObject({
    confounderCount: 3,
    majorConfounderCount: 1,
    confounderLevel: "medium",
  });
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


test("full catalog audit has explicit care profiles and conservative verification gaps", () => {
  expect(products).toHaveLength(43);

  const inactiveIds = products
    .filter((product) => product.isAvailable === false)
    .map((product) => product.id);
  expect(inactiveIds).toEqual([26, 32, 33, 36, 48]);

  const missingFullIngredientIds = products
    .filter((product) => !product.evidence?.fullIngredientsVerified)
    .map((product) => product.id);
  expect(missingFullIngredientIds).toEqual([8, 20, 26, 27, 36, 48]);

  for (const product of products) {
    expect(product.catalogAudit?.reviewedAt).toBe("2026-10-11");
    expect(product.catalogAudit?.careProfileSource).toBe(
      "internal_conservative_assessment",
    );
    expect(product.evidence?.priceVerified).toBe(false);

    for (const value of Object.values(product.careProfile)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    }
  }
});

test("catalog audit preserves product identity corrections without borrowing formulas", () => {
  const physiogel = getProductById(3);
  expect(physiogel.volume).toBe("150ml");
  expect(physiogel.fullIngredients).toHaveLength(13);
  expect(physiogel.fullIngredients).not.toContain("다이소듐포스페이트");

  const anua = getProductById(9);
  expect(isProductAvailable(anua)).toBe(true);
  expect(anua.name).toContain("히알루론산");
  expect(anua.fullIngredients).toContain("1,2-산다이올");
  expect(anua.evidence.note).toContain("원문 그대로 보존");

  const b5Plus = getProductById(24);
  expect(isProductAvailable(b5Plus)).toBe(true);
  expect(b5Plus.name).toContain("B5+");
  expect(b5Plus.activeIngredients).toContainEqual(
    expect.objectContaining({
      name: "판테놀",
      concentration: 5,
      unit: "%",
      concentrationVerified: true,
    }),
  );

  const quarantinedPowder = getProductById(36);
  expect(quarantinedPowder.isAvailable).toBe(false);
  expect(quarantinedPowder.fullIngredients).toBeUndefined();
  expect(quarantinedPowder.activeIngredients).toEqual([]);
});

test("formula audit keeps concentration units separate", () => {
  const illiyoon = getProductById(12);
  expect(illiyoon.activeIngredients).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "세라마이드 CPP-40", concentration: 65.5, unit: "ppm" }),
      expect.objectContaining({ name: "세라마이드엔피", concentration: 4.04, unit: "ppm" }),
    ]),
  );

  const carrotPad = getProductById(21);
  expect(carrotPad.activeIngredients).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "당근추출물", concentration: 735, unit: "ppm" }),
      expect.objectContaining({ name: "당근씨오일", concentration: 10000, unit: "ppb" }),
    ]),
  );
  expect(carrotPad.activeIngredients.map((ingredient) => ingredient.name)).not.toContain(
    "베타카로틴",
  );

  const bioturm = getProductById(31);
  expect(bioturm.fullIngredients).toHaveLength(19);
  expect(bioturm.fullIngredients).toContain(
    "Citrus Aurantium Bergamia Fruit Oil",
  );
});

test("exfoliating leave-on products include PHA and LHA detection", () => {
  const pineToner = getProductById(39);
  expect(hasExfoliatingActive(pineToner)).toBe(true);

  const aesturaCream = getProductById(7);
  expect(hasExfoliatingActive(aesturaCream)).toBe(false);

  const lastIngredient = {
    ingredients: ["Alpha Bisabolol", "Sodium Hyaluronate"],
    activeIngredients: [],
  };
  expect(hasExfoliatingActive(lastIngredient)).toBe(false);
});

test("usage guidance distinguishes cleanser forms and internal conservative starts", () => {
  const cetaphil = getProductById(4);
  expect(cetaphil.usage.howToUse.join(" ")).toContain("억지로 내지 않고");
  expect(cetaphil.usage.howToUse.join(" ")).not.toContain("충분히 거품");

  const carrotPad = getProductById(21);
  expect(carrotPad.usageAmount.normal).toBe("패드 1장");
  expect(carrotPad.usage.howToUse.join(" ")).toContain("5~10분");

  const enzymePowder = getProductById(35);
  expect(enzymePowder.usage.guidanceType).toBe(
    "official_directions_with_conservative_starting_frequency",
  );

  const mandelicToner = getProductById(50);
  expect(mandelicToner.beginnerFriendly).toBe(false);
  expect(mandelicToner.usage.guidanceType).toBe(
    "internal_conservative_starting_frequency",
  );
});
