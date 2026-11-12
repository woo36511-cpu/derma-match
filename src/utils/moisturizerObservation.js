import { getProductById, isSpecializedTreatmentProduct } from "./productCatalog";
import { getProductEvidenceStatus } from "./productEvidence";
import { cosmeticProductProfiles } from "../data/cosmeticAddOns";
import { getSelectedAcneShapes } from "../data/simpleCare";
import { COSMETIC_OBSERVATION_GOALS, COSMETIC_TRACKS_BY_GOAL, getCosmeticObservationConfig, OBSERVATION_AREAS } from "../data/productObservationGoals";

export const LEGACY_PROTOCOL = "cheek-tightness-v1";
const LEGACY_CONSENT_VERSION = "moisturizer-internal-analysis-v1";
export const PRODUCT_CONSENT_VERSION = "skin-product-internal-analysis-v2";
export const COSMETIC_CONSENT_VERSION = "cosmetic-outcome-analysis-v3";
export const OBSERVATION_USE_DAYS = [
  ["zero", "쓰지 않았어요"], ["1_6", "1~6일"], ["7_13", "7~13일"],
  ["14_27", "14~27일"], ["28_plus", "28일 이상"], ["unknown", "잘 기억나지 않아요"],
];
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
  return Object.values(OBSERVATION_KINDS).find(kind => kind.protocol === protocol) ??
    Object.keys(COSMETIC_OBSERVATION_GOALS).map(getCosmeticObservationConfig).find(config => config.protocol === protocol);
}
export const getObservationCheckDays = config => config?.checkDays ?? CHECK_AFTER_DAYS;

