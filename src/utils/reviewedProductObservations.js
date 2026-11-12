import reviewed from "../data/reviewedProductObservations.json";
import { DAYS_MS, OBSERVATION_KINDS } from "./moisturizerObservation";

const REVIEW_LIFETIME_DAYS = 90;
export const OBSERVATION_FIT_BONUS = 0.5;

export function getReviewedProductObservation(product, evidence, level, context, entries = reviewed, now = Date.now()) {
  if (!evidence.eligible || !evidence.lastVerifiedAt || product.hydrationLevel !== level ||
      typeof context.isSensitive !== "boolean" || (context.isSensitive && !product.sensitivitySafe) ||
      context.basicOnly !== true || context.mainConcern !== "none") return null;
  const kind = context.observationKinds?.find(key => OBSERVATION_KINDS[key]?.categories.includes(product.category));
  if (!kind) return null;
  return entries.find(entry => {
    const reviewedAt = /^\d{4}-\d{2}-\d{2}$/.test(entry.reviewedOn ?? "") ? Date.parse(entry.reviewedOn) : NaN;
    return entry.protocol === OBSERVATION_KINDS[kind].protocol && entry.productId === product.id &&
      entry.formulaVerifiedAt === evidence.lastVerifiedAt && entry.hydrationLevel === level &&
      entry.sensitive === context.isSensitive && reviewedAt <= now &&
      now - reviewedAt < REVIEW_LIFETIME_DAYS * DAYS_MS;
  }) ?? null;
}
