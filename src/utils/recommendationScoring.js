import { RECOMMENDATION_RULE_VERSION, getProductEvidenceStatus } from "./productEvidence";
import { getProductCareProfile } from "./productCareProfile";
import { hasExfoliatingActive } from "./productCatalog";

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
  const careFit = getCareNeedMatchScore(product, userContext.careNeeds) * 0.55;
  const concernSupport = getConcernMatchScore(product, userContext.mainConcern) * 3.5;
  const moistureDistance = Math.abs((product.hydrationLevel ?? 5) - currentLevel);
  const parts = { careFit, concernSupport, moistureFit: -moistureDistance * 2.5,
    sensitiveFit: userContext.isSensitive && product.sensitivitySafe ? 4 : 0,
    beginnerFit: product.beginnerFriendly ? 1.5 : 0 };
  return { ruleVersion: RECOMMENDATION_RULE_VERSION, parts, total: Object.values(parts).reduce((sum, value) => sum + value, 0),
    moistureDistance, evidence: getProductEvidenceStatus(product), clinicalSuccessProbability: null };
}
export function getRecommendationScore(product, currentLevel, userContext = {}) {
  return getRecommendationBreakdown(product, currentLevel, userContext).total;
}

export function sortProductsForRecommendation(
  productList,
  currentLevel,
  userContext = {},
) {
  return [...productList].sort((a, b) => {
    const aScore = getRecommendationScore(a, currentLevel, userContext);

    const bScore = getRecommendationScore(b, currentLevel, userContext);

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
