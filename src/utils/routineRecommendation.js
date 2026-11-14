import { products } from "../data/products";
import {
  isProductAllowedForContext,
  hasExfoliatingActive,
  isSpecializedTreatmentProduct,
} from "./productCatalog";
import {
  filterByLevel,
  getConcernMatchScore,
  sortProductsForRecommendation,
  getRecommendationBreakdown,
} from "./recommendationScoring";
import { getRoutineFitSignals } from "./routineFitContext";

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

export function getRankedProductCandidates(category, level, userContext = {}) {
  if (!Number.isFinite(level) || userContext.irritated?.length || userContext.suppressedSlots?.has(category)) return [];
  let allowedCategories = [category];

  // 클렌저는 한 종류로 고정하지 않고
  // 현재 단계에 맞는 여러 세안제 중에서 비교
  if (category === "cleanser") {
    if (level <= 3) {
      allowedCategories = ["cleansing_milk", "cleanser", "gel_cleanser"];
    } else if (level >= 7 && !getRoutineFitSignals(category, userContext)?.washTight) {
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
  if (userContext.isSensitive) categoryProducts = categoryProducts.filter(product => product.sensitivitySafe);
  if (getRoutineFitSignals(category, userContext)?.heavy) {
    categoryProducts = categoryProducts.filter(product => product.careProfile.lightweightFit >= 7);
  }

  // 단순 번들거림이 고민일 때는
  // AHA / BHA / 살리실산 같은 각질 기능성 제품을 기본 추천에서 제외
  if (
    userContext.mainConcern === "oiliness" &&
    (category === "toner" || category === "serum" || category === "cream")
  ) {
    const nonExfoliatingProducts = categoryProducts.filter(
      (product) => !hasExfoliatingActive(product),
    );

    if (nonExfoliatingProducts.length > 0) {
      categoryProducts = nonExfoliatingProducts;
    }
  }

  // Compare the second-nearest band even when the closest band already has a candidate.
  // Without current observations, the legacy quick path keeps its published level behavior.
  const contextualFit = getRoutineFitSignals(category, userContext);
  const width = contextualFit?.washTight || contextualFit?.postMoistureTight || contextualFit?.heavy ? 3 : 2;
  const levelMatchedProducts = contextualFit
    ? categoryProducts.filter(product => Math.abs((product.hydrationLevel ?? 5) - level) <= width)
    : filterByLevel(categoryProducts, level);

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
    candidateProducts = contextualFit ? categoryProducts.filter(product => Math.abs((product.hydrationLevel ?? 5) - level) <= 3) : [...categoryProducts];
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

      if (!contextualFit && broaderBeginnerSafe.length > 0) {
        candidateProducts = broaderBeginnerSafe;
      }
    }
  }

  return sortProductsForRecommendation(
    candidateProducts,
    level,
    { ...userContext, slot: category },
  );
}

export function pickBestProductByCategory(category, level, userContext = {}) {
  return getRankedProductCandidates(category, level, userContext)[0] || null;
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
      isProductAllowedForContext(product, category, userContext) &&
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

    levelMatched = sensitiveSafe.length > 0 ? sensitiveSafe : candidates.filter(product => product.sensitivitySafe);
  }

  const sorted = sortProductsForRecommendation(
    levelMatched,
    level,
    userContext,
  );

  return sorted[0] || null;
}

export function buildDynamicRoutine(level, userContext = {}) {
  const categories = ["cleanser", "toner", "serum", "cream"];
  const pools = Object.fromEntries(categories.map(category => [category, getRankedProductCandidates(category, level, userContext)]));
  const cleanser = pools.cleanser[0] ?? null;
  const toner = pools.toner[0] ?? null;
  let serum = pools.serum[0] ?? null;
  let cream = pools.cream[0] ?? null;

  // 토너와 세럼에 각질 기능성이 동시에 들어가면
  // 세럼을 순한 대체 제품으로 변경
  if (hasExfoliatingActive(toner) && hasExfoliatingActive(serum)) {
    serum = pools.serum.find(product => !hasExfoliatingActive(product)) ?? null;
  }

  // 토너 또는 세럼에 이미 각질 기능성이 있다면
  // 크림까지 각질 기능성이 겹치지 않도록 변경
  if (
    (hasExfoliatingActive(toner) || hasExfoliatingActive(serum)) &&
    hasExfoliatingActive(cream)
  ) {
    cream = pools.cream.find(product => !hasExfoliatingActive(product)) ?? null;
  }

  const chosen = { cleanser, toner, serum, cream };
  const selectionEvidence = Object.fromEntries(Object.entries(chosen).map(([category, product]) => {
    if (!product) return [category, { reason: "확인된 자료와 피부 조건을 통과한 후보가 없어요." }];
    const context = { ...userContext, slot: category };
    const assessment = getRecommendationBreakdown(product, level, context);
    const ranked = pools[category];
    return [category, { productId: product.id, ...assessment,
      selectionPath: ranked[0]?.id === product.id ? "highest_fit_in_eligible_pool" : "compatibility_substitution",
      alternatives: ranked.filter(candidate => candidate.id !== product.id && (!hasExfoliatingActive(candidate) ||
        !Object.entries(chosen).some(([other, selected]) => other !== category && hasExfoliatingActive(selected))))
        .slice(0, 2).map(candidate => ({ productId: candidate.id, ...getRecommendationBreakdown(candidate, level, context) })),
    }];
  }));
  return {
    selectionEvidence,
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
