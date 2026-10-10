export function analyzeBlackheadSebumGuide(answers = {}, skinResult = {}) {
  const area = answers.area?.value || "";
  const appearance = answers.appearance?.value || "";
  const returnSpeed = answers.returnSpeed?.value || "";
  const oiliness = answers.oiliness?.value || "";
  const afterWash = answers.afterWash?.value || "";
  const cleansingOil = answers.cleansingOil?.value || "";
  const exfoliation = answers.exfoliation?.value || "";
  const squeezing = answers.squeezing?.value || "";
  const inflammation = answers.inflammation?.value || "";

  const reasons = [];

  if (area === "nose") {
    reasons.push("코 중심으로 피지가 보임");
  }

  if (area === "nose_cheek") {
    reasons.push("코와 나비존 중심으로 피지가 보임");
  }

  if (area === "tzone") {
    reasons.push("T존 중심으로 피지가 많음");
  }

  if (area === "multiple") {
    reasons.push("여러 부위에서 피지가 신경 쓰임");
  }

  if (appearance === "black_plug") {
    reasons.push("검은 점처럼 막힌 형태가 보임");
  }

  if (appearance === "sebaceous_filament") {
    reasons.push("촘촘한 회색·노란 피지 형태가 보임");
  }

  if (appearance === "pore_sebum") {
    reasons.push("모공과 피지가 함께 신경 쓰임");
  }

  if (returnSpeed === "fast" || returnSpeed === "very_fast") {
    reasons.push("제거하거나 세안해도 피지가 빠르게 다시 보임");
  }

  if (oiliness === "high" || oiliness === "very_high") {
    reasons.push("유분이 빠르게 올라오는 편");
  }

  if (afterWash === "mild_tight" || afterWash === "tight") {
    reasons.push("세안 후 당김이 있음");
  }

  if (cleansingOil === "unsure") {
    reasons.push("클렌징오일 유화 방법이 불확실함");
  }

  if (cleansingOil === "long_massage") {
    reasons.push("클렌징오일을 오래 마사지하는 편");
  }

  if (exfoliation === "frequent") {
    reasons.push("각질 관리 빈도가 높은 편");
  }

  if (exfoliation === "multiple") {
    reasons.push("여러 각질 관리 제품을 동시에 사용함");
  }

  if (squeezing === "often" || squeezing === "tool") {
    reasons.push("피지를 자주 직접 압출하는 편");
  }

  if (inflammation === "frequent") {
    reasons.push("붉고 아픈 트러블이 자주 동반됨");
  }

  const sensitive =
    skinResult.skinType?.includes("민감") ||
    (skinResult.scores?.sensitivity ?? 0) >= 2;

  // 🔴 블랙헤드보다 염증 문제가 우선
  if (inflammation === "frequent") {
    return {
      careLevel: "clinic_priority",

      badge: "🔴 염증 관리 우선",

      title:
        "현재는 블랙헤드보다 반복되는 염증성 트러블을 먼저 확인하는 게 좋아요.",

      summary:
        "피지나 모공 문제와 함께 붉고 아픈 트러블이 자주 생긴다면 각질 제거 제품을 계속 추가하기보다 염증 상태를 먼저 관리하는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 과한 각질 관리
  if (exfoliation === "frequent" || exfoliation === "multiple") {
    return {
      careLevel: "basic_care",

      badge: "🟢 각질 관리 줄이기",

      title: "BHA를 더 추가하기보다 현재 각질 관리 빈도를 먼저 줄여보세요.",

      summary:
        "각질 관리 제품을 이미 자주 사용하고 있다면 추가적인 산 성분보다 건조함과 자극 여부를 먼저 확인하는 게 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 세안 후 심한 당김
  if (afterWash === "tight" || (sensitive && afterWash === "mild_tight")) {
    return {
      careLevel: "basic_care",

      badge: "🟢 세안·보습 조정 우선",

      title: "피지를 더 제거하기보다 세안 후 당김부터 줄이는 게 좋아요.",

      summary:
        "피지가 보여도 세안 후 피부가 많이 당긴다면 강한 세정이나 각질 관리를 추가하기 전에 세안 강도와 보습 밸런스를 먼저 조정해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 피지실에 가까운 패턴
  const filamentPattern =
    appearance === "sebaceous_filament" &&
    (returnSpeed === "fast" || returnSpeed === "very_fast");

  if (filamentPattern) {
    return {
      careLevel: "basic_care",

      badge: "🟢 피지 관리 우선",

      title:
        "완전히 제거하려 하기보다 눈에 덜 띄게 관리하는 방향이 좋아 보여요.",

      summary:
        "촘촘한 피지가 제거 후 빠르게 다시 보이는 패턴은 피지실에 가까울 가능성도 있어요. 반복 압출보다는 과도한 피지를 줄이고 피부를 자극하지 않는 관리가 더 적합할 수 있어요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 클렌징오일 사용법 조정
  if (cleansingOil === "unsure" || cleansingOil === "long_massage") {
    return {
      careLevel: "basic_care",

      badge: "🟢 클렌징 방법 점검",

      title: "새 제품을 추가하기 전에 클렌징오일 사용 방법부터 조정해보세요.",

      summary:
        "클렌징오일은 오래 문지르기보다 짧게 사용하고, 물을 묻혀 충분히 유화한 뒤 헹구는 방식으로 사용하는 편이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟡 막힌 블랙헤드가 지속될 때 살리실산 고려
  const salicylicConsider =
    appearance === "black_plug" &&
    inflammation === "none" &&
    exfoliation === "none";

  if (salicylicConsider) {
    return {
      careLevel: "pharmacy_consider",

      badge: "🟡 약국 관리 고려",

      title:
        "막힌 형태의 블랙헤드가 지속된다면 살리실산 계열 여드름 치료제를 알아볼 수 있어요.",

      summary:
        "검은 점처럼 막힌 피지가 반복되고 붉거나 아픈 염증은 없다면 살리실산 계열 외용 일반의약품을 하나의 선택지로 볼 수 있어요.",

      reasons,

      pharmacyGuide: {
        ingredient: "살리실산 2%",
        example: "애크린겔",
        type: "일반의약품",

        purpose:
          "각질화된 피부를 연화시켜 여드름 치료에 사용하는 외용 일반의약품이에요.",

        directions: [
          "환부와 주변을 깨끗하게 한 뒤 외용으로 사용해요.",
          "허가사항상 아침·저녁 하루 2회 사용하도록 되어 있어요.",
          "과도한 건조 가능성 때문에 처음에는 하루 1회로 시작하도록 안내돼 있어요.",
          "피부 건조나 벗겨짐이 나타나면 이틀에 한 번으로 사용 횟수를 줄일 수 있어요.",
        ],

        routineExample: [
          "순한 세안",
          "피부를 편안하게 건조",
          "살리실산 제품",
          "가벼운 보습",
        ],

        cautions: [
          "눈 주위와 점막에는 사용하지 않아요.",
          "붉거나 염증·자극이 있는 부위에는 사용하지 않아요.",
          "다른 BHA나 강한 각질 제거 제품과 겹쳐 쓰는 것은 피하는 편이 좋아요.",
          "건조함이나 자극이 지속되면 사용을 줄이거나 중단하세요.",
          "증상이 계속 악화되면 블랙헤드만의 문제인지 다시 확인하는 게 좋아요.",
        ],
      },
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 기본 피지 관리",

    title: "우선은 과하게 제거하지 않고 피지와 수분 밸런스를 맞춰보세요.",

    summary:
      "현재 답변에서는 강한 각질 관리나 반복적인 압출보다 순한 세안, 적절한 보습, 피지 관리 습관부터 조정하는 방향이 좋아 보여요.",

    reasons,

    pharmacyGuide: null,
  };
}
