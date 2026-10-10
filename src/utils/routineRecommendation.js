import { products } from "../data/products";
import {
  isProductAllowedForContext,
  hasExfoliatingActive,
  isSpecializedTreatmentProduct,
  isValidProductLink,
  isProductAvailable,
} from "./productCatalog";
import {
  filterByLevel,
  getConcernMatchScore,
  sortProductsForRecommendation,
} from "./recommendationScoring";

export function getRecommendedIngredients(level, feedbackContext = {}) {
  const list = [];

  if (level <= 3) {
    list.push("세라마이드", "판테놀", "히알루론산");
  } else if (level <= 5) {
    list.push("히알루론산", "판테놀");
  } else if (level <= 7) {
    list.push("판테놀", "나이아신아마이드");
  } else {
    list.push("나이아신아마이드");
  }

  const clogged = feedbackContext.clogged ?? 0;
  const trouble = feedbackContext.trouble ?? 0;
  const irritated = feedbackContext.irritated ?? false;

  // 좁쌀·막힘이 늘었지만
  // 붉은 트러블이나 자극은 없는 경우에만 BHA 고려
  if (clogged >= 1 && trouble === 0 && !irritated && !list.includes("BHA")) {
    list.push("BHA");
  }

  return list;
}

export function pickBestProductByCategory(category, level, userContext = {}) {
  let targetCategory = category;

  let allowedCategories = [category];

  // 클렌저는 한 종류로 고정하지 않고
  // 현재 단계에 맞는 여러 세안제 중에서 비교
  if (category === "cleanser") {
    if (level <= 3) {
      allowedCategories = ["cleansing_milk", "cleanser", "gel_cleanser"];
    } else if (level >= 7) {
      allowedCategories = ["gel_cleanser", "cleanser"];
    } else {
      allowedCategories = ["cleanser", "gel_cleanser", "cleansing_milk"];
    }
  }

  let categoryProducts = products.filter(
    (product) =>
      allowedCategories.includes(product.category) &&
      isProductAllowedForContext(product, category, userContext),
  );

  // 단순 번들거림이 고민일 때는
  // AHA / BHA / 살리실산 같은 각질 기능성 제품을 기본 추천에서 제외
  if (
    userContext.mainConcern === "oiliness" &&
    (targetCategory === "toner" ||
      targetCategory === "serum" ||
      targetCategory === "cream")
  ) {
    const nonExfoliatingProducts = categoryProducts.filter(
      (product) => !hasExfoliatingActive(product),
    );

    if (nonExfoliatingProducts.length > 0) {
      categoryProducts = nonExfoliatingProducts;
    }
  }

  const levelMatchedProducts = filterByLevel(categoryProducts, level);

  // 현재 고민과 잘 맞는 제품은
  // 수분 단계가 최대 3단계 정도 차이나도 추가 후보로 허용
  const concernMatchedProducts =
    userContext.mainConcern && category !== "cleanser"
      ? categoryProducts.filter((product) => {
          const concernScore = getConcernMatchScore(
            product,
            userContext.mainConcern,
          );

          const levelDifference = Math.abs(
            (product.hydrationLevel ?? level) - level,
          );

          return concernScore >= 5 && levelDifference <= 3;
        })
      : [];

  // 기존 수분 단계 후보 + 고민 적합 후보 합치기
  let candidateProducts = [
    ...levelMatchedProducts,
    ...concernMatchedProducts.filter(
      (product) =>
        !levelMatchedProducts.some((matched) => matched.id === product.id),
    ),
  ];

  // 가까운 단계나 고민 적합 후보가 하나도 없으면
  // 안전 게이트를 통과한 같은 카테고리 전체로 fallback
  if (candidateProducts.length === 0) {
    candidateProducts = [...categoryProducts];
  }

  // 특별한 고민이 없거나 빠른 추천일 때는
  // 초보자용 + 각질 기능성이 없는 제품을 우선
  const isDefaultMode =
    !userContext.mainConcern || userContext.mainConcern === "none";

  if (isDefaultMode) {
    const isLeaveOnCategory = ["toner", "serum", "cream"].includes(category);

    const generalBeginnerCandidates = candidateProducts.filter(
      (product) =>
        product.beginnerFriendly &&
        !hasExfoliatingActive(product) &&
        (!isLeaveOnCategory || !isSpecializedTreatmentProduct(product)),
    );

    if (generalBeginnerCandidates.length > 0) {
      candidateProducts = generalBeginnerCandidates;
    } else {
      const broaderBeginnerSafe = categoryProducts.filter(
        (product) => product.beginnerFriendly && !hasExfoliatingActive(product),
      );

      if (broaderBeginnerSafe.length > 0) {
        candidateProducts = broaderBeginnerSafe;
      }
    }
  }

  // 민감 피부라면 sensitivitySafe 제품을 먼저 후보군으로 제한
  const sensitiveSafeProducts = userContext.isSensitive
    ? candidateProducts.filter((product) => product.sensitivitySafe)
    : candidateProducts;

  // 현재 수분 단계 안에 민감 안전 제품이 없다면
  // 같은 카테고리 전체에서 민감 안전 제품을 다시 탐색
  const broaderSensitiveProducts =
    userContext.isSensitive && sensitiveSafeProducts.length === 0
      ? categoryProducts.filter((product) => product.sensitivitySafe)
      : [];

  const safePool = userContext.isSensitive
    ? sensitiveSafeProducts.length > 0
      ? sensitiveSafeProducts
      : broaderSensitiveProducts.length > 0
        ? broaderSensitiveProducts
        : candidateProducts
    : candidateProducts;

  // 실제 구매 링크가 있는 제품 우선
  const linkedProducts = safePool.filter((product) =>
    isValidProductLink(product.link),
  );

  // 링크 있는 제품이 하나라도 있으면 그 안에서 추천
  const recommendationPool =
    linkedProducts.length > 0 ? linkedProducts : safePool;

  const sortedProducts = sortProductsForRecommendation(
    recommendationPool,
    level,
    userContext,
  );

  return sortedProducts[0] || null;
}

