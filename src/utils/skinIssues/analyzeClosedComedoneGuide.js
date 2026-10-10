export function analyzeClosedComedoneGuide(answers = {}, skinResult = {}) {
  const area = answers.area?.value || "";
  const appearance = answers.appearance?.value || "";
  const inflammation = answers.inflammation?.value || "";
  const duration = answers.duration?.value || "";
  const recentProduct = answers.recentProduct?.value || "";
  const exfoliation = answers.exfoliation?.value || "";
  const touching = answers.touching?.value || "";

  const reasons = [];

  if (area === "forehead") {
    reasons.push("이마 중심으로 좁쌀이 나타남");
  }

  if (area === "cheek") {
    reasons.push("볼 중심으로 오돌토돌함이 나타남");
  }

  if (area === "chin_jaw") {
    reasons.push("턱·턱선 중심으로 좁쌀이 나타남");
  }

  if (area === "multiple") {
    reasons.push("여러 부위에서 동시에 나타남");
  }

  if (appearance === "skin_colored") {
    reasons.push("피부색의 작은 돌기 형태");
  }

  if (appearance === "white_bumps") {
    reasons.push("하얀 작은 돌기 형태");
  }

  if (appearance === "mixed_inflammation") {
    reasons.push("좁쌀과 붉은 트러블이 함께 나타남");
  }

  if (inflammation === "sometimes_red") {
    reasons.push("일부가 가끔 붉게 변함");
  }

  if (inflammation === "painful") {
    reasons.push("붉어짐과 통증이 함께 나타남");
  }

  if (duration === "long") {
    reasons.push("6주 이상 지속되고 있음");
  }

  if (duration === "chronic") {
    reasons.push("몇 달째 반복되고 있음");
  }

  if (["cream", "sunscreen", "oil", "multiple"].includes(recentProduct)) {
    reasons.push("좁쌀이 늘기 전 제품 변경이 있었음");
  }

  if (exfoliation === "frequent") {
    reasons.push("각질 관리 제품을 자주 사용 중");
  }

  if (exfoliation === "multiple") {
    reasons.push("여러 각질 관리 제품을 동시에 사용 중");
  }

  if (touching === "squeeze" || touching === "tool") {
    reasons.push("좁쌀을 직접 압출하는 편");
  }

  const sensitive =
    skinResult.skinType?.includes("민감") ||
    (skinResult.scores?.sensitivity ?? 0) >= 2;

  // 🔴 진료 우선
  const clinicPriority =
    (inflammation === "painful" && ["long", "chronic"].includes(duration)) ||
    (inflammation === "painful" && area === "multiple");

  if (clinicPriority) {
    return {
      careLevel: "clinic_priority",

      badge: "🔴 진료 우선",

      title:
        "단순한 좁쌀 관리보다 염증성 트러블 여부를 먼저 확인하는 게 좋아요.",

      summary:
        "좁쌀처럼 보이는 병변에 붉어짐과 통증이 반복되거나 여러 부위에서 오래 지속된다면 단순한 각질·피지 문제만으로 보기 어려울 수 있어요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 각질 관리 과사용
  const overExfoliating =
    exfoliation === "frequent" || exfoliation === "multiple";

  if (overExfoliating) {
    return {
      careLevel: "basic_care",

      badge: "🟢 루틴 정리 우선",

      title:
        "각질 관리 제품을 더 추가하기보다 현재 사용 빈도를 먼저 줄여보세요.",

      summary:
        "이미 BHA나 각질 관리 제품을 자주 사용하고 있다면 추가적인 살리실산 사용보다 피부 자극과 건조 여부를 먼저 확인하는 편이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 새 제품 추가 직후 발생
  const productChange = ["cream", "sunscreen", "oil", "multiple"].includes(
    recentProduct,
  );

  if (productChange && duration === "recent") {
    return {
      careLevel: "basic_care",

      badge: "🟢 루틴 조정 우선",

      title: "최근 추가한 제품과 발생 시점의 관계부터 확인해보세요.",

      summary:
        "최근 제품을 바꾼 뒤 좁쌀이 늘었다면 새 기능성 제품을 바로 추가하기보다 변경한 제품을 하나씩 확인하는 편이 원인을 좁히기 쉬워요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 민감 + 붉어짐
  if (sensitive && inflammation !== "none") {
    return {
      careLevel: "basic_care",

      badge: "🟢 자극 최소화 우선",

      title: "현재는 각질 제거보다 피부를 편안하게 만드는 게 먼저예요.",

      summary:
        "민감도가 높은 피부에서 붉어짐까지 있다면 살리실산 같은 각질 관리 제품을 바로 추가하기보다 자극을 줄이고 피부 상태를 먼저 안정시키는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟡 살리실산 고려
  const pharmacyConsider =
    inflammation === "none" &&
    (duration === "weeks" || duration === "long" || duration === "chronic");

  if (pharmacyConsider) {
    return {
      careLevel: "pharmacy_consider",

      badge: "🟡 약국 관리 고려",

      title:
        "막힘과 좁쌀이 지속된다면 살리실산 계열 일반의약품을 알아볼 수 있어요.",

      summary:
        "붉거나 아픈 염증보다는 피부색 또는 하얀 좁쌀이 지속되는 형태라면 각질화된 피부를 연화시키는 살리실산 계열 여드름 치료제를 고려할 수 있어요.",

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
          "과도한 피부 건조를 줄이기 위해 처음에는 하루 1회로 시작하도록 안내돼 있어요.",
          "건조하거나 피부가 벗겨지면 이틀에 한 번으로 사용 횟수를 줄일 수 있어요.",
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
          "외용으로만 사용하고 사용 후에는 손을 씻어주세요.",
          "건조, 벗겨짐 또는 자극이 지속되면 사용을 줄이거나 중단하세요.",
          "이미 BHA나 다른 각질 제거 제품을 많이 사용 중이라면 겹쳐서 추가하지 않는 편이 좋아요.",
        ],
      },
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 기본 관리 우선",

    title:
      "우선은 제품 수와 사용량을 단순하게 유지하면서 피부 반응을 확인해보세요.",

    summary:
      "최근 발생한 가벼운 오돌토돌함이라면 바로 각질 제거제를 추가하기보다 현재 루틴을 단순하게 유지하면서 변화를 확인하는 방향이 좋아요.",

    reasons,

    pharmacyGuide: null,
  };
}
