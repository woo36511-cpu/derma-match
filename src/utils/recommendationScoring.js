import { getPersonalBasicFit } from "./personalProductFeedback";
import { RECOMMENDATION_RULE_VERSION, getProductEvidenceStatus } from "./productEvidence";
import { getProductCareProfile } from "./productCareProfile";
import { hasExfoliatingActive } from "./productCatalog";
import { getReviewedProductObservation, OBSERVATION_FIT_BONUS } from "./reviewedProductObservations";
import { getRoutineFitSignals } from "./routineFitContext";

export function getCareNeedMatchScore(product, careNeeds = {}) {
  if (!product) return 0;

  const {
    hydrationNeed = 0,
    lightTextureNeed = 0,
    soothingNeed = 0,
    congestionCareNeed = 0,
    inflammationCareNeed = 0,
    barrierCareNeed = 0,
  } = careNeeds || {};

  const profile = getProductCareProfile(product);

  const recoveryNeed = Math.max(soothingNeed, inflammationCareNeed);
  const category = product.category || "";
  const isCleanser = [
    "cleanser",
    "cleansing_oil",
    "cleansing_milk",
    "gel_cleanser",
    "bha_cleanser",
    "enzyme_cleanser",
  ].includes(category);

  const isLeaveOn = ["toner", "serum", "cream"].includes(category);

  const categoryWeights = isCleanser
    ? {
        hydration: 0.12,
        lightweight: 0.28,
        soothing: 0.12,
        congestion: 0.26,
        barrier: 0.12,
      }
    : category === "cream"
      ? {
          hydration: 0.26,
          lightweight: 0.16,
          soothing: 0.18,
          congestion: 0.12,
          barrier: 0.28,
        }
      : {
          hydration: 0.24,
          lightweight: 0.22,
          soothing: 0.2,
          congestion: 0.22,
          barrier: 0.12,
        };

  let score = 0;

  // 필요한 정도가 높을수록
  // 해당 제품 능력치의 영향도도 커짐
  score += hydrationNeed * profile.hydrationSupport * categoryWeights.hydration;

  score +=
    lightTextureNeed * profile.lightweightFit * categoryWeights.lightweight;

  score += soothingNeed * profile.soothingSupport * categoryWeights.soothing;

  score +=
    congestionCareNeed * profile.congestionSupport * categoryWeights.congestion;

  // 피부가 예민하거나 염증 신호가 높으면
  // 장벽 지원 능력도 중요하게 반영
  score +=
    Math.max(recoveryNeed, barrierCareNeed) *
    profile.barrierSupport *
    categoryWeights.barrier;

  // 염증 신호가 높은 사람에게
  // 각질 기능성 제품을 화장품 기본 루틴으로
  // 과하게 밀어주지 않도록 패널티
  if (inflammationCareNeed >= 6 && hasExfoliatingActive(product)) {
    score -= 25;
  }

  // 염증/민감 신호가 높은데
  // 민감 안전 제품이 아니라면 추가 패널티
  if (inflammationCareNeed >= 6 && !product.sensitivitySafe) {
    score -= 15;
  }

  if (isLeaveOn && barrierCareNeed >= 7 && profile.barrierSupport <= 2) {
    score -= 8;
  }

  if (isCleanser && hydrationNeed >= 7 && profile.lightweightFit <= 3) {
    score -= 5;
  }

  return score;
}

