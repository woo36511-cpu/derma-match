import {
  SKIN_STATE_AXES, buildSkinMeasurement, buildSkinComparison,
  getRecordSkinMeasurement, getRecordSkinComparison,
} from "./skinStateMeasurement";
import { buildSkinStateDelta, buildFeedbackDataQuality } from "./feedbackAnalysis";
import { buildUsageReliability } from "./usageReliability";

const state = Object.fromEntries(SKIN_STATE_AXES.map(({ key }) => [key, 5]));
const before = buildSkinMeasurement(state, "2026-10-01");
const after = buildSkinMeasurement({ ...state, dryness: 3, oiliness: 7 }, "2026-10-15", "recheck");
const skinComparison = buildSkinComparison(before, after, "initial");
const feedbackAnswers = Object.fromEntries(Object.entries({
  routineUsage: "consistent", usageDuration: "14_27", otherSkincareChange: "none",
  sleepStressChange: "stable", dietChange: "stable", medicationSupplementChange: "none", environmentChange: "stable",
}).map(([key, value]) => [key, { value }]));
const used = {
  productId: 1, category: "cream", usageStatus: "consistent",
  actualUsage: { status: "consistent", amount: "recommended", frequency: "daily", durationDays: 14,
    stoppedEarly: false, irritationObserved: false, usedAsDirected: true },
};
const reliability = (actualProductUsage = [used], overrides = {}) => buildUsageReliability({ feedbackAnswers, skinComparison, actualProductUsage, ...overrides });

test("all 8 axes use signed follow-up minus baseline differences and preserve metadata", () => {
  expect(skinComparison).toMatchObject({ complete: true, comparableAxisCount: 8, baselineRecordId: "initial", delta: { dryness: -2, oiliness: 2, sensitivity: 0 } });
  expect(skinComparison.after.measuredAt).toBe("2026-10-15");
  expect(Object.keys(skinComparison.delta)).toHaveLength(8);
});

test("missing and invalid scores remain unmeasured while measured zero is retained", () => {
  const partial = buildSkinMeasurement({ dryness: 0, oiliness: NaN, sensitivity: "5", barrierStress: 11, dehydration: -1 });
  const comparison = buildSkinComparison(partial, after);
  expect(comparison.comparableAxisCount).toBe(1);
  expect(comparison.delta).toMatchObject({ dryness: 3, oiliness: null, sensitivity: null, barrierStress: null });
  expect(buildSkinStateDelta({}, state).dryness).toBeNull();
  expect(buildSkinStateDelta({ dryness: 0 }, { dryness: 2 }).dryness).toBe(2);
});

test("different scoring versions cannot be compared", () => {
  const comparison = buildSkinComparison(before, { ...after, measurementVersion: "future-v2" });
  expect(comparison.comparisonStatus).toBe("version_mismatch");
  expect(comparison.comparableAxisCount).toBe(0);
  expect(Object.values(comparison.delta).every((value) => value === null)).toBe(true);
});

test("quick journey first check has no invented baseline and second check uses the prior measurement", () => {
  const initial = { id: "quick", type: "initial_survey", source: "quick", result: { skinState: null } };
  const first = buildSkinComparison(getRecordSkinMeasurement(initial), after, initial.id);
  expect(first.complete).toBe(false);
  expect(first.before.values.dryness).toBeNull();
  const record = { id: "check1", type: "feedback", outcome: { skinComparison: first } };
  const second = buildSkinComparison(getRecordSkinMeasurement(record), after, record.id);
  expect(second.complete).toBe(true);
  expect(second.before).toEqual(after);
});

test("legacy feedback snapshots can still be displayed without assuming absent axes", () => {
  const legacy = { type: "feedback", savedAt: "2026-10-15", outcome: { baselineSkinState: { dryness: 5 }, followUpSkinState: { dryness: 3 } } };
  expect(getRecordSkinComparison(legacy)).toMatchObject({ comparableAxisCount: 1, delta: { dryness: -2, oiliness: null } });
});

test("missing or unsupported usage/context answers cannot produce high confidence", () => {
  expect(buildFeedbackDataQuality({}).confidenceLevel).toBe("low");
  expect(buildFeedbackDataQuality({ ...feedbackAnswers, environmentChange: { value: "unknown" } }).complete).toBe(false);
  expect(reliability([], { feedbackAnswers: {} }).level).toBe("low");
  expect(reliability([{ ...used, actualUsage: { status: "consistent" } }]).productAttributionReady).toBe(false);
});

test("a complete single-product record is eligible for association analysis only", () => {
  const result = reliability([used, { productId: 2, actualUsage: { status: "never_used" } }]);
  expect(result).toMatchObject({ level: "high", usedProductCount: 1, productAttributionReady: true, attributionScope: "single_product_association", automaticScoreAdjustmentReady: false });
});

test("multiple products, stopped products and unknown exposure prevent single product attribution", () => {
  expect(reliability([used, { ...used, productId: 2 }]).attributionScope).toBe("routine_observation");
  expect(reliability([used, { productId: 2, actualUsage: { status: "stopped" } }]).productAttributionReady).toBe(false);
  expect(reliability([used, { productId: 2 }]).productAttributionReady).toBe(false);
});

test.each([
  [{ durationDays: 3 }, "low"], [{ durationDays: 10 }, "medium"],
  [{ durationDays: -1 }, "low"], [{ durationDays: 2.5 }, "low"],
  [{ frequency: "rare" }, "low"], [{ usedAsDirected: false }, "medium"],
  [{ stoppedEarly: true, stopReason: "irritation" }, "low"],
])("product exposure affects record reliability: %j", (patch, level) => {
  expect(reliability([{ ...used, actualUsage: { ...used.actualUsage, ...patch } }]).level).toBe(level);
});

test("confounding changes and an incomplete comparison block attribution", () => {
  const confounded = reliability([used], { feedbackAnswers: { ...feedbackAnswers, medicationSupplementChange: { value: "changed" } } });
  expect(confounded.productAttributionReady).toBe(false);
  expect(confounded.reasons).toContain("confounding_changes");
  expect(reliability([used], { skinComparison: null })).toMatchObject({ level: "low", productAttributionReady: false });
});

test("no use and contradictory stopped answers cannot count as reliable exposure", () => {
  expect(reliability([{ productId: 1, actualUsage: { status: "never_used" } }])).toMatchObject({ score: 0, usedProductCount: 0, productAttributionReady: false });
  const contradictory = reliability([{ ...used, actualUsage: { ...used.actualUsage, status: "stopped" } }]);
  expect(contradictory.reasons).toContain("inconsistent_usage");
  expect(contradictory.score).toBe(0);
});
