import { cosmeticObservationProtocol } from "../data/productObservationGoals";
import {
  DAYS_MS, OBSERVATION_KINDS, getObservationCheckDays, getObservationKind, getObservationStudy,
  isObservationValue, isProductObservation,
} from "./moisturizerObservation";

const RECENT_DAYS = 120;
const adverse = reaction => ["irritation", "stopped_irritation"].includes(reaction);
const actualUseStatuses = ["consistent", "occasional", "stopped"];

export function collectPersonalProductFeedback(records) {
  const avoided = new Set();
  const comparisons = new Map();
  for (const record of records) {
    if (!isProductObservation(record)) {
      if (!Array.isArray(record.actualProductUsage)) continue;
      for (const usage of record.actualProductUsage) {
        const details = usage?.actualUsage;
        if (Number.isInteger(usage?.productId) && actualUseStatuses.includes(details?.status) &&
            (details.irritationObserved === true || details.stopReason === "irritation")) avoided.add(usage.productId);
      }
      continue;
    }
    const study = getObservationStudy(record);
    const config = getObservationKind(study?.protocol);
    if (!config || !Number.isInteger(study.productId)) continue;
    if ([study.earlyCheck, study.followUp].some(check => check?.used === "recommended" && adverse(check.reaction))) {
      avoided.add(study.productId);
      continue;
    }
    const check = study.followUp;
    const durationKnown = !config.cosmetic || ["14_27", "28_plus"].includes(check?.useDays) ||
      (getObservationCheckDays(config) === 14 && check?.useDays === "7_13");
    if (study.choice !== "start" || check?.used !== "recommended" || check.frequency !== "daily" ||
        check.otherChanges !== "no" || check.reaction !== "none" || !durationKnown ||
        check.elapsedDays < getObservationCheckDays(config) || !Number.isFinite(check.elapsedDays) ||
        (study.earlyCheck && study.earlyCheck.reaction !== "none")) continue;
    const before = config.cosmetic ? study.baselineValue : study.baselineDays;
    const after = config.cosmetic ? check.value : check.days;
    const recordedAt = Date.parse(check.recordedAt);
    if (!isObservationValue(config, before) || before === 0 || !isObservationValue(config, after) || !Number.isFinite(recordedAt)) continue;
    const comfortDelta = Number.isInteger(study.baselineComfort) && Number.isInteger(check.comfort)
      ? study.baselineComfort - check.comfort : 0;
    const direction = (after === 0 || before - after >= (config.options ? 1 : 2)) && comfortDelta >= 0
      ? 1 : after >= before && comfortDelta <= 0 ? -1 : 0;
    const entries = comparisons.get(study.productId) ?? [];
    entries.push({ protocol: study.protocol, route: study.route ?? "basic", area: study.area ?? null,
      hydrationLevel: study.hydrationLevel, sensitive: study.sensitive, formulaVerifiedAt: study.formulaVerifiedAt,
      direction, recordedAt });
    comparisons.set(study.productId, entries);
  }
  return { avoided, comparisons };
}

export const avoidPersonalProduct = (product, feedback) => Boolean(feedback?.avoided?.has(product?.id));

function recentDirection(product, level, sensitive, feedback, matches, now) {
  const entries = feedback?.comparisons?.get(product.id);
  if (!entries || typeof sensitive !== "boolean" || !product.evidence?.lastVerifiedAt) return 0;
  const latest = entries.reduce((best, entry) =>
    entry.hydrationLevel === level && entry.sensitive === sensitive && entry.formulaVerifiedAt === product.evidence.lastVerifiedAt &&
      entry.recordedAt <= now && now - entry.recordedAt <= RECENT_DAYS * DAYS_MS &&
      matches(entry) && (!best || entry.recordedAt > best.recordedAt) ? entry : best,
  null);
  return latest?.direction ?? 0;
}

const areaMatches = (currentArea, savedArea) => !currentArea || currentArea === savedArea;

export function getPersonalBasicFit(product, level, context, now = Date.now()) {
  if (!context.personalProductFeedback?.comparisons?.size) return 0;
  const direct = context.observationKinds?.filter(key => OBSERVATION_KINDS[key]?.categories.includes(product.category))
    .map(key => OBSERVATION_KINDS[key].protocol) ?? [];
  const category = OBSERVATION_KINDS.cleanser.categories.includes(product.category) ? "cleanser" : product.category;
  const tracks = context.observationTracks?.[category] ?? [];
  const observed = context.observedSkin;
  const direction = recentDirection(product, level, context.isSensitive, context.personalProductFeedback, entry =>
    entry.route === "basic" && (direct.includes(entry.protocol) || tracks.some(track =>
      entry.protocol === cosmeticObservationProtocol(track) && areaMatches(track === "sebum"
        ? (["tzone", "whole"].includes(observed?.observedOil) ? observed.observedOil : undefined)
        : (["cheeks", "tzone", "whole"].includes(observed?.drynessArea) ? observed.drynessArea : undefined), entry.area))),
  now);
  return direction === 1 ? 1.25 : direction === -1 ? -1.75 : 0;
}

export function getPersonalCosmeticFit(product, level, context, now = Date.now()) {
  const direction = recentDirection(product, level, context.sensitive, context.personalProductFeedback, entry =>
    entry.route === context.route && context.tracks.some(track =>
      entry.protocol === cosmeticObservationProtocol(track) && areaMatches(context.locations?.[track], entry.area)),
  now);
  return direction === 1 ? 0.5 : direction === -1 ? -0.75 : 0;
}
