import { getProductById, isSpecializedTreatmentProduct } from "./productCatalog";
import { getProductEvidenceStatus } from "./productEvidence";

export const LEGACY_PROTOCOL = "cheek-tightness-v1";
const LEGACY_CONSENT_VERSION = "moisturizer-internal-analysis-v1";
export const PRODUCT_CONSENT_VERSION = "skin-product-internal-analysis-v2";
export const CHECK_AFTER_DAYS = 14;
export const DAYS_MS = 24 * 60 * 60 * 1000;
export const COMFORT_QUESTION = "최근 7일 동안 피부 불편함이 얼마나 신경 쓰였나요?";
export const COMFORT_OPTIONS = [
  ["0", "전혀 신경 쓰이지 않았어요"], ["1", "조금 신경 쓰였어요"],
  ["2", "꽤 신경 쓰였어요"], ["3", "많이 신경 쓰였어요"],
  ["unknown", "잘 기억나지 않아요"],
];

export const OBSERVATION_KINDS = {
  cream: {
    label: "보습제", protocol: "cheek-tightness-v2", symptom: "볼 당김",
    categories: ["cream"],
    question: "최근 7일 동안 평소처럼 관리했을 때, 볼이 조이는 듯한 당김을 느낀 날은 며칠이었나요?",
  },
  cleanser: {
    label: "세안제", protocol: "post-wash-tightness-v1", symptom: "세안 직후 당김",
    categories: ["cleanser", "gel_cleanser", "cleansing_milk"],
    question: "최근 7일 동안 세안 직후, 보습제를 바르기 전에 얼굴이 당긴 날은 며칠이었나요?",
  },
  serum: {
    label: "수분 세럼", protocol: "serum-cheek-tightness-v1", symptom: "일상 중 볼 당김",
    categories: ["serum"],
    question: "최근 7일 동안 세안 직후를 빼고, 일상 중 볼이 조이는 듯한 당김을 느낀 날은 며칠이었나요?",
  },
};

export const getObservationStudy = record => record?.productObservation ?? record?.moisturizerObservation;
export const isProductObservation = record => ["moisturizer_observation", "skin_product_observation"].includes(record?.source) && record?.assessmentOnly === true;
export const observationId = (surveyId, kind) => kind === "cream" ? `moisturizer:${surveyId}` : `skin-product:${kind}:${surveyId}`;
export const validTightnessDays = days => Number.isInteger(days) && days >= 0 && days <= 7;
const validComfort = value => Number.isInteger(value) && value >= 0 && value <= 3;
const oneOf = (value, options) => options.includes(value);

export function getObservationKind(protocol) {
  if (protocol === LEGACY_PROTOCOL) return { ...OBSERVATION_KINDS.cream, legacy: true, symptom: "오후 볼 당김",
    question: "지난 7일 중 오후에 볼이 당긴 날은 며칠이었나요?" };
  return Object.values(OBSERVATION_KINDS).find(kind => kind.protocol === protocol);
}

export function getObservationKinds(profile) {
  const assessment = profile?.observationAssessment;
  if (assessment?.canRecommendBasics !== true) return [];
  const observed = assessment.resolvedObservations;
  return [
    ...(["cheeks", "whole"].includes(observed?.drynessArea) ? ["cream", "serum"] : []),
    ...(observed?.washResponse === "tight" ? ["cleanser"] : []),
  ];
}

export function getProductObservationOffers(survey) {
  if (survey?.type !== "initial_survey" || survey.symptomAssessment?.blockRoutine) return [];
  return getObservationKinds(survey.result).flatMap(kind => {
    const product = getProductById(survey.routine?.[kind]);
    const evidence = getProductEvidenceStatus(product);
    const config = OBSERVATION_KINDS[kind];
    if (!config.categories.includes(product?.category) || !evidence.eligible || !evidence.lastVerifiedAt ||
      product.recommendationScope === "addon_only" || isSpecializedTreatmentProduct(product)) return [];
    return [{ kind, config, product, formulaVerifiedAt: evidence.lastVerifiedAt }];
  });
}