export function isObservationValue(config, value) {
  return config?.options
    ? Number.isInteger(value) && config.options.some(([key]) => Number(key) === value)
    : validTightnessDays(value);
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

const basicCategories = {
  cleanser: OBSERVATION_KINDS.cleanser.categories,
  toner: ["toner"], serum: ["serum"], cream: ["cream"],
};
export function getBasicObservationTracks(profile) {
  const assessment = profile?.observationAssessment;
  const observed = assessment?.resolvedObservations;
  if (assessment?.canRecommendBasics !== true || assessment.currentIrritation) return {};
  const direct = getObservationKinds(profile);
  const tracks = {};
  for (const category of Object.keys(basicCategories)) {
    tracks[category] = [];
    if (category !== "cleanser" && !direct.includes(category) &&
        ["cheeks", "whole", "tzone"].includes(observed?.drynessArea)) tracks[category].push("dryness");
    if (category === "cream" && observed?.surfaceObservation === "flakes") tracks[category].push("flakes");
    if (category === "cleanser" && ["whole", "tzone"].includes(observed?.observedOil)) tracks[category].push("sebum");
  }
  return tracks;
}

const isVerifiedProduct = (product, evidence) => product && evidence.eligible && evidence.lastVerifiedAt;

export function getProductObservationOffers(survey) {
  const profile = survey?.result;
  const assessment = profile?.observationAssessment;
  if (survey?.type !== "initial_survey" || survey.symptomAssessment?.blockRoutine ||
      assessment?.canRecommendBasics !== true || assessment.currentIrritation) return [];
  const direct = getObservationKinds(profile);
  const basicTracks = getBasicObservationTracks(profile);
  const offers = [];
  const add = (kind, config, product, evidence, track, route) => {
    offers.push({ kind, config, product, track, route, formulaVerifiedAt: evidence.lastVerifiedAt });
  };
  for (const [category, allowed] of Object.entries(basicCategories)) {
    const product = getProductById(survey.routine?.[category]);
    const evidence = getProductEvidenceStatus(product);
    if (!isVerifiedProduct(product, evidence) || !allowed.includes(product.category) ||
        product.recommendationScope === "addon_only" || isSpecializedTreatmentProduct(product)) continue;
    if (direct.includes(category)) add(category, OBSERVATION_KINDS[category], product, evidence, null, "basic");
    for (const track of basicTracks[category] ?? []) {
      add(`${category}-${track}`, getCosmeticObservationConfig(track), product, evidence, track, "basic");
    }
  }

  const addon = survey.cosmeticAddOn;
  const goal = addon?.answers?.goal;
  const product = getProductById(addon?.recommendedProductId);
  const evidence = getProductEvidenceStatus(product);
  if (!["candidate", "covered"].includes(addon?.status) || !isVerifiedProduct(product, evidence) ||
      !cosmeticProductProfiles[product.id]?.goals.includes(goal)) return offers;
  const care = survey.additionalCare;
  const shapes = getSelectedAcneShapes(care);
  const tracks = (COSMETIC_TRACKS_BY_GOAL[goal] ?? []).filter(track => {
    if (["closed", "blackhead", "dark_mark"].includes(track)) return !shapes.length || shapes.includes(track);
    return true;
  });
  for (const track of tracks) {
    const duplicate = offers.findIndex(offer => offer.track === track && offer.product.id === product.id);
    if (duplicate !== -1) offers.splice(duplicate, 1);
    add(`addon-${track}-${product.id}`, getCosmeticObservationConfig(track), product, evidence, track, goal);
  }
  return offers;
}

export function makeAnalysisConsent(enabled, signedIn, now, protocol) {
  const version = protocol === LEGACY_PROTOCOL ? LEGACY_CONSENT_VERSION
    : getObservationKind(protocol)?.cosmetic ? COSMETIC_CONSENT_VERSION : PRODUCT_CONSENT_VERSION;
  return enabled && signedIn ? { version, grantedAt: now } : null;
}

export function buildProductObservation({ survey, kind, baselineDays, area, comfort, choice, consent, signedIn, now }) {
  const offer = getProductObservationOffers(survey).find(item => item.kind === kind);
  if (!offer || !isObservationValue(offer.config, baselineDays) || baselineDays === 0 || !oneOf(choice, ["start", "keep"]) ||
      (offer.config.cosmetic && !OBSERVATION_AREAS.some(([key]) => key === area))) return null;
  const protocol = offer.config.protocol;
  return {
    id: observationId(survey.id, kind), journeyId: survey.journeyId || survey.id,
    type: "feedback", source: "skin_product_observation", assessmentOnly: true,
    journeySchemaVersion: 3, savedAt: now,
    productObservation: {
      protocol, surveyId: survey.id, productId: offer.product.id, formulaVerifiedAt: offer.formulaVerifiedAt,
      startedAt: now, ...(offer.config.cosmetic ? { baselineValue: baselineDays, route: offer.route, area } : { baselineDays }),
      baselineComfort: validComfort(comfort) ? comfort : null, choice,
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
  if (!config || !(isObservationValue(config, answers.days) || (!config.legacy && answers.days === null)) ||
    !oneOf(answers.used, ["recommended", "existing", "other", "none"]) ||
    !oneOf(answers.frequency, ["daily", "sometimes", "none"]) ||
    (answers.used === "none") !== (answers.frequency === "none") ||
    !oneOf(answers.reaction, ["none", "irritation", "stopped_irritation", "stopped_other"]) ||
    !oneOf(answers.otherChanges, ["no", "yes", "unknown"]) ||
    (config.cosmetic && (!OBSERVATION_USE_DAYS.some(([key]) => key === answers.useDays) ||
      ((answers.used === "none") !== (answers.useDays === "zero"))))) return null;
  const elapsedDays = Math.floor((new Date(now) - new Date(study.startedAt)) / DAYS_MS);
  if (!Number.isFinite(elapsedDays) || elapsedDays < 0) return null;
  const slot = elapsedDays < getObservationCheckDays(config) ? "earlyCheck" : "followUp";
  if (study[slot]) return null;
  return updateObservationStudy(record, {
    ...study, [slot]: { ...(config.cosmetic ? { value: answers.days, useDays: answers.useDays } : { days: answers.days }), used: answers.used, frequency: answers.frequency,
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

export function describeObservationChange(study, report, config) {
  if (!config.cosmetic) return describeTightnessChange(study, report, config.symptom);
  if (!isObservationValue(config, report?.value)) return "이전과 비교할 응답이 없어요.";
  if (!config.options) {
    return describeTightnessChange({ baselineDays: study.baselineValue }, { days: report.value }, config.symptom)
      .replace("당김이 남아 있어요", "아직 남아 있어요").replace("당긴 날이 같아요", "느낀 날이 같아요");
  }
  const getLabel = value => config.options.find(([key]) => Number(key) === value)?.[1];
  return `${getLabel(study.baselineValue)} → ${getLabel(report.value)}`;
}

export function describeComfortChange(study, report) {
  if (!validComfort(study.baselineComfort) || !validComfort(report?.comfort)) return null;
  const label = ["전혀 없음", "조금", "꽤", "많이"];
  return `피부 불편함: ${label[study.baselineComfort]} → ${label[report.comfort]}`;
}
