import { getProductEvidenceStatus } from "./productEvidence";
import { getProductCareProfile } from "./productCareProfile";
import { getRoutineFitSignals } from "./routineFitContext";
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
  const reasons = [], p = getProductCareProfile(product), needs = userContext.careNeeds ?? {};
  const level = userContext.level;
  const fit = getRoutineFitSignals(userContext.slot ?? product.category, userContext);
  if (fit?.note) reasons.push(fit.note);
  const reasonsByNeed = [
    [needs.hydrationNeed ?? 0, p.hydrationSupport, "답변한 당김을 고려해 보습을 보완하는 방향의 후보예요."],
    [needs.lightTextureNeed ?? 0, p.lightweightFit, "답변한 유분·사용감을 고려해 가벼운 제형을 우선했어요."],
    [needs.soothingNeed ?? 0, p.soothingSupport, "반복 자극 경험을 고려한 기본 관리 후보예요. 개인별 무자극을 보장하지는 않아요."],
    [needs.barrierCareNeed ?? 0, p.barrierSupport, "답변한 건조·불편함을 고려해 보습 유지에 초점을 맞춘 후보예요."],
  ].sort((a, b) => b[0] * b[1] - a[0] * a[1]);
  if (!fit?.note && reasonsByNeed[0][0] * reasonsByNeed[0][1] > 0) reasons.push(reasonsByNeed[0][2]);
  if (Number.isFinite(level)) {
    const difference = Math.abs((product.hydrationLevel ?? 5) - level);
    reasons.push(difference <= 1 ? "설문에서 정한 보습감 기준과 제품의 내부 제형 평가가 가까워요." : "조건을 통과한 후보 중에서 비교했어요. 보습감 기준과 차이가 있어 처음에는 필요한 부위의 사용감을 확인해요.");
  }
  const evidence = getProductEvidenceStatus(product);
  reasons.push(evidence.formulaVerified ? "국내 제품·전성분 확인 자료를 바탕으로 비교했어요. 효과를 입증한 순위는 아니에요." : "국내 전성분 확인이 부족한 예전 후보예요. 새 추천에는 포함하지 않아요.");
  if (["inflammatory_acne", "closed_comedones", "blackhead_sebum"].includes(userContext.mainConcern) || userContext.acneSupport) reasons.push("이 화장품의 역할은 세안·보습 보조예요. 여드름 치료 효과로 순위를 매기지 않아요.");
  return reasons;
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
