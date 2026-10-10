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
  } = careNeeds || {};

  const profile = getProductCareProfile(product);

  const recoveryNeed = Math.max(soothingNeed, inflammationCareNeed);

  let score = 0;

  // 필요한 정도가 높을수록
  // 해당 제품 능력치의 영향도도 커짐
  score += hydrationNeed * profile.hydrationSupport * 0.28;

  score += lightTextureNeed * profile.lightweightFit * 0.22;

  score += soothingNeed * profile.soothingSupport * 0.2;

  score += congestionCareNeed * profile.congestionSupport * 0.2;

  // 피부가 예민하거나 염증 신호가 높으면
  // 장벽 지원 능력도 중요하게 반영
  score += recoveryNeed * profile.barrierSupport * 0.1;

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

  return score;
}

export function getConcernMatchScore(product, mainConcern) {
  const concerns = product.concerns || [];

  const has = (...tags) => tags.some((tag) => concerns.includes(tag));

  const texture = String(product.texture || "").toLowerCase();

  const isLightTexture = ["light", "gel", "watery", "fresh"].includes(texture);

  let score = 0;

  // 염증성 여드름
  if (mainConcern === "inflammatory_acne") {
    if (has("acne")) score += 6;
    if (has("soothing")) score += 3;
    if (has("barrier")) score += 1;
  }

  // 좁쌀 / 막힘
  if (mainConcern === "closed_comedones") {
    if (has("closed_comedones")) score += 6;
    if (has("pores")) score += 4;
    if (has("sebum")) score += 2;
    if (isLightTexture) score += 3;
    if (has("acne")) score += 1;
  }

  // 블랙헤드 / 피지
  if (mainConcern === "blackhead_sebum") {
    if (has("blackhead")) score += 6;
    if (has("pores")) score += 5;
    if (has("sebum")) score += 4;
    if (isLightTexture) score += 2;
  }

  // 속당김 / 건조함
  if (mainConcern === "dehydration") {
    if (has("hydration")) score += 6;
    if (has("barrier")) score += 4;
    if (has("soothing")) score += 1;
  }

  // 민감 / 붉어짐
  if (mainConcern === "sensitivity_redness") {
    if (has("soothing")) score += 6;
    if (product.sensitivitySafe) score += 4;
    if (has("barrier")) score += 3;
    if (has("hydration")) score += 1;
  }

  // 번들거림
  if (mainConcern === "oiliness") {
    if (has("sebum")) score += 6;
    if (isLightTexture) score += 5;
    if (has("pores")) score += 2;
    if (has("blackhead")) score += 1;
  }

  return score;
}

export function getRecommendationScore(
  product,
  currentLevel,
  userContext = {},
) {
  const careScore = getCareNeedMatchScore(product, userContext.careNeeds);

  const concernScore = getConcernMatchScore(product, userContext.mainConcern);

  const hydrationDifference = Math.abs(
    (product.hydrationLevel ?? 5) - currentLevel,
  );

  let score = 0;

  // careScore는 최대 약 100 범위라
  // 0~10 정도로 정규화해서 사용
  score += (careScore / 10) * 5.5;

  // 사용자가 직접 선택한 주요 고민을
  // 충분히 크게 반영
  score += concernScore * 3.5;

  // 현재 수분감 단계와 너무 멀면 감점
  score -= hydrationDifference * 2.5;

  if (userContext.isSensitive && product.sensitivitySafe) {
    score += 4;
  }

  if (product.beginnerFriendly) {
    score += 1.5;
  }

  return score;
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

    return bBeginner - aBeginner;
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