export function getConcernMatchScore(product, mainConcern) {
  if (!getProductEvidenceStatus(product).profileReviewed) return 0;
  const p = getProductCareProfile(product);
  // Cosmetic scores describe support/texture fit; an acne tag is not treatment evidence.
  switch (mainConcern) {
    case "inflammatory_acne": return p.soothingSupport * 0.6 + p.barrierSupport * 0.4;
    case "closed_comedones":
    case "blackhead_sebum": return p.congestionSupport * 0.5 + p.lightweightFit * 0.2;
    case "dehydration": return p.hydrationSupport * 0.65 + p.barrierSupport * 0.35;
    case "sensitivity_redness": return p.soothingSupport * 0.6 + p.barrierSupport * 0.4;
    case "oiliness": return p.lightweightFit * 0.8 + p.congestionSupport * 0.2;
    default: return 0;
  }
}
export function getRecommendationBreakdown(product, currentLevel, userContext = {}) {
  const slot = userContext.slot ?? (["cleanser", "cleansing_milk", "gel_cleanser", "bha_cleanser", "enzyme_cleanser"].includes(product.category) ? "cleanser" : product.category);
  const fit = getRoutineFitSignals(slot, userContext);
  const p = getProductCareProfile(product);
  const rawNeeds = userContext.careNeeds ?? {};
  const careFit = fit ? getCareNeedMatchScore(product, {
    ...rawNeeds, hydrationNeed: 0, lightTextureNeed: 0, barrierCareNeed: 0,
  }) * 0.4 : getCareNeedMatchScore(product, rawNeeds) * 0.55;
  const concernSupport = getConcernMatchScore(product, userContext.mainConcern) * 3.5;
  const moistureDistance = Math.abs((product.hydrationLevel ?? 5) - currentLevel);
  const evidence = getProductEvidenceStatus(product);
  const observation = getReviewedProductObservation(product, evidence, currentLevel, userContext);
  const personalFit = getPersonalBasicFit(product, currentLevel, userContext);
  const weights = {
    cleanser: [0.12, 0.12, 0.04], toner: [0.12, 0.07, 0.04],
    serum: [0.15, 0.08, 0.09], cream: [0.16, 0.13, 0.16],
  }[slot] ?? [0.12, 0.08, 0.07];
  const oilOnlyInTZone = fit?.zonedOil && !fit.heavy;
  const parts = { careFit, concernSupport,
    moistureFit: -moistureDistance * (fit ? (fit.washTight || fit.postMoistureTight || fit.heavy ? 0.9 : 1.6) : 2.5),
    ...(fit && {
      hydrationFit: fit.hydration * p.hydrationSupport * weights[0],
      textureFit: fit.texture * p.lightweightFit * weights[1],
      barrierFit: fit.barrier * p.barrierSupport * weights[2],
      washComfortFit: fit.washTight ? (p.hydrationSupport * 0.65 + p.soothingSupport * 0.3 + (product.category === "cleansing_milk" ? 0.75 : 0)) : 0,
      localTextureFit: oilOnlyInTZone && slot === "cream" ? p.barrierSupport * 0.7 : 0,
      hydrationRoleFit: fit.postMoistureTight && slot === "cream" ? p.barrierSupport * 0.7 : 0,
    }),
    sensitiveFit: userContext.isSensitive && product.sensitivitySafe ? 4 : 0,
    beginnerFit: product.beginnerFriendly ? 1.5 : 0,
    ...(observation && { reviewedObservation: OBSERVATION_FIT_BONUS }), ...(personalFit && { personalFit }) };
  return { ruleVersion: RECOMMENDATION_RULE_VERSION, parts, total: Object.values(parts).reduce((sum, value) => sum + value, 0),
    moistureDistance, evidence, clinicalSuccessProbability: null,
    ...(observation && { reviewedObservation: { protocol: observation.protocol, reviewedOn: observation.reviewedOn } }) };
}
export function getRecommendationScore(product, currentLevel, userContext = {}) {
  return getRecommendationBreakdown(product, currentLevel, userContext).total;
}

export function sortProductsForRecommendation(
  productList,
  currentLevel,
  userContext = {},
) {
  const scores = new Map(productList.map(product => [product.id, getRecommendationScore(product, currentLevel, userContext)]));
  return [...productList].sort((a, b) => {
    const aScore = scores.get(a.id);
    const bScore = scores.get(b.id);

    if (aScore !== bScore) {
      return bScore - aScore;
    }

    // 동점일 때 주요 고민 적합도를 다시 우선
    const aConcernScore = getConcernMatchScore(a, userContext.mainConcern);

    const bConcernScore = getConcernMatchScore(b, userContext.mainConcern);

    if (aConcernScore !== bConcernScore) {
      return bConcernScore - aConcernScore;
    }

    const aDiff = Math.abs((a.hydrationLevel ?? 5) - currentLevel);

    const bDiff = Math.abs((b.hydrationLevel ?? 5) - currentLevel);

    if (aDiff !== bDiff) {
      return aDiff - bDiff;
    }

    if (userContext.isSensitive) {
      const aSensitive = a.sensitivitySafe ? 1 : 0;

      const bSensitive = b.sensitivitySafe ? 1 : 0;

      if (aSensitive !== bSensitive) {
        return bSensitive - aSensitive;
      }
    }

    const aBeginner = a.beginnerFriendly ? 1 : 0;

    const bBeginner = b.beginnerFriendly ? 1 : 0;

    return bBeginner - aBeginner || (a.id ?? 0) - (b.id ?? 0);
  });
}

export function sortProductsForDisplay(productList, currentLevel) {
  return [...productList].sort((a, b) => {
    const aBeginner = a.beginnerFriendly ? 1 : 0;
    const bBeginner = b.beginnerFriendly ? 1 : 0;

    if (aBeginner !== bBeginner) {
      return bBeginner - aBeginner;
    }

    const aDiff = Math.abs((a.hydrationLevel ?? 5) - currentLevel);
    const bDiff = Math.abs((b.hydrationLevel ?? 5) - currentLevel);

    if (aDiff !== bDiff) {
      return aDiff - bDiff;
    }

    const aSensitive = a.sensitivitySafe ? 1 : 0;
    const bSensitive = b.sensitivitySafe ? 1 : 0;

    if (aSensitive !== bSensitive) {
      return bSensitive - aSensitive;
    }

    return 0;
  });
}

export function filterByLevel(productList, level) {
  let filtered = productList.filter((product) => {
    const productLevel = product.hydrationLevel ?? 5;
    return Math.abs(productLevel - level) <= 1;
  });

  if (filtered.length === 0) {
    filtered = productList.filter((product) => {
      const productLevel = product.hydrationLevel ?? 5;
      return Math.abs(productLevel - level) <= 2;
    });
  }

  return filtered;
}
