import { getProductById } from "./productCatalog";
import { buildCosmeticAddOnPlan } from "./cosmeticAddOnPlan";
import { getRankedProductCandidates } from "./routineRecommendation";
import { collectPersonalProductFeedback, getPersonalCosmeticFit } from "./personalProductFeedback";

const startedAt = "2026-10-12T00:00:00Z";
const now = new Date("2026-11-12T00:00:00Z");
const makeRecord = (product, overrides = {}, followUp = {}) => ({
  source: "skin_product_observation", assessmentOnly: true,
  productObservation: {
    protocol: "serum-cheek-tightness-v1", choice: "start", startedAt, baselineDays: 5,
    productId: product.id, formulaVerifiedAt: product.evidence.lastVerifiedAt,
    hydrationLevel: product.hydrationLevel, sensitive: false, analysisConsent: null,
    followUp: { days: 1, used: "recommended", frequency: "daily", reaction: "none",
      otherChanges: "no", elapsedDays: 14, recordedAt: "2026-10-26T00:00:00Z", ...followUp },
    ...overrides,
  },
});

test("private use results change the next basic serum only with comparable evidence", () => {
  jest.useFakeTimers();
  jest.setSystemTime(now);
  try {
    const base = { mainConcern: "none", basicOnly: true, isSensitive: false, observationKinds: ["serum"] };
    const ranks = level => getRankedProductCandidates("serum", level, base);
    const context = Array.from({ length: 10 }, (_, i) => i + 1).map(level => {
      const [initial, ...remaining] = ranks(level);
      return { level, initial, close: remaining.find(p => p.hydrationLevel === level &&
        p.beginnerFriendly === initial?.beginnerFriendly && initial?.hydrationLevel === level) };
    }).find(row => row.close);
    expect(context).toBeDefined();
    const { level, initial, close } = context;
    const top = (records, override = {}) => getRankedProductCandidates("serum", level, {
      ...base, ...override, personalProductFeedback: collectPersonalProductFeedback(records),
    })[0].id;
    expect(top([makeRecord(close)])).toBe(close.id);
    expect(top([makeRecord(initial, {}, { days: 5 })])).not.toBe(initial.id);
    expect(top([makeRecord(close, {}, { otherChanges: "yes" })])).toBe(initial.id);
    expect(top([makeRecord(close, {}, { used: "existing" })])).toBe(initial.id);
    expect(top([makeRecord(close, {}, { days: null })])).toBe(initial.id);
    expect(top([makeRecord(close)], { observationKinds: [] })).toBe(initial.id);
    expect(top([makeRecord(close, { formulaVerifiedAt: "2024-01-01" })])).toBe(initial.id);
  } finally { jest.useRealTimers(); }
});

test("irritation on a known product excludes it from both routes, including early or detailed checks", () => {
  const product = getProductById(5);
  const input = { goal: "texture", comfort: "comfortable", actives: ["none"], experience: "new", special: "none" };
  const context = { profile: { hydrationLevel: 7, observationAssessment: { canRecommendBasics: true, isSensitive: false } } };
  expect(buildCosmeticAddOnPlan(input, context).product?.id).toBe(product.id);
  const negative = makeRecord(product, { earlyCheck: { used: "recommended", reaction: "stopped_irritation" } });
  const alternate = buildCosmeticAddOnPlan(input, { ...context, personalProductFeedback: collectPersonalProductFeedback([negative]) });
  expect(alternate.product?.id).not.toBe(product.id);
  const unknown = makeRecord(product, { earlyCheck: { used: "other", reaction: "stopped_irritation" } });
  expect(collectPersonalProductFeedback([unknown]).avoided.has(product.id)).toBe(false);
  const details = status => ({ actualProductUsage: [{ productId: product.id, actualUsage: { status, irritationObserved: true } }] });
  expect(collectPersonalProductFeedback([details("consistent")]).avoided.has(product.id)).toBe(true);
  expect(collectPersonalProductFeedback([details("never_used")]).avoided.has(product.id)).toBe(false);
});

test("a cosmetic response is scoped to its goal and known matching area", () => {
  const product = getProductById(5);
  const record = makeRecord(product, { protocol: "cosmetic-blackhead-v1", route: "texture", area: "nose", baselineValue: 3 },
    { value: 1, useDays: "28_plus", elapsedDays: 28, recordedAt: "2026-11-09T00:00:00Z" });
  const context = { sensitive: false, tracks: ["blackhead"], route: "texture", locations: { blackhead: "nose" },
    personalProductFeedback: collectPersonalProductFeedback([record]) };
  const fit = override => getPersonalCosmeticFit(product, product.hydrationLevel, { ...context, ...override }, now.getTime());
  expect(fit()).toBeGreaterThan(0);
  expect(fit({ locations: { blackhead: "chin" } })).toBe(0);
  expect(fit({ route: "tone" })).toBe(0);
});
