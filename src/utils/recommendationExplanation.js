export function buildUserTags(context) {
  const tags = [];

  if (context.skinType) {
    tags.push(context.skinType);
  }

  if (context.isSensitive) {
    tags.push("민감피부");
  }

  if (context.troubleScore >= 1) {
    tags.push("트러블↑");
  }

  if (context.season === "spring") tags.push("봄");
  if (context.season === "summer") tags.push("여름");
  if (context.season === "autumn") tags.push("가을");
  if (context.season === "winter") tags.push("겨울");

  if (context.goal) {
    tags.push(context.goal);
  }

  return tags;
}

export function buildRecommendationReasons(product, userContext = {}) {
  const reasons = [];

  const currentLevel = userContext.level ?? 5;
  const mainConcern = userContext.mainConcern;

  const productConcerns = product.concerns || [];

  const hasConcern = (...tags) =>
    tags.some((tag) => productConcerns.includes(tag));

  const texture = String(product.texture || "").toLowerCase();

  const isLightTexture = ["light", "gel", "watery", "fresh"].includes(texture);

  // ===== 1순위: 현재 피부 고민과 직접 연결된 이유 =====

  if (mainConcern === "inflammatory_acne") {
    if (hasConcern("acne")) {
      reasons.push("현재 고민인 염증성 트러블 관리 방향과 잘 맞는 제품");
    }

    if (hasConcern("soothing")) {
      reasons.push("붉고 예민해진 피부를 진정시키는 방향으로 보기 좋음");
    }
  }

  if (mainConcern === "closed_comedones") {
    if (hasConcern("closed_comedones", "pores")) {
      reasons.push("현재 고민인 좁쌀·모공 막힘 관리 방향과 잘 맞는 제품");
    }

    if (isLightTexture) {
      reasons.push("무겁고 답답한 제형을 줄이고 싶을 때 보기 좋은 편");
    }
  }

  if (mainConcern === "blackhead_sebum") {
    if (hasConcern("blackhead", "pores")) {
      reasons.push("현재 고민인 블랙헤드와 모공 관리 방향에 잘 맞는 제품");
    }

    if (hasConcern("sebum")) {
      reasons.push("피지와 번들거림 관리가 필요한 피부에 잘 맞는 편");
    }
  }

  if (mainConcern === "dehydration") {
    if (hasConcern("hydration")) {
      reasons.push("현재 고민인 속당김을 줄이기 위한 수분 보충에 잘 맞는 제품");
    }

    if (hasConcern("barrier")) {
      reasons.push("수분이 쉽게 날아가는 피부의 장벽 보완에 보기 좋은 제품");
    }
  }

  if (mainConcern === "sensitivity_redness") {
    if (hasConcern("soothing", "redness") || product.sensitivitySafe) {
      reasons.push("현재 고민인 붉어짐과 예민함을 고려한 진정 제품");
    }

    if (hasConcern("barrier")) {
      reasons.push("자극받은 피부의 장벽 관리 방향과 잘 맞는 편");
    }
  }

  if (mainConcern === "oiliness") {
    if (hasConcern("sebum")) {
      reasons.push("현재 고민인 번들거림과 유분 관리에 잘 맞는 제품");
    }

    if (isLightTexture) {
      reasons.push("무겁고 답답한 사용감을 피하고 싶은 피부에 적합한 편");
    }
  }

  // ===== 2순위: 수분감 단계 =====

  const hydrationDiff = Math.abs((product.hydrationLevel ?? 5) - currentLevel);

  if (hydrationDiff === 0) {
    reasons.push("현재 수분감 단계와 잘 맞음");
  } else if (hydrationDiff === 1) {
    reasons.push("현재 수분감 단계와 크게 벗어나지 않는 제품");
  }

  // ===== 3순위: 추가 적합성 =====

  if (userContext.isSensitive && product.sensitivitySafe) {
    reasons.push("민감 경향을 고려했을 때 비교적 부담이 적은 편");
  }

  if (product.beginnerFriendly) {
    reasons.push("초보자도 시작하기 부담이 적은 제품");
  }

  if (hasConcern("hydration")) {
    reasons.push("기본 수분 보충용으로 활용하기 좋음");
  }

  if (hasConcern("soothing")) {
    reasons.push("진정 관리가 필요할 때 같이 보기 좋음");
  }

  if (hasConcern("barrier")) {
    reasons.push("장벽 보완이 필요한 피부에 보기 좋은 편");
  }

  return [...new Set(reasons)].slice(0, 3);
}

export function getRecommendedAmount(product, userContext) {
  if (!product?.usageAmount || !userContext) return null;

  const skinType = userContext.skinType || "";

  if (skinType.includes("지성") || skinType.includes("수부지")) {
    return product.usageAmount.oily;
  }

  if (skinType.includes("건성")) {
    return product.usageAmount.dry;
  }

  return product.usageAmount.normal;
}
