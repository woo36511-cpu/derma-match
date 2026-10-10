export function clampProductCareScore(value) {
  return Math.max(0, Math.min(10, Math.round(value)));
}

export function getProductCareProfile(product) {
  if (!product) {
    return {
      hydrationSupport: 0,
      lightweightFit: 0,
      soothingSupport: 0,
      congestionSupport: 0,
      barrierSupport: 0,
    };
  }

  const concerns = product.concerns || [];

  const texture = String(product.texture || "").toLowerCase();

  const ingredientText = (product.ingredients || []).join(" ").toLowerCase();

  const hasConcern = (...tags) => tags.some((tag) => concerns.includes(tag));

  const hasIngredient = (...keywords) =>
    keywords.some((keyword) =>
      ingredientText.includes(String(keyword).toLowerCase()),
    );

  // =========================
  // 1. 수분 / 보습 지원
  // =========================

  let hydrationSupport = 0;

  if (hasConcern("hydration")) {
    hydrationSupport += 5;
  }

  if (hasConcern("barrier")) {
    hydrationSupport += 2;
  }

  if (hasIngredient("히알루론산", "hyaluronic")) {
    hydrationSupport += 1;
  }

  if (hasIngredient("글리세린", "glycerin")) {
    hydrationSupport += 1;
  }

  if (hasIngredient("판테놀", "panthenol")) {
    hydrationSupport += 1;
  }

  // =========================
  // 2. 가벼운 제형 적합도
  // =========================

  let lightweightFit = 5;

  if (["light", "gel", "watery", "fresh"].includes(texture)) {
    lightweightFit = 9;
  }

  if (["lotion", "emulsion"].includes(texture)) {
    lightweightFit = 6;
  }

  if (["rich", "heavy", "balm"].includes(texture)) {
    lightweightFit = 2;
  }

  // =========================
  // 3. 진정 지원
  // =========================

  let soothingSupport = 0;

  if (hasConcern("soothing")) {
    soothingSupport += 5;
  }

  if (product.sensitivitySafe) {
    soothingSupport += 2;
  }

  if (
    hasIngredient(
      "판테놀",
      "panthenol",
      "병풀",
      "시카",
      "centella",
      "마데카소사이드",
      "알란토인",
    )
  ) {
    soothingSupport += 2;
  }

  if (hasConcern("barrier")) {
    soothingSupport += 1;
  }

  // =========================
  // 4. 피지 / 모공 막힘 지원
  // =========================

  let congestionSupport = 0;

  if (hasConcern("closed_comedones")) {
    congestionSupport += 7;
  }

  if (hasConcern("blackhead")) {
    congestionSupport += 7;
  }

  if (hasConcern("pores")) {
    congestionSupport += 5;
  }

  if (hasConcern("sebum")) {
    congestionSupport += 4;
  }

  if (hasConcern("acne")) {
    congestionSupport += 2;
  }

  if (hasIngredient("bha", "살리실산", "베타인살리실레이트")) {
    congestionSupport += 2;
  }

  // =========================
  // 5. 장벽 지원
  // =========================

  let barrierSupport = 0;

  if (hasConcern("barrier")) {
    barrierSupport += 6;
  }

  if (hasIngredient("세라마이드", "ceramide")) {
    barrierSupport += 2;
  }

  if (hasIngredient("스쿠알란", "squalane")) {
    barrierSupport += 1;
  }

  if (hasIngredient("판테놀", "panthenol")) {
    barrierSupport += 1;
  }

  const inferredProfile = {
    hydrationSupport: clampProductCareScore(hydrationSupport),

    lightweightFit: clampProductCareScore(lightweightFit),

    soothingSupport: clampProductCareScore(soothingSupport),

    congestionSupport: clampProductCareScore(congestionSupport),

    barrierSupport: clampProductCareScore(barrierSupport),
  };

  // 나중에 products.js에서
  // 제품별 수동 보정 가능
  return {
    ...inferredProfile,
    ...(product.careProfile || {}),
  };
}
