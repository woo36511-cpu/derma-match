import { getProductById } from "./productCatalog";
import { getProductEvidenceStatus } from "./productEvidence";

export const MOISTURIZER_OBSERVATION_PROTOCOL = "cheek-tightness-v1";
export const MOISTURIZER_CONSENT_VERSION = "moisturizer-internal-analysis-v1";
export const CHECK_AFTER_DAYS = 14;
export const DAYS_MS = 24 * 60 * 60 * 1000;
export const TIGHTNESS_QUESTION = "지난 7일 중 오후에 볼이 당긴 날은 며칠이었나요?";

export const isMoisturizerObservation = record => record?.source === "moisturizer_observation" && record?.assessmentOnly === true;
export const observationId = surveyId => `moisturizer:${surveyId}`;
export const validTightnessDays = days => Number.isInteger(days) && days >= 0 && days <= 7;
const oneOf = (value, options) => options.includes(value);

export function getMoisturizerOffer(survey) {
  const profile = survey?.result?.observationAssessment;
  if (survey?.type !== "initial_survey" || survey.symptomAssessment?.blockRoutine ||
    profile?.canRecommendBasics !== true || !["cheeks", "whole"].includes(profile.resolvedObservations?.drynessArea)) return null;
  const product = getProductById(survey.routine?.cream);
  const evidence = getProductEvidenceStatus(product);
  if (!product || product.category !== "cream" || !evidence.eligible || product.recommendationScope === "addon_only") return null;
  return { product, formulaVerifiedAt: evidence.lastVerifiedAt };
}

export function makeAnalysisConsent(enabled, signedIn, now) {
  return enabled && signedIn ? { version: MOISTURIZER_CONSENT_VERSION, grantedAt: now } : null;
}

export function buildMoisturizerObservation({ survey, baselineDays, choice, consent, signedIn, now }) {
  const offer = getMoisturizerOffer(survey);
  if (!offer || !validTightnessDays(baselineDays) || baselineDays === 0 || !oneOf(choice, ["start", "keep"])) return null;
  return {
    id: observationId(survey.id), journeyId: survey.journeyId || survey.id,
    type: "feedback", source: "moisturizer_observation", assessmentOnly: true,
    journeySchemaVersion: 3, savedAt: now,
    moisturizerObservation: {
      protocol: MOISTURIZER_OBSERVATION_PROTOCOL, surveyId: survey.id,
      productId: offer.product.id, formulaVerifiedAt: offer.formulaVerifiedAt,
      startedAt: now, baselineDays, choice,
      analysisConsent: makeAnalysisConsent(consent, signedIn, now),
    },
  };
}

export function buildMoisturizerFollowUp(record, answers, now) {
  const study = record?.moisturizerObservation;
  if (!study || !validTightnessDays(answers.days) ||
    !oneOf(answers.used, ["recommended", "existing", "other", "none"]) ||
    !oneOf(answers.frequency, ["daily", "sometimes", "none"]) ||
    (answers.used === "none") !== (answers.frequency === "none") ||
    !oneOf(answers.reaction, ["none", "irritation", "stopped_irritation", "stopped_other"]) ||
    !oneOf(answers.otherChanges, ["no", "yes", "unknown"])) return null;
  const elapsedDays = Math.floor((new Date(now) - new Date(study.startedAt)) / DAYS_MS);
  if (!Number.isFinite(elapsedDays) || elapsedDays < 0) return null;
  const slot = elapsedDays < CHECK_AFTER_DAYS ? "earlyCheck" : "followUp";
  if (study[slot]) return null;
  return { ...record, savedAt: now, moisturizerObservation: {
    ...study, [slot]: { days: answers.days, used: answers.used, frequency: answers.frequency,
      reaction: answers.reaction, otherChanges: answers.otherChanges, elapsedDays, recordedAt: now },
  } };
}
