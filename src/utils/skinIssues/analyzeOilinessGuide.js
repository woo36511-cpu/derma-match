export function analyzeOilinessGuide(answers = {}, skinResult = {}) {
  const area = answers.area?.value || "";
  const timing = answers.timing?.value || "";
  const afterWash = answers.afterWash?.value || "";
  const moisturizer = answers.moisturizer?.value || "";
  const cleansing = answers.cleansing?.value || "";
  const clogged = answers.clogged?.value || "";
  const inflammation = answers.inflammation?.value || "";

  const reasons = [];

  if (area === "tzone") {
    reasons.push("T존 중심으로 번들거림이 나타남");
  }

  if (area === "whole_face") {
    reasons.push("얼굴 전체적으로 유분이 많이 올라옴");
  }

  if (timing === "fast" || timing === "very_fast") {
    reasons.push("세안 후 비교적 빠르게 유분이 올라옴");
  }

  if (afterWash === "tight_oily" || afterWash === "very_tight") {
    reasons.push("세안 직후에는 당기는데 이후 번들거림이 나타남");
  }

  if (moisturizer === "heavy" || moisturizer === "very_heavy") {
    reasons.push("현재 보습제가 무겁거나 답답하게 느껴짐");
  }

  if (
    cleansing === "strong" ||
    cleansing === "frequent" ||
    cleansing === "harsh"
  ) {
    reasons.push("유분 때문에 세안을 강하게 하는 편");
  }

  if (clogged === "frequent") {
    reasons.push("번들거림과 함께 좁쌀·막힘이 자주 생김");
  }

  if (clogged === "blackhead") {
    reasons.push("블랙헤드와 피지도 함께 신경 쓰임");
  }

  if (inflammation === "frequent") {
    reasons.push("붉은 트러블도 자주 동반됨");
  }

  const baselineSensitive =
    skinResult.skinType?.includes("민감") ||
    (skinResult.scores?.sensitivity ?? 0) >= 2;

  // 염증성 트러블이 더 중요한 경우
  if (inflammation === "frequent") {
    return {
      careLevel: "basic_care",

      badge: "🟢 트러블 상태 확인 우선",

      title:
        "현재는 단순한 유분 조절보다 반복되는 붉은 트러블을 함께 확인하는 게 좋아요.",

      summary:
        "번들거림과 함께 붉은 트러블이 자주 생긴다면 무조건 피지를 제거하는 방향보다 염증성 여드름 상태를 별도로 확인하고 루틴을 조정하는 편이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 과도한 세안
  const overCleansing =
    cleansing === "strong" || cleansing === "frequent" || cleansing === "harsh";

  if (overCleansing) {
    return {
      careLevel: "basic_care",

      badge: "🟢 세안 강도 조정",

      title:
        "유분을 줄이려고 너무 강하게 세안하고 있지는 않은지 먼저 확인해보세요.",

      summary:
        "뽀득한 세안이나 지나치게 잦은 세안은 피부를 불편하게 만들 수 있어요. 순한 세안제로 짧게 씻고 이후 번들거림이 어떻게 변하는지 보는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 속건조 + 유분
  const dehydratedOiliness =
    (afterWash === "tight_oily" || afterWash === "very_tight") &&
    (timing === "fast" || timing === "very_fast");

  if (dehydratedOiliness) {
    return {
      careLevel: "basic_care",

      badge: "🟢 수분 밸런스 우선",

      title: "유분은 많지만 속당김도 함께 있는 패턴이에요.",

      summary:
        "유분 때문에 보습을 완전히 줄이기보다 가벼운 수분 제품을 사용하고, 무거운 크림의 양을 줄이는 식으로 유수분 밸런스를 맞춰보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 보습제가 너무 무거움
  if (moisturizer === "heavy" || moisturizer === "very_heavy") {
    return {
      careLevel: "basic_care",

      badge: "🟢 제형 가볍게 조정",

      title: "현재 사용하는 보습 제품이 피부에 조금 무거울 수 있어요.",

      summary:
        "크림을 아예 빼기보다 사용량을 줄이거나 더 가벼운 젤크림·로션 제형으로 바꾸면서 번들거림 변화를 확인해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 모공 막힘/블랙헤드 쪽이 더 뚜렷함
  if (clogged === "frequent" || clogged === "blackhead") {
    return {
      careLevel: "basic_care",

      badge: "🟢 피지·막힘 관리",

      title:
        "단순 번들거림보다 피지와 모공 막힘을 함께 관리하는 방향이 좋아 보여요.",

      summary:
        "강한 세안이나 반복 압출보다는 가벼운 보습을 유지하면서 블랙헤드·피지 관리 방향을 함께 확인해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 민감 피부
  if (baselineSensitive) {
    return {
      careLevel: "basic_care",

      badge: "🟢 산뜻한 진정 관리",

      title: "유분을 줄이더라도 피부 자극을 최소화하는 방향이 중요해요.",

      summary:
        "민감 경향이 있다면 강한 피지 제거 제품보다 순한 세안과 가벼운 수분·진정 제품으로 번들거림을 조절해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 기본 유분 밸런스 관리",

    title: "현재는 제품 제형과 사용량을 가볍게 조정하는 것부터 시작해보세요.",

    summary:
      "유분이 많다고 보습을 완전히 없애기보다 산뜻한 수분 제품을 유지하고, 무거운 제품과 과도한 세안을 줄이면서 피부 반응을 확인해보세요.",

    reasons,

    pharmacyGuide: null,
  };
}
