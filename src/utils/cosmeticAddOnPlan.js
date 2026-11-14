import { getProductEvidenceStatus } from "./productEvidence";
import { products } from "../data/products";
import { COSMETIC_ADDON_VERSION, cleanCosmeticAnswers, isCosmeticComplete, cosmeticProductProfiles } from "../data/cosmeticAddOns";
import { getProductCareProfile } from "./productCareProfile";
import { getCareNeedMatchScore } from "./recommendationScoring";
import { hasExfoliatingActive, isProductAvailable } from "./productCatalog";
import { acneTraceShapes, getSelectedAcneShapes, inflamedAcneShapes } from "../data/simpleCare";

import { COSMETIC_TRACKS_BY_GOAL } from "../data/productObservationGoals";
import { COSMETIC_OBSERVATION_FIT_BONUS, getReviewedCosmeticObservation } from "./reviewedProductObservations";
import { avoidPersonalProduct, getPersonalCosmeticFit } from "./personalProductFeedback";
import { getIngredientFamilies, getCompatibilityRisk } from "./ingredientCompatibility";
import { getRoutineFitSignals } from "./routineFitContext";

export function buildCosmeticAddOnPlan(input, { profile = {}, surveyAnswers = {}, carePlan = {}, routine = {}, personalProductFeedback, knownSerumFamilies = [], serumIrritation = false, currentRoutine = {} } = {}) {
  const answers = cleanCosmeticAnswers(input, carePlan);
  const result = { version: COSMETIC_ADDON_VERSION, answers, complete: isCosmeticComplete(answers, carePlan), product: null, suppressPharmacy: false };
  const hold = (title, detail) => ({ ...result, status: "hold", title, detail });
  if (!result.complete) return hold("추가 질문을 마쳐주세요.", "현재 상태와 사용 중인 성분을 확인한 뒤 후보를 골라요.");
  if (carePlan.blockNewBasics || ["irritated", "concerning"].includes(answers.comfort)) return hold("지금은 새 기능성 제품을 추가하지 않아요.", "편안했던 세안·보습을 유지해요. 빠르게 퍼지는 붉어짐·심한 붓기나 통증은 오늘 확인받으세요.");
  if (answers.goal === "sebum" && answers.shine !== "later") {
    if (answers.shine === "immediate") return hold("세럼을 더하기 전에 무거운 제품 하나부터 점검해요.", "바른 직후부터 무겁다면 선크림이나 크림 등 부담이 느껴지는 제품 한 가지의 제형을 비교해요. 편안한 제품과 보습은 유지해요.");
    if (answers.shine === "fine") return hold("지금 쓰는 제품을 그대로 유지해도 돼요.", "불편한 번들거림이 없다면 유분 관리 세럼을 더할 필요는 없어요.");
    return hold("번들거리는 시점부터 확인해요.", "바른 직후의 광택과 몇 시간 뒤 느껴지는 기름기를 구분한 뒤 필요한 관리만 골라요.");
  }
  if (serumIrritation || currentRoutine.irritated?.length) return hold("현재 제품의 사용 반응부터 확인해요.", "쓰고 나서 따갑거나 붉었다면 새 화장품을 더하기 전에 어떤 제품에서 불편했는지 확인해요.");
  if (answers.goal === "sebum" && answers.oilArea === "unknown") return hold("어느 부위가 번들거리는지 먼저 살펴봐요.", "평소 오후에 기름기가 느껴지는 부위를 확인한 뒤 그곳만 관리해요.");
  const knownSkinAnswers = ["afterWash", "afternoonFeel", "areaDifference", "creamFeel", "innerDryness", "sensitivity"].filter(key => typeof surveyAnswers[key] === "string" && !surveyAnswers[key].includes("모르겠"));
  if (profile.observationAssessment ? !profile.observationAssessment.canRecommendBasics : knownSkinAnswers.length < 3) return hold("피부타입 답변을 조금 더 확인해요.", "정보가 부족한 상태에서 기능성 제품을 확정하지 않아요. 피부타입 답변을 보완한 뒤 다시 확인해요.");
  if (answers.goal !== "support" && profile.observationAssessment?.canRecommendActives === false) return hold("확인된 특징에 맞춘 기본 관리부터 시작해요.", "추가 기능성은 유분·당김과 현재 상태가 더 확인되면 살펴봐요. 보습 보완은 별도로 비교할 수 있어요.");
  if (answers.goal !== "support" && profile.observationAssessment?.recentChange) return hold("최근 변한 피부 상태부터 확인해요.", "상태가 일정하지 않은 동안 새 기능성을 더하지 않아요. 편안했던 기본 관리를 유지하고 피부타입 답변을 다시 확인해요.");
  if (answers.comfort === "unknown") return hold("사용할 부위의 자극 여부부터 확인해요.", "따가움·벗겨짐 여부를 알기 전에는 새 기능성 제품을 추가하지 않아요.");
  const currentFamilies = [...(currentRoutine.currentFamilies ?? []), ...knownSerumFamilies];
  const actives = new Set([...(answers.actives || []), ...currentFamilies]);
  const basicProducts = Object.values(routine.products ?? {}).filter(Boolean);
  const proposedFamilies = basicProducts.flatMap(getIngredientFamilies);
  const unlistedNeedCheck = currentRoutine.uncertainActives?.length > 0 && !answers.unlistedIngredientsChecked;
  if (actives.has("unknown") || carePlan.answers?.medicine === "unknown") return hold("지금 쓰는 제품의 성분부터 확인해요.", "성분을 모르는 제품과의 조합을 안전하다고 안내하지 않아요. 포장 성분표를 확인한 뒤 답을 바꿔요.");
  if (answers.goal !== "support" && (answers.special !== "none" || answers.experience === "reacted")) return hold("이번에는 기능성 제품의 추가를 보류해요.", "별도 확인이 필요한 상황이나 과거 자극 경험이 있어요. 잘 맞는 기본 보습과 자외선 차단을 유지해요.");
  const care = carePlan.answers ?? {};
  if (answers.goal !== "support" && care.breakoutExtent && care.breakoutExtent !== "local")
    return hold("돌기가 있는 범위를 먼저 확인해요.", "여러 부위에 새 각질·기능성 제품을 추가하기 전에 현재 상태부터 살펴봐요.");
  const hasInflamedOrUnknown = (care.shapes ?? [care.shape]).some(shape => inflamedAcneShapes.includes(shape) || shape === "unknown");
  if (answers.goal !== "support" && (surveyAnswers.mainIssue === "붉고 아픈 여드름" || ["folliculitis", "unknown"].includes(care.concern) || hasInflamedOrUnknown)) return hold("현재 트러블 관리부터 정리해요.", "원인이 불분명하거나 붉은 돌기가 있을 때는 새 각질·미백 제품을 더하지 않아요. 보습 보완은 별도로 살펴볼 수 있어요.");
  if (answers.goal !== "support" && acneTraceShapes.includes(care.shape) && !(care.shape === "dark_mark" && answers.goal === "tone")) return hold("고른 자국이나 흉터에는 새 기능성 제품을 권하지 않아요.", "평평한 갈색 자국의 톤 관리와 붉은 자국·패이거나 솟은 흉터의 관리는 달라요. 기본 보습과 자외선 차단을 유지해요.");
  if (answers.goal !== "support" && care.shapes?.length > 1 && carePlan.pharmacy && !(answers.goal === "texture" && answers.route === "cosmetic_first")) return hold("지금 고른 관리 하나부터 살펴봐요.", "다른 고민 때문에 새 기능성 제품과 여드름약을 함께 시작하지 않아요.");
  if (answers.goal !== "support" && (actives.has("benzoyl") || actives.has("medicine") || (carePlan.answers?.medicine && carePlan.answers.medicine !== "none"))) return hold("사용 중인 약에 새 기능성을 겹치지 않아요.", "처방·여드름약 사용법을 우선해요. 추가 제품 대신 보습 보완이 필요한지 살펴봐요.");
  const isSensitive = profile.observationAssessment?.isSensitive || (profile.scores?.sensitivity ?? 0) >= 5 || String(profile.skinType).includes("민감");
  const observedSkin = profile.observationAssessment?.resolvedObservations;
  const level = profile.hydrationLevel;
  if (!Number.isFinite(level)) return hold("제품의 보습 기준을 확인하지 못했어요.", "피부타입 답변을 확인한 뒤 다시 추천받아요.");
  const sensitiveReaction = surveyAnswers.sensitivity === "자주 따갑고 붉어진다";
  let candidates = products.filter(product => {
    const extra = cosmeticProductProfiles[product.id];
    if (!extra?.goals.includes(answers.goal) || !isProductAvailable(product) || avoidPersonalProduct(product, personalProductFeedback) || !getProductEvidenceStatus(product).eligible) return false;
    if (Math.abs(product.hydrationLevel - level) > 3) return false;
    if ((answers.goal === "sebum" || observedSkin?.observedOil === "whole" || (!observedSkin && level >= 7)) && getProductCareProfile(product).lightweightFit < 5) return false;
    if ((isSensitive || sensitiveReaction) && (!product.sensitivitySafe || extra.intensity === "exfoliant" || extra.intensity === "high")) return false;
    if (currentRoutine.ownedProductIds?.has(product.id)) return false;
    const candidateFamilies = [...new Set([...extra.families, ...getIngredientFamilies(product)])];
    const intensive = ["high", "exfoliant"].includes(extra.intensity);
    if (getCompatibilityRisk(candidateFamilies, actives, intensive)) return false;
    if (!basicProducts.some(item => item.id === product.id) &&
      getCompatibilityRisk(candidateFamilies, proposedFamilies.filter(family => ["acid", "retinoid", "benzoyl"].includes(family) ||
        (family === "niacinamide" && extra.intensity === "high")), intensive)) return false;
    if (intensive && (unlistedNeedCheck ||
      getCompatibilityRisk(candidateFamilies, currentRoutine.rinseOffFamilies, true))) return false;
    if (extra.intensity === "high" && (!["tolerated", "tolerated_vitamin_c"].includes(answers.experience) || actives.has("retinoid") || actives.has("acid") || actives.has("vitaminC"))) return false;
    if (extra.requiresVitaminCExperience && (answers.experience !== "tolerated_vitamin_c" || answers.comfort !== "comfortable" || actives.has("peptide") || (profile.careNeeds?.barrierCareNeed ?? 0) >= 6)) return false;
    if (extra.intensity === "exfoliant") {
      if (answers.comfort !== "comfortable" || actives.has("acid") || actives.has("retinoid") || actives.has("vitaminC") || (profile.careNeeds?.barrierCareNeed ?? 0) >= 6) return false;
      if (carePlan.pharmacy && answers.route !== "cosmetic_first") return false;
    }
    return true;
  });
  const shapes = getSelectedAcneShapes(care);
  const observedArea = ["whole", "tzone", "cheeks"].includes(observedSkin?.drynessArea) ? observedSkin.drynessArea : undefined;
  const oilLocation = ["whole", "tzone"].includes(answers.oilArea) ? answers.oilArea : undefined;
  const observationContext = {
    personalProductFeedback, sensitive: Boolean(isSensitive || sensitiveReaction), route: answers.goal,
    locations: { dryness: observedArea, flakes: observedArea, sebum: oilLocation, pores: oilLocation, ...care.locations },
    tracks: COSMETIC_TRACKS_BY_GOAL[answers.goal].filter(track =>
      !["closed", "blackhead", "dark_mark"].includes(track) || shapes.includes(track)),
  };
  const score = p => {
    const fit = getRoutineFitSignals(p.category, { careNeeds: profile.careNeeds, observedSkin, slotReactions: currentRoutine.slotReactions });
    const axes = getProductCareProfile(p);
    const texture = answers.goal === "sebum" ? Math.max(5, fit?.texture ?? 0) : fit?.texture ?? 0;
    const currentFit = fit ? (fit.hydration * axes.hydrationSupport + texture * axes.lightweightFit + fit.barrier * axes.barrierSupport) / 35 : 0;
    return getCareNeedMatchScore(p, profile.careNeeds) / 10 + currentFit -
      Math.abs(p.hydrationLevel - level) * (fit ? 3.5 : 5) + (p.sensitivitySafe ? 1 : 0) +
      getPersonalCosmeticFit(p, level, observationContext) +
      (getReviewedCosmeticObservation(p, getProductEvidenceStatus(p), level, observationContext) ? COSMETIC_OBSERVATION_FIT_BONUS : 0);
  };
  const scores = new Map(candidates.map(candidate => [candidate.id, score(candidate)]));
  candidates.sort((a, b) => scores.get(b.id) - scores.get(a.id) || a.id - b.id);
  const preferred = answers.serumFocus
    ? candidates.filter(p => cosmeticProductProfiles[p.id].focus === answers.serumFocus)
    : answers.experience === "tolerated_vitamin_c"
      ? candidates.filter(p => cosmeticProductProfiles[p.id].requiresVitaminCExperience) : [];
  if (preferred.length) candidates = preferred;
  if (answers.goal === "sebum") {
    const serums = candidates.filter(product => product.category === "serum");
    if (serums.length) candidates = serums;
  }
  const product = candidates[0];
  if (!product && unlistedNeedCheck && answers.goal === "texture") return hold("이미 쓰는 제품의 포장 성분표부터 확인해요.", "확인하기 전에는 각질 관리제를 새로 더하지 않아요. 성분을 확인한 뒤 추가 추천 답변을 바꿀 수 있어요.");
  if (answers.goal === "sebum" && (!product || product.category !== "serum") && actives.has("niacinamide")) {
    return hold(currentRoutine.currentFamilies ? "이미 쓰는 나이아신아마이드 제품을 먼저 확인해요." : "이미 쓰는 나이아신아마이드 세럼은 유지해요.", "같은 성분의 세럼을 더하지 않아요. 번들거림이 남아 있다면 편한 제품을 유지하면서 이마·코 등 신경 쓰이는 부위만 살펴봐요.");
  }
  if (!product) return hold("지금 조건에 맞는 추가 후보가 없어요.", "이미 쓰는 제품과 성분 중복, 보습감, 자극 여부를 확인했어요. 편안한 기본 루틴을 유지해요.");
  const extra = cosmeticProductProfiles[product.id];
  const oilArea = { tzone: "이마·코 주변", whole: "기름기가 느껴지는 얼굴 부위", other: "선택한 번들거리는 부위" }[answers.oilArea];
  const duplicateBasic = Object.values(routine.products ?? {}).some(p => p?.id === product.id);
  const roleFit = getRoutineFitSignals(product.category, { careNeeds: profile.careNeeds, observedSkin });
  return { ...result, status: duplicateBasic ? "covered" : "candidate", product, classification: extra.label,
    source: extra.source ?? product.evidence.sources?.find(s => s.sourceType.includes("official_domestic"))?.url,
    suppressPharmacy: hasExfoliatingActive(product) && answers.route === "cosmetic_first" && carePlan.answers?.medicine === "none",
    title: duplicateBasic ? "기본 추천 제품으로 이 목적도 보완할 수 있어요." : "추가 후보는 한 가지만 먼저 살펴봐요.",
    detail: duplicateBasic ? "아래 제품은 기본 루틴에 이미 포함된 후보예요. 같은 제품을 하나 더 추가할 필요는 없어요."
      : (answers.serumFocus || answers.experience === "tolerated_vitamin_c") && !preferred.length
        ? "보고 싶다고 고른 성분의 제품은 지금 조건에 맞지 않아, 같은 목적의 다른 후보를 골랐어요."
        : "선택한 고민과 보습 단계에 맞추고, 답변한 성분군과의 중복을 확인한 후보예요.",
    fit: answers.goal === "sebum" ? `${oilArea}의 오후 번들거림이 신경 쓰일 때 비교할 후보예요. 피지가 줄어드는 정도는 제품과 사람에 따라 달라요.`
      : roleFit?.note ?? (level <= 4 ? "보습을 유지하면서 필요한 부위에 사용해요." : level >= 7 ? "무거운 제형보다 가벼운 사용감을 우선했어요." : "수분·유분의 균형을 고려했어요."),
    placement: answers.goal === "sebum" ? `${oilArea}부터 살펴봐요. 볼이 당긴다면 그 부위에는 잘 맞던 보습을 유지해요. 이미 쓰는 세럼이 있다면 새 세럼을 겹치기 전에 기존 제품의 역할을 먼저 확인해요.`
      : extra.placement ?? (product.category === "toner" ? "기존 토너를 쓰는 날과 구분해 토너 단계에서 한 가지로 사용해요." : product.category === "cream" ? "기존 크림과 역할을 비교해 해당 부위의 크림 단계에서 조절해요." : "기존 세럼·에센스와 역할을 비교해 한 가지로 교체하거나 필요한 부위에만 사용해요."),
  };
}
export function snapshotCosmeticAddOn(plan) {
  return { version: COSMETIC_ADDON_VERSION, answers: plan.answers, status: plan.status, recommendedProductId: plan.product?.id ?? null, suppressPharmacy: plan.suppressPharmacy, title: plan.title };
}