export function makeAnalysisConsent(enabled, signedIn, now, protocol) {
  const version = protocol === LEGACY_PROTOCOL ? LEGACY_CONSENT_VERSION : PRODUCT_CONSENT_VERSION;
  return enabled && signedIn ? { version, grantedAt: now } : null;
}

export function buildProductObservation({ survey, kind, baselineDays, comfort, choice, consent, signedIn, now }) {
  const offer = getProductObservationOffers(survey).find(item => item.kind === kind);
  if (!offer || !validTightnessDays(baselineDays) || baselineDays === 0 || !oneOf(choice, ["start", "keep"])) return null;
  const protocol = offer.config.protocol;
  return {
    id: observationId(survey.id, kind), journeyId: survey.journeyId || survey.id,
    type: "feedback", source: "skin_product_observation", assessmentOnly: true,
    journeySchemaVersion: 3, savedAt: now,
    productObservation: {
      protocol, surveyId: survey.id, productId: offer.product.id, formulaVerifiedAt: offer.formulaVerifiedAt,
      startedAt: now, baselineDays, baselineComfort: validComfort(comfort) ? comfort : null, choice,
      hydrationLevel: survey.result.hydrationLevel, sensitive: survey.result.observationAssessment.isSensitive ?? null,
      analysisConsent: makeAnalysisConsent(consent, signedIn, now, protocol),
    },
  };
}

export function updateObservationStudy(record, study, now) {
  const key = record.productObservation ? "productObservation" : "moisturizerObservation";
  return { ...record, savedAt: now, [key]: study };
}

export function buildProductFollowUp(record, answers, now) {
  const study = getObservationStudy(record);
  const config = getObservationKind(study?.protocol);
  if (!config || !(validTightnessDays(answers.days) || (!config.legacy && answers.days === null)) ||
    !oneOf(answers.used, ["recommended", "existing", "other", "none"]) ||
    !oneOf(answers.frequency, ["daily", "sometimes", "none"]) ||
    (answers.used === "none") !== (answers.frequency === "none") ||
    !oneOf(answers.reaction, ["none", "irritation", "stopped_irritation", "stopped_other"]) ||
    !oneOf(answers.otherChanges, ["no", "yes", "unknown"])) return null;
  const elapsedDays = Math.floor((new Date(now) - new Date(study.startedAt)) / DAYS_MS);
  if (!Number.isFinite(elapsedDays) || elapsedDays < 0) return null;
  const slot = elapsedDays < CHECK_AFTER_DAYS ? "earlyCheck" : "followUp";
  if (study[slot]) return null;
  return updateObservationStudy(record, {
    ...study, [slot]: { days: answers.days, used: answers.used, frequency: answers.frequency,
      reaction: answers.reaction, otherChanges: answers.otherChanges, elapsedDays, recordedAt: now,
      ...(!config.legacy && { comfort: validComfort(answers.comfort) ? answers.comfort : null }) },
  }, now);
}

export function describeTightnessChange(study, report, symptom) {
  if (!validTightnessDays(report?.days)) return "당긴 날을 기억하지 못해 전후 비교는 건너뛰었어요.";
  if (report.days === 0) return `최근 7일 동안 ${symptom} 0일`;
  const fewer = study.baselineDays - report.days;
  return fewer > 0 ? `${report.days}일 · ${fewer}일 줄었지만 당김이 남아 있어요`
    : fewer < 0 ? `${report.days}일 · ${-fewer}일 늘었어요` : `${report.days}일 · 당긴 날이 같아요`;
}

export function describeComfortChange(study, report) {
  if (!validComfort(study.baselineComfort) || !validComfort(report?.comfort)) return null;
  const label = ["전혀 없음", "조금", "꽤", "많이"];
  return `피부 불편함: ${label[study.baselineComfort]} → ${label[report.comfort]}`;
}
