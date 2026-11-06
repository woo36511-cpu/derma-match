import { products } from "../data/products";
import { isProductAvailable, isSpecializedTreatmentProduct } from "./productCatalog";
import { sortProductsForRecommendation } from "./recommendationScoring";

export const hydrationQuestion = {
  id: "afternoonSkin",
  q: "오후가 되면 피부가 보통 어떤가요?",
  options: [
    { label: "건조하고 당기는 느낌이 이어져요", value: "dry" },
    { label: "번들거리는데 속은 당겨요", value: "mixed" },
    { label: "번들거림이 더 신경 쓰여요", value: "oily" },
    { label: "대체로 편안해요", value: "comfortable" },
    { label: "잘 모르겠어요", value: "unknown" },
  ],
};

export function needsHydrationQuestion(assessment) {
  return assessment?.guidedCare && assessment.complete && !assessment.blockRoutine &&
    assessment.answers.barrier === "dry";
}

const concernCare = {
  breakouts: { action: "트러블을 짜거나 건드리지 않고 지켜봐요.", observation: "새로 올라오는 트러블이 줄었는지" },
  oily: { action: "번들거려도 세안을 더 세게 하지 않아요.", observation: "오후에 어느 부위가 얼마나 번들거리는지" },
  wrinkles: { action: "외출할 때 자외선 차단을 챙겨요.", observation: "외출 전에 자외선 차단을 챙길 수 있었는지" },
  sensitive: { action: "자극이 느껴졌던 제품을 하나씩 확인해요.", observation: "어떤 제품을 썼을 때 불편함이 생기는지" },
  dry: { action: "세안 뒤 당김이 생기는지 먼저 확인해요.", observation: "당김이 언제 시작되고 얼마나 지속되는지" },
  none: { action: "지금 편안한 관리를 이어가요.", observation: "당김이나 따가움 없이 편안한지" },
  other: { action: "가장 불편한 부위와 달라진 점을 기록해요.", observation: "같은 부위가 계속 불편한지" },
};

const hydrationLevels = { dry: 3, mixed: 5, oily: 7, comfortable: 5 };
const basicMoisturizers = products.filter(product => product.category === "cream" &&
  isProductAvailable(product) && product.beginnerFriendly && product.sensitivitySafe &&
  !isSpecializedTreatmentProduct(product));

export function buildFirstVisitPlan(assessment) {
  if (!assessment?.guidedCare || !assessment.complete || assessment.blockRoutine) return null;
  const { concern, area, basicRoutine, afternoonSkin } = assessment.answers;
  const care = concern === "breakouts" && area === "chin"
    ? { action: "턱 트러블을 짜거나 건드리지 않고 지켜봐요.", observation: "턱에 새로 올라오는 트러블이 줄었는지" }
    : concernCare[concern] ?? concernCare.other;
  const maintenance = {
    both: "잘 맞던 세안제와 보습제는 유지해요.",
    cleanser: "편안하게 쓰던 세안제는 유지해요.",
    moisturizer: "편안하게 쓰던 보습제는 유지해요.",
    neither: "불편이 없다면 제품을 새로 추가할 필요는 없어요.",
    unknown: "지금 편안하게 쓰는 제품이 있다면 그대로 유지해요.",
  };
  if (!needsHydrationQuestion(assessment)) {
    return { ...care, keep: maintenance[basicRoutine], reason: "답변에서 기본 관리를 바꿔야 할 뚜렷한 불편이 확인되지 않았어요." };
  }

  const hasMoisturizer = ["both", "moisturizer"].includes(basicRoutine);
  const level = hydrationLevels[afternoonSkin] ?? null;
  const userContext = { level, isSensitive: false, goal: "보습" };
  const product = level == null || hasMoisturizer || basicRoutine === "unknown" ? null :
    sortProductsForRecommendation(basicMoisturizers, level, userContext)[0] ?? null;

  return {
    action: hasMoisturizer ? "지금 보습제를 세안 뒤에 발라보고 당김을 확인해요."
      : basicRoutine === "unknown" ? "세안 후 무엇을 바르고 있는지 먼저 확인해요."
      : "세안 후 보습제 한 가지만 먼저 써봐요.",
    keep: basicRoutine === "both" || basicRoutine === "cleanser" ? "편안하게 쓰던 세안제는 유지해요." : null,
    observation: "세안 뒤 당김이 줄고 새로 따갑지 않은지",
    concernTip: ["breakouts", "oily", "wrinkles"].includes(concern) ? care.action : null,
    reason: "세안 뒤 당김이 있다고 답했어요. 기초 제품을 한꺼번에 바꾸지 않고 보습부터 확인해요.",
    level, product, userContext,
  };
}
