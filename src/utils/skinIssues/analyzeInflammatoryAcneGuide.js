export function analyzeInflammatoryAcneGuide(answers = {}) {
  const area = answers.area?.value || "";
  const form = answers.form?.value || "";
  const pain = answers.pain?.value || "";
  const recurring = answers.recurring?.value || "";
  const recentProduct = answers.recentProduct?.value || "";
  const shaving = answers.shaving?.value || "";
  const touching = answers.touching?.value || "";

  const reasons = [];

  if (area === "chin_jaw") {
    reasons.push("턱·턱선 중심으로 트러블이 나타남");
  }

  if (area === "multiple") {
    reasons.push("여러 부위에서 동시에 트러블이 나타남");
  }

  if (form === "pustule") {
    reasons.push("노란 고름이 보이는 염증성 형태");
  }

  if (form === "nodule") {
    reasons.push("속에서 딱딱하고 크게 만져지는 형태");
  }

  if (form === "cluster") {
    reasons.push("여러 개의 염증이 몰려서 나타나는 형태");
  }

  if (pain === "mild") {
    reasons.push("누르면 통증이 있음");
  }

  if (pain === "strong") {
    reasons.push("가만히 있어도 통증이 있음");
  }

  if (recurring === "recurring") {
    reasons.push("같은 부위에 반복적으로 발생함");
  }

  if (recurring === "continuous") {
    reasons.push("새로운 트러블이 거의 계속 발생함");
  }

  if (recentProduct !== "" && recentProduct !== "none") {
    reasons.push("최근 2~4주 사이 화장품 변경이 있었음");
  }

  if (shaving === "daily") {
    reasons.push("트러블 부위를 거의 매일 면도함");
  }

  if (touching === "often") {
    reasons.push("트러블 부위를 자주 만지는 편");
  }

  if (touching === "squeeze") {
    reasons.push("고름이 보이면 직접 짜는 편");
  }

  // 진료를 우선해서 생각할 신호
  const clinicPriority =
    (form === "nodule" && pain === "strong") ||
    (form === "cluster" && pain === "strong") ||
    (recurring === "continuous" && ["nodule", "cluster"].includes(form)) ||
    (recurring === "continuous" && area === "multiple");

  if (clinicPriority) {
    return {
      careLevel: "clinic_priority",
      badge: "🔴 진료 우선",
      title: "자가 관리만 계속하기보다 진료를 우선해서 고려해보세요.",
      summary:
        "깊은 형태, 강한 통증, 넓은 범위 또는 지속적인 염증이 함께 나타나는 경우 화장품이나 약국 제품만 추가하기보다 현재 상태를 정확히 확인하는 편이 좋아요.",
      reasons,
      pharmacyGuide: null,
    };
  }

  // 약국 일반의약품을 고려해볼 수 있는 신호
  const pharmacyConsider =
    form === "pustule" ||
    pain === "mild" ||
    recurring === "recurring" ||
    recurring === "continuous";

  if (pharmacyConsider) {
    return {
      careLevel: "pharmacy_consider",
      badge: "🟡 약국 관리 고려",
      title: "약국에서 여드름과 비슷한 증상을 먼저 확인해보세요.",
      summary:
        "지금은 새 약을 겹쳐 바르지 않아요. 고름이 보이는 돌기가 늘었는지, 통증이나 붉은 범위가 커졌는지 기록하고 더 심해지거나 계속 반복되면 진료로 확인해요.",
      reasons,

      pharmacyGuide: null,
    };
  }

  return {
    careLevel: "basic_care",
    badge: "🟢 기본 관리 우선",
    title: "우선은 기본 루틴을 단순하게 유지하면서 변화를 확인해보세요.",
    summary:
      "현재 답변에서는 강한 통증이나 지속적으로 악화되는 신호가 두드러지지 않아 기본적인 세안·보습과 생활 습관부터 정리해보는 방향이 좋아 보여요.",
    reasons,
    pharmacyGuide: null,
  };
}
