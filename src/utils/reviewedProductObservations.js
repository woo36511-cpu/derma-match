import reviewed from "../data/reviewedProductObservations.json";
import { cosmeticObservationProtocol } from "../data/productObservationGoals";
import { DAYS_MS, OBSERVATION_KINDS } from "./moisturizerObservation";

const REVIEW_LIFETIME_DAYS = 90;
export const OBSERVATION_FIT_BONUS = 0.5;
export const COSMETIC_OBSERVATION_FIT_BONUS = 0.25;

function findReviewedSignal(product, evidence, level, sensitive, matches, entries, now) {
  if (!entries.length || !evidence.eligible || !evidence.lastVerifiedAt || product.hydrationLevel !== level ||
      typeof sensitive !== "boolean" || (sensitive && !product.sensitivitySafe)) return null;
  return entries.find(entry => {
    const reviewedAt = /^\d{4}-\d{2}-\d{2}$/.test(entry.reviewedOn ?? "") ? Date.parse(entry.reviewedOn) : NaN;
    return entry.productId === product.id && entry.formulaVerifiedAt === evidence.lastVerifiedAt &&
      entry.hydrationLevel === level && entry.sensitive === sensitive && reviewedAt <= now &&
      now - reviewedAt < REVIEW_LIFETIME_DAYS * DAYS_MS && matches(entry);
  }) ?? null;
}

export function getReviewedProductObservation(product, evidence, level, context, entries = reviewed, now = Date.now()) {
  if (context.basicOnly !== true || context.mainConcern !== "none") return null;
  const kind = context.observationKinds?.find(key => OBSERVATION_KINDS[key]?.categories.includes(product.category));
  const category = Object.keys(context.observationTracks ?? {}).find(key =>
    key === product.category || (key === "cleanser" && OBSERVATION_KINDS.cleanser.categories.includes(product.category)));
  const basicTracks = context.observationTracks?.[category] ?? [];
  return findReviewedSignal(product, evidence, level, context.isSensitive, entry =>
    (kind && entry.protocol === OBSERVATION_KINDS[kind].protocol) ||
    (entry.route === "basic" && entry.area === null && basicTracks.some(track => entry.protocol === cosmeticObservationProtocol(track))),
  entries, now);
}

export function getReviewedCosmeticObservation(product, evidence, level, { sensitive, route, tracks, locations }, entries = reviewed, now = Date.now()) {
  return findReviewedSignal(product, evidence, level, sensitive, entry => entry.route === route &&
    tracks.some(track => entry.protocol === cosmeticObservationProtocol(track) &&
      (entry.area === null || (locations?.[track] && entry.area === locations[track]))),
  entries, now);
}
