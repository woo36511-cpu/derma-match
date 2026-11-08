import { products } from "../data/products";
import { COSMETIC_ADDON_VERSION, cleanCosmeticAnswers, isCosmeticComplete, cosmeticProductProfiles } from "../data/cosmeticAddOns";
import { getProductCareProfile } from "./productCareProfile";
import { getCareNeedMatchScore } from "./recommendationScoring";
import { hasExfoliatingActive, isProductAvailable } from "./productCatalog";

export function buildCosmeticAddOnPlan(input, { profile = {}, surveyAnswers = {}, carePlan = {}, routine = {} } = {}) {
  const answers = cleanCosmeticAnswers(input, carePlan);
  const result = { version: COSMETIC_ADDON_VERSION, answers, complete: isCosmeticComplete(answers, carePlan), product: null, suppressPharmacy: false };
  const hold = (title, detail) => ({ ...result, status: "hold", title, detail });
  if (!result.complete) return hold("추가 질문을 마쳐주세요.", "현재 상태와 사용 중인 성분을 확인한 뒤 후보를 골라요.");
  if (carePlan.blockNewBasics || ["irritated", "concerning"].includes(answers.comfort)) return hold("지금은 새 기능성 제품을 추가하지 않아요.", "편안했던 세안·보습을 유지해요. 빠르게 퍼지는 붉어짐·심한 붓기나 통증은 오늘 확인받으세요.");
  const knownSkinAnswers = ["afterWash", "afternoonFeel", "areaDifference", "creamFeel", "innerDryness", "sensitivity"].filter(key => typeof surveyAnswers[key] === "string" && !surveyAnswers[key].includes("모르겠"));
  if (knownSkinAnswers.length < 3) return hold("피부타입 답변을 조금 더 확인해요.", "정보가 부족한 상태에서 기능성 제품을 확정하지 않아요. 피부타입 답변을 보완한 뒤 다시 확인해요.");
  if (answers.comfort === "unknown") return hold("사용할 부위의 자극 여부부터 확인해요.", "따가움·벗겨짐 여부를 알기 전에는 새 기능성 제품을 추가하지 않아요.");
  const actives = new Set(answers.actives || []);
  if (actives.has("unknown") || carePlan.answers?.medicine === "unknown") return hold("지금 쓰는 제품의 성분부터 확인해요.", "성분을 모르는 제품과의 조합을 안전하다고 안내하지 않아요. 포장 성분표를 확인한 뒤 답을 바꿔요.");
  if (answers.goal !== "support" && (answers.special !== "none" || answers.experience === "reacted")) return hold("이번에는 기능성 제품의 추가를 보류해요.", "별도 확인이 필요한 상황이나 과거 자극 경험이 있어요. 잘 맞는 기본 보습과 자외선 차단을 유지해요.");
  if (answers.goal !== "support" && (surveyAnswers.mainIssue === "붉고 아픈 여드름" || carePlan.answers?.concern === "folliculitis" || carePlan.answers?.concern === "unknown" || ["red", "pus", "deep", "unknown"].includes(carePlan.answers?.shape))) return hold("현재 트러블 관리부터 정리해요.", "원인이 불분명하거나 염증성 돌기가 있는 부위에 새 각질·미백 기능성을 더하지 않아요. 보습 보완은 별도로 살펴볼 수 있어요.");
  if (answers.goal !== "support" && (actives.has("benzoyl") || actives.has("medicine") || (carePlan.answers?.medicine && carePlan.answers.medicine !== "none"))) return hold("사용 중인 약에 새 기능성을 겹치지 않아요.", "처방·여드름약 사용법을 우선해요. 추가 제품 대신 보습 보완이 필요한지 살펴봐요.");
  const isSensitive = (profile.scores?.sensitivity ?? 0) >= 5 || String(profile.skinType).includes("민감");
  const level = profile.hydrationLevel;
  if (!Number.isFinite(level)) return hold("제품의 보습 기준을 확인하지 못했어요.", "피부타입 답변을 확인한 뒤 다시 추천받아요.");
  const sensitiveReaction = surveyAnswers.sensitivity === "자주 따갑고 붉어진다";
  let candidates = products.filter(product => {
    const extra = cosmeticProductProfiles[product.id], evidence = product.evidence;
    if (!extra?.goals.includes(answers.goal) || !isProductAvailable(product) || !evidence?.domesticFormulaVerified || !evidence?.fullIngredientsVerified) return false;
    if (Math.abs(product.hydrationLevel - level) > 3) return false;
    if (level >= 7 && getProductCareProfile(product).lightweightFit < 5) return false;
    if ((isSensitive || sensitiveReaction) && (!product.sensitivitySafe || extra.intensity === "exfoliant" || extra.intensity === "high")) return false;
    if (extra.families.some(family => actives.has(family))) return false;
    if (extra.intensity === "high" && (answers.experience !== "tolerated" || actives.has("retinoid") || actives.has("acid") || actives.has("vitaminC"))) return false;
    if (extra.intensity === "exfoliant") {
      if (answers.comfort !== "comfortable" || actives.has("acid") || actives.has("retinoid") || actives.has("vitaminC") || (profile.careNeeds?.barrierCareNeed ?? 0) >= 6) return false;
      if (carePlan.pharmacy && answers.route !== "cosmetic_first") return false;
    }
    return true;
  });
  candidates.sort((a, b) => {
    const score = p => getCareNeedMatchScore(p, profile.careNeeds) / 10 - Math.abs(p.hydrationLevel - level) * 5 + (p.sensitivitySafe ? 1 : 0);
    return score(b) - score(a) || a.id - b.id;
  });
  const product = candidates[0];
  if (!product) return hold("지금 조건에 맞는 추가 후보가 없어요.", "보습감·현재 성분·자극 조건을 통과한 제품이 없어요. 맞지 않는 제품을 억지로 추가하지 않고 기본 루틴을 유지해요.");
  const extra = cosmeticProductProfiles[product.id];
  const duplicateBasic = Object.values(routine.products ?? {}).some(p => p?.id === product.id);
  return { ...result, status: duplicateBasic ? "covered" : "candidate", product, classification: extra.label,
    source: extra.source ?? product.evidence.sources?.find(s => s.sourceType.includes("official_domestic"))?.url,
    suppressPharmacy: hasExfoliatingActive(product) && answers.route === "cosmetic_first" && carePlan.answers?.medicine === "none",
    title: duplicateBasic ? "기본 추천 제품으로 이 목적도 보완할 수 있어요." : "추가 후보는 한 가지만 먼저 살펴봐요.",
    detail: duplicateBasic ? "아래 제품은 기본 루틴에 이미 포함된 후보예요. 같은 제품을 하나 더 추가할 필요는 없어요." : "선택한 고민과 보습 단계에 맞추고, 답변한 성분군과의 중복을 확인한 후보예요.",
    fit: `추천 보습 기준 ${level}단계와 제품 기준 ${product.hydrationLevel}단계를 비교했어요. ${level <= 4 ? "보습을 유지하면서 필요한 부위에 사용해요." : level >= 7 ? "무거운 제형보다 가벼운 사용감을 우선했어요." : "수분·유분의 균형을 고려했어요."}`,
    placement: product.category === "toner" ? "기존 토너를 쓰는 날과 구분해 토너 단계에서 한 가지로 사용해요." : product.category === "cream" ? "기존 크림과 역할을 비교해 해당 부위의 크림 단계에서 조절해요." : "기존 세럼·에센스와 역할을 비교해 한 가지로 교체하거나 필요한 부위에만 사용해요.",
  };
}
export function snapshotCosmeticAddOn(plan) {
  return { version: COSMETIC_ADDON_VERSION, answers: plan.answers, status: plan.status, recommendedProductId: plan.product?.id ?? null, suppressPharmacy: plan.suppressPharmacy, title: plan.title };
}
