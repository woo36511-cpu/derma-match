export function analyzeSensitivityRednessGuide(answers = {}) {
  const trigger = answers.trigger?.value || "";
  const sensation = answers.sensation?.value || "";
  const duration = answers.duration?.value || "";
  const skinDamage = answers.skinDamage?.value || "";
  const swelling = answers.swelling?.value || "";
  const breathing = answers.breathing?.value || "";
  const recentProduct = answers.recentProduct?.value || "";
  const actives = answers.actives?.value || "";
  const moisturizerSting = answers.moisturizerSting?.value || "";

  const reasons = [];

  if (trigger === "new_product") {
    reasons.push("새 제품 사용 후 증상이 시작됨");
  }

  if (trigger === "after_wash") {
    reasons.push("세안 후 붉어짐이나 따가움이 나타남");
  }

  if (trigger === "active_product") {
    reasons.push("기능성 제품 사용 후 불편감이 나타남");
  }

  if (sensation === "stinging") {
    reasons.push("따끔거리거나 따가운 느낌이 있음");
  }

  if (sensation === "burning") {
    reasons.push("화끈거림이나 열감이 있음");
  }

  if (sensation === "itching") {
    reasons.push("가려움이 함께 나타남");
  }

  if (duration === "half_day" || duration === "days") {
    reasons.push("붉어짐이나 불편감이 오래 지속됨");
  }

  if (skinDamage === "dry") {
    reasons.push("피부가 건조하고 거칠어짐");
  }

  if (skinDamage === "flaking") {
    reasons.push("각질이나 갈라짐이 동반됨");
  }

  if (skinDamage === "blister_oozing") {
    reasons.push("물집·진물·벗겨짐이 동반됨");
  }

  if (swelling === "mild") {
    reasons.push("붓기가 동반됨");
  }

  if (swelling === "eyes_lips") {
    reasons.push("눈 주변 또는 입술 붓기가 동반됨");
  }

  if (breathing === "difficulty") {
    reasons.push("호흡 또는 삼킴 불편감이 있었음");
  }

  if (recentProduct !== "" && recentProduct !== "none") {
    reasons.push("최근 새 화장품을 추가함");
  }

  if (actives === "multiple") {
    reasons.push("여러 기능성 제품을 함께 사용 중");
  }

  if (moisturizerSting === "frequent") {
    reasons.push("순한 보습제도 자주 따가움");
  }

  // 🚨 응급 평가가 필요한 신호
  if (breathing === "difficulty") {
    return {
      careLevel: "clinic_priority",

      badge: "🚨 즉시 진료 필요",

      title: "화장품 사용을 계속하면서 지켜볼 상황은 아니에요.",

      summary:
        "눈이나 입술의 붓기와 함께 숨쉬기 또는 삼키기가 불편했다면 심한 알레르기 반응 가능성을 포함해 즉시 의료 평가가 필요한 신호예요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🔴 피부과 진료 우선
  const clinicPriority =
    skinDamage === "blister_oozing" ||
    (swelling === "eyes_lips" && duration !== "minutes") ||
    (sensation === "burning" && duration === "days");

  if (clinicPriority) {
    return {
      careLevel: "clinic_priority",

      badge: "🔴 진료 우선",

      title: "단순한 민감 피부 관리보다 피부 상태를 먼저 확인하는 편이 좋아요.",

      summary:
        "물집, 진물, 벗겨진 피부, 지속적인 심한 화끈거림 또는 눈·입술 주변 붓기가 있다면 새 기능성 제품을 추가하기보다 현재 상태를 확인하는 게 우선이에요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 새 제품 이후 증상
  const recentProductReaction =
    trigger === "new_product" ||
    recentProduct === "multiple" ||
    (recentProduct !== "none" && duration !== "minutes");

  if (recentProductReaction) {
    return {
      careLevel: "basic_care",

      badge: "🟢 새 제품 점검 우선",

      title: "최근 추가한 제품부터 하나씩 확인하는 게 좋아요.",

      summary:
        "새 제품을 사용한 뒤 붉어짐이나 따가움이 시작됐다면 기능성 제품을 추가하기보다 최근 변경한 제품을 우선 중단하고, 피부가 편안해진 뒤 제품을 하나씩 다시 확인하는 방향이 원인을 좁히기 쉬워요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 기능성 과사용
  const activeOverload =
    actives === "multiple" ||
    (["acid", "retinoid", "acne_active"].includes(actives) &&
      ["stinging", "burning"].includes(sensation));

  if (activeOverload) {
    return {
      careLevel: "basic_care",

      badge: "🟢 기능성 줄이기",

      title: "현재는 기능성 제품을 더 추가하기보다 자극을 줄이는 게 먼저예요.",

      summary:
        "각질 관리, 레티놀, 여드름 기능성 제품을 사용하는 중 따가움이나 화끈거림이 있다면 기능성 사용을 잠시 줄이고 순한 세안과 보습 중심으로 루틴을 단순하게 만들어보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 장벽 자극 가능성
  const barrierIrritation =
    moisturizerSting === "frequent" ||
    skinDamage === "flaking" ||
    (sensation === "stinging" && duration !== "minutes");

  if (barrierIrritation) {
    return {
      careLevel: "basic_care",

      badge: "🟢 진정·장벽 관리 우선",

      title:
        "현재는 기능성보다 피부가 편안해지는 기본 루틴이 더 중요해 보여요.",

      summary:
        "평소 사용하던 보습제까지 따갑거나 각질·갈라짐이 함께 있다면 자극적인 성분을 줄이고 순한 세안, 보습, 자외선 차단 중심으로 단순하게 관리해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 민감 자극 최소화",

    title: "현재는 자극 요소를 줄이면서 피부 반응을 관찰해보세요.",

    summary:
      "일시적인 붉어짐 위주라면 새 제품을 한꺼번에 여러 개 추가하지 말고 순한 세안과 보습 중심으로 유지하면서 어떤 상황에서 붉어지는지 확인해보는 게 좋아요.",

    reasons,

    pharmacyGuide: null,
  };
}