export function pickAlternativeNonExfoliatingProduct(
  category,
  level,
  userContext = {},
  excludedIds = [],
) {
  // 각질 기능성이 없는 같은 카테고리 제품만 후보
  let candidates = products.filter(
    (product) =>
      product.category === category &&
      isProductAvailable(product) &&
      !excludedIds.includes(product.id) &&
      !hasExfoliatingActive(product),
  );

  // 현재 수분 단계와 가까운 제품 우선
  let levelMatched = filterByLevel(candidates, level);

  // 가까운 단계에 제품이 없으면 전체 후보 사용
  if (levelMatched.length === 0) {
    levelMatched = candidates;
  }

  // 민감 피부라면 민감 안전 제품 우선
  if (userContext.isSensitive) {
    const sensitiveSafe = levelMatched.filter(
      (product) => product.sensitivitySafe,
    );

    if (sensitiveSafe.length > 0) {
      levelMatched = sensitiveSafe;
    }
  }

  // 실제 링크가 있는 제품 우선
  const linkedProducts = levelMatched.filter((product) =>
    isValidProductLink(product.link),
  );

  if (linkedProducts.length > 0) {
    levelMatched = linkedProducts;
  }

  const sorted = sortProductsForRecommendation(
    levelMatched,
    level,
    userContext,
  );

  return sorted[0] || null;
}

export function buildDynamicRoutine(level, userContext = {}) {
  const cleanser = pickBestProductByCategory("cleanser", level, userContext);

  const toner = pickBestProductByCategory("toner", level, userContext);

  let serum = pickBestProductByCategory("serum", level, userContext);

  let cream = pickBestProductByCategory("cream", level, userContext);

  // 토너와 세럼에 각질 기능성이 동시에 들어가면
  // 세럼을 순한 대체 제품으로 변경
  if (hasExfoliatingActive(toner) && hasExfoliatingActive(serum)) {
    const alternativeSerum = pickAlternativeNonExfoliatingProduct(
      "serum",
      level,
      userContext,
      [serum.id],
    );

    if (alternativeSerum) {
      serum = alternativeSerum;
    }
  }

  // 토너 또는 세럼에 이미 각질 기능성이 있다면
  // 크림까지 각질 기능성이 겹치지 않도록 변경
  if (
    (hasExfoliatingActive(toner) || hasExfoliatingActive(serum)) &&
    hasExfoliatingActive(cream)
  ) {
    const alternativeCream = pickAlternativeNonExfoliatingProduct(
      "cream",
      level,
      userContext,
      [cream.id],
    );

    if (alternativeCream) {
      cream = alternativeCream;
    }
  }

  return {
    label: `${level}단계 맞춤 루틴`,
    description: "현재 피부 상태와 주요 고민을 반영해 구성한 추천 루틴입니다.",

    products: {
      cleanser,
      toner,
      serum,
      cream,
    },
  };
}

export function buildRoutineReason(level) {
  if (level <= 3) {
    return [
      "현재 피부가 건조한 상태라 수분과 장벽 중심으로 루틴을 구성했습니다.",
      "보습을 충분히 유지하는 것이 중요한 단계입니다.",
      "자극이 적은 제품 위주로 피부를 안정시키는 것이 좋습니다.",
    ];
  }

  if (level <= 6) {
    return [
      "수분과 유분 밸런스를 맞추는 방향으로 루틴을 구성했습니다.",
      "과하게 바르기보다 현재 상태를 유지하는 것이 중요합니다.",
      "안정적인 조합으로 피부 컨디션을 유지하는 단계입니다.",
    ];
  }

  return [
    "유분과 피지 관리가 필요한 상태라 가벼운 루틴으로 구성했습니다.",
    "무거운 제품은 줄이고 산뜻한 제품 위주로 선택했습니다.",
    "트러블과 막힘을 줄이는 방향으로 관리하는 단계입니다.",
  ];
}
