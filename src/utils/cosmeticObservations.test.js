import { cosmeticProductProfiles } from "../data/cosmeticAddOns";
import { COSMETIC_TRACKS_BY_GOAL } from "../data/productObservationGoals";
import { getProductById } from "./productCatalog";
import { getProductEvidenceStatus } from "./productEvidence";
import { buildProductFollowUp, buildProductObservation, getProductObservationOffers } from "./moisturizerObservation";
import { getReviewedCosmeticObservation } from "./reviewedProductObservations";

const now = "2026-11-12T00:00:00Z";
const formulaProduct = goal => getProductById(Number(Object.entries(cosmeticProductProfiles)
  .find(([id, product]) => product.goals.includes(goal) && getProductEvidenceStatus(getProductById(Number(id))).eligible)[0]));
const survey = (goal, product) => ({
  id: "survey-test", type: "initial_survey", result: { hydrationLevel: product.hydrationLevel,
    observationAssessment: { canRecommendBasics: true, isSensitive: false, resolvedObservations: {} } },
  additionalCare: { concern: "none" },
  cosmeticAddOn: { answers: { goal }, status: "candidate", recommendedProductId: product.id },
});

test("only supported cosmetic recommendations offer goal-specific observations", () => {
  for (const [goal, tracks] of Object.entries(COSMETIC_TRACKS_BY_GOAL)) {
    const record = survey(goal, formulaProduct(goal));
    expect(getProductObservationOffers(record).map(offer => offer.track)).toEqual(tracks);
    expect(getProductObservationOffers({ ...record, symptomAssessment: { blockRoutine: true } })).toEqual([]);
    expect(getProductObservationOffers({ ...record, cosmeticAddOn: { ...record.cosmeticAddOn, status: "hold" } })).toEqual([]);
  }
  const base = survey("texture", formulaProduct("texture"));
  const record = { ...base, additionalCare: { concern: "acne", shapes: ["blackhead", "red", "indented_scar"] } };
  expect(getProductObservationOffers(record).map(item => item.track)).toEqual(["texture", "blackhead"]);
});

test("same-area blackhead tracking keeps unknown separate, captures real use, and doesn't count early changes as follow-up", () => {
  const input = survey("texture", formulaProduct("texture"));
  const offer = getProductObservationOffers(input).find(item => item.track === "blackhead");
  const enrollment = { survey: input, kind: offer.kind, baselineDays: 3, choice: "start", consent: true, signedIn: true, now };
  expect(buildProductObservation(enrollment)).toBeNull();
  const record = buildProductObservation({ ...enrollment, area: "nose" });
  expect(record.productObservation).toMatchObject({ baselineValue: 3, route: "texture", area: "nose",
    analysisConsent: { version: "cosmetic-outcome-analysis-v3" } });
  const answers = { days: 0, used: "recommended", frequency: "daily", useDays: "14_27", reaction: "none", otherChanges: "no" };
  const early = buildProductFollowUp(record, answers, "2026-11-27T00:00:00Z").productObservation;
  expect(early.followUp).toBeUndefined();
  expect(early.earlyCheck.value).toBe(0);
  expect(buildProductFollowUp(record, { ...answers, days: 5 }, "2026-12-10T00:00:00Z")).toBeNull();
  expect(buildProductFollowUp(record, { ...answers, days: null }, "2026-12-10T00:00:00Z").productObservation.followUp)
    .toMatchObject({ value: null, useDays: "14_27" });
});

test("reviewed cosmetic evidence must match formula, goal, symptom, and the tracked area", () => {
  const product = formulaProduct("texture");
  const evidence = getProductEvidenceStatus(product);
  const level = product.hydrationLevel;
  const signal = { protocol: "cosmetic-blackhead-v1", route: "texture", area: "nose",
    formulaVerifiedAt: evidence.lastVerifiedAt, productId: product.id, hydrationLevel: level,
    sensitive: false, reviewedOn: "2026-11-11", evidencePeriodEnd: "2026-10-01", reviewBasis: "repeated_consented_observation_v1" };
  const context = { sensitive: false, route: "texture", tracks: ["blackhead"], locations: { blackhead: "nose" } };
  const check = (contextOverride, signalOverride) => getReviewedCosmeticObservation(product, evidence, level,
    { ...context, ...contextOverride }, [{ ...signal, ...signalOverride }], Date.parse(now));
  expect(check()).toEqual(signal);
  expect(check({ tracks: ["closed"] })).toBeNull();
  expect(check({ route: "tone" })).toBeNull();
  expect(check({ locations: { blackhead: "chin" } })).toBeNull();
  expect(check({}, { formulaVerifiedAt: "2026-01-01" })).toBeNull();
});
