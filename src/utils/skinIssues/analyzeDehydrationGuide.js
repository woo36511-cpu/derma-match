export function analyzeDehydrationGuide(answers = {}, skinResult = {}) {
  const afterWash = answers.afterWash?.value || "";
  const daytimeTightness = answers.daytimeTightness?.value || "";
  const oiliness = answers.oiliness?.value || "";
  const moisturizerResponse = answers.moisturizerResponse?.value || "";
  const flaking = answers.flaking?.value || "";
  const irritation = answers.irritation?.value || "";
  const cleansing = answers.cleansing?.value || "";
  const waterTemp = answers.waterTemp?.value || "";

  const reasons = [];

  if (afterWash === "strong" || afterWash === "very_strong") {
    reasons.push("세안 직후 당김이 강함");
  }

  if (daytimeTightness === "often" || daytimeTightness === "continuous") {
    reasons.push("시간이 지나도 속당김이 지속됨");
  }

  if (oiliness === "high" || oiliness === "very_high") {
    reasons.push("속당김과 번들거림이 함께 나타남");
  }

  if (moisturizerResponse === "short") {
    reasons.push("보습 후에도 당김이 빠르게 다시 나타남");
  }

  if (moisturizerResponse === "poor") {
    reasons.push("보습제를 발라도 건조감이 충분히 줄지 않음");
  }

  if (moisturizerResponse === "heavy") {
    reasons.push("보습제를 많이 바르면 답답하게 느껴짐");
  }

  if (flaking === "visible") {
    reasons.push("눈에 보이는 각질이 동반됨");
  }

  if (flaking === "severe") {
    reasons.push("심한 각질이나 갈라짐이 동반됨");
  }

  if (irritation === "frequent") {
    reasons.push("따가움이나 붉어짐이 자주 있음");
  }

  if (irritation === "strong") {
    reasons.push("강한 화끈거림이나 불편감이 있음");
  }

  if (
    cleansing === "strong" ||
    cleansing === "frequent" ||
    cleansing === "harsh"
  ) {
    reasons.push("세안 강도가 높은 편");
  }

  if (waterTemp === "hot") {
    reasons.push("뜨거운 물로 세안하는 편");
  }

  // 🔴 강한 자극/손상 신호
  const irritationPriority =
    irritation === "strong" ||
    (flaking === "severe" && irritation === "frequent");

  if (irritationPriority) {
    return {
      careLevel: "clinic_priority",

      badge: "🔴 피부 자극 확인 우선",

      title:
        "단순한 수분 부족보다 피부 자극이나 손상 신호를 먼저 확인하는 게 좋아요.",

      summary:
        "심한 화끈거림, 반복되는 붉어짐, 갈라짐이나 심한 벗겨짐이 함께 있다면 기능성 제품을 추가하기보다 피부를 자극하는 요소를 줄이고 상태를 먼저 확인하는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟢 세안 과다
  const overCleansing =
    cleansing === "strong" ||
    cleansing === "frequent" ||
    cleansing === "harsh" ||
    waterTemp === "hot";

  if (overCleansing) {
    return {
      careLevel: "basic_care",

      badge: "🟢 세안 조정 우선",

      title: "보습제를 더 추가하기 전에 세안 습관부터 부드럽게 바꿔보세요.",

      summary:
        "강한 세안, 잦은 세안, 뜨거운 물은 세안 후 당김을 더 크게 느끼게 할 수 있어요. 우선 세안 강도를 줄이고 미지근한 물을 사용하면서 피부 반응을 확인해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟢 속은 건조 + 겉은 유분
  const dehydratedOilyPattern =
    (daytimeTightness === "often" || daytimeTightness === "continuous") &&
    (oiliness === "high" || oiliness === "very_high");

  if (dehydratedOilyPattern) {
    return {
      careLevel: "basic_care",

      badge: "🟢 가벼운 수분 보충 우선",

      title: "속은 당기지만 겉은 번들거리는 패턴이에요.",

      summary:
        "유분이 많다고 보습을 완전히 줄이기보다 가벼운 토너나 세럼으로 수분을 채우고, 무거운 크림은 사용량을 조절하는 방향이 잘 맞을 수 있어요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟢 보습 유지력이 부족한 경우
  const needsBarrierSupport =
    moisturizerResponse === "short" ||
    moisturizerResponse === "poor" ||
    flaking === "visible";

  if (needsBarrierSupport) {
    return {
      careLevel: "basic_care",

      badge: "🟢 보습·장벽 보강",

      title:
        "수분을 넣는 것뿐 아니라 수분이 날아가지 않게 잡아주는 단계가 필요해 보여요.",

      summary:
        "토너나 세럼만 여러 번 바르기보다 마지막 단계에서 보습제를 충분히 사용하고, 피부가 편안한 범위에서 장벽 중심 제품을 함께 보는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟢 보습제가 너무 무거운 경우
  if (moisturizerResponse === "heavy") {
    return {
      careLevel: "basic_care",

      badge: "🟢 가벼운 보습 조정",

      title: "보습이 필요하지만 현재 사용하는 제형은 조금 무거울 수 있어요.",

      summary:
        "속당김 때문에 크림을 많이 바르다 답답해진다면 크림 양만 늘리기보다 가벼운 수분 세럼과 적당량의 크림으로 나누어 보습하는 방법을 고려해볼 수 있어요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 기본 수분 관리",

    title: "현재는 기본적인 수분 보충과 보습 유지부터 맞춰보는 게 좋아요.",

    summary:
      "세안 후 너무 오래 피부를 방치하지 말고 수분 제품을 바른 뒤, 피부 타입에 맞는 보습제로 마무리하면서 당김 변화를 확인해보세요.",

    reasons,

    pharmacyGuide: null,
  };
}
