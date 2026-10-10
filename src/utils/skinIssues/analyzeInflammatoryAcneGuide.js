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
      title: "기본 루틴과 함께 여드름 일반의약품을 고려해볼 수 있어요.",
      summary:
        "현재 답변에서는 단순 보습 관리만 하기보다 염증성 여드름에 사용되는 일반의약품을 추가로 알아볼 수 있는 상태로 보여요.",
      reasons,

      pharmacyGuide: {
        ingredient: "과산화벤조일 2.5%",
        example: "벤작에이씨겔 2.5%",
        type: "일반의약품",

        purpose: "보통여드름 치료에 사용하는 외용 일반의약품이에요.",

        directions: [
          "환부를 깨끗이 씻은 뒤 사용하는 외용제예요.",
          "치료를 시작할 때는 보통 취침 전 하루 1회부터 사용해 적응 여부를 확인해요.",
          "잘 적응하는 경우 허가사항에서는 아침·저녁 하루 2회까지 늘릴 수 있도록 안내하고 있어요.",
          "민감한 피부는 하루 1회 취침 전 사용이 권장돼요.",
        ],

        routineExample: [
          "순한 세안",
          "피부가 편안한 상태인지 확인",
          "과산화벤조일 제품 사용",
          "필요하면 자극이 적은 보습제로 마무리",
        ],

        cautions: [
          "눈에 들어가지 않도록 주의하고 사용 후 손을 씻어주세요.",
          "외용으로만 사용해야 해요.",
          "처음 사용할 때 건조함이나 자극감이 생길 수 있어요.",
          "자극이 지속되거나 심해지면 사용을 중단하고 상태를 확인하세요.",
          "깊고 심하게 아픈 트러블이나 넓게 반복되는 염증에는 약국 제품만 계속 추가하지 않는 편이 좋아요.",
        ],
      },
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
