const { test } = require("node:test");
const assert = require("node:assert/strict");
const { proposeCosmeticFit } = require("./review-cosmetic-fit.cjs");
const now = Date.parse("2026-11-14");
const report = (periodStart, periodEnd) => ({
  periodStart, periodEnd, rows: ["lower", "higher"].flatMap(baseline_band => ["start", "keep"].map(choice => ({
    protocol: "cosmetic-dryness-v1", product_id: "2", formula_verified_at: "2026-09-01",
    hydration_level: 5, sensitive: false, route: "support", area: "cheeks",
    baseline_band, choice, period_start: periodStart, period_end: periodEnd, enough_to_review: true,
    enrolled: 60, known_outcomes: 52, comparable_follow_ups: 48, paired_discomfort: 48,
    comparable_none_without_reaction_or_stop: choice === "start" ? 22 : 16, irritation_reported: 1,
    stopped_reported: 1, higher_discomfort: 1,
  }))),
});
test("requires matched, repeated cohorts and emits only reviewable signals", () => {
  const a = report("2026-09-01", "2026-09-30"), b = report("2026-10-01", "2026-10-30");
  const [signal] = proposeCosmeticFit(a, b, now);
  assert.deepEqual(signal, { protocol: "cosmetic-dryness-v1", productId: 2, formulaVerifiedAt: "2026-09-01",
    hydrationLevel: 5, sensitive: false, route: "support", area: "cheeks", evidencePeriodEnd: "2026-10-30",
    reviewBasis: "repeated_consented_observation_v1" });
  for (const changed of [{ comparable_follow_ups: 40 }, { paired_discomfort: 40 }, { irritation_reported: 5 }, { area: "nose" },
    { formula_verified_at: "2026-10-01" }, { comparable_none_without_reaction_or_stop: 17 }]) {
    assert.deepEqual(proposeCosmeticFit(a, { ...b, rows: [{ ...b.rows[0], ...changed }, ...b.rows.slice(1)] }, now), []);
  }
  assert.deepEqual(proposeCosmeticFit(a, { ...b, rows: [...b.rows, b.rows[0]] }, now), []);
  assert.throws(() => proposeCosmeticFit(a, a, now), /non-overlapping/);
  assert.throws(() => proposeCosmeticFit(a, { ...b, rows: a.rows }, now), /SQL report dates/);
});
