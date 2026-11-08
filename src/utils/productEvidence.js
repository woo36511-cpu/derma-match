export const PRODUCT_CARE_AXES = ["hydrationSupport", "lightweightFit", "soothingSupport", "congestionSupport", "barrierSupport"];
export const RECOMMENDATION_RULE_VERSION = "verified-product-fit-v2";

// Verification describes product identity/formula data. It is not clinical efficacy.
export function getProductEvidenceStatus(product) {
  const evidence = product?.evidence ?? {};
  const sources = (evidence.sources ?? []).filter(source => String(source.sourceType).startsWith("official_") && /^https?:\/\//.test(source.url ?? ""));
  const formulaVerified = evidence.officialProductVerified === true && evidence.domesticFormulaVerified === true && evidence.fullIngredientsVerified === true && Array.isArray(product?.fullIngredients) && product.fullIngredients.length > 0 && sources.length > 0;
  const profileReviewed = product?.catalogAudit?.careProfileSource === "internal_conservative_assessment" && PRODUCT_CARE_AXES.every(key => typeof product?.careProfile?.[key] === "number" && Number.isFinite(product.careProfile[key]) && product.careProfile[key] >= 0 && product.careProfile[key] <= 10);
  const issues = [];
  if (!formulaVerified) issues.push("국내 제품·전성분 확인 부족");
  if (!profileReviewed) issues.push("제품별 적합도 평가 근거 부족");
  if (product?.isAvailable === false) issues.push("현재 추천 대상에서 제외된 제품");
  return { formulaVerified, profileReviewed, eligible: formulaVerified && profileReviewed && product?.isAvailable !== false,
    sources, lastVerifiedAt: evidence.lastVerifiedAt ?? null, issues,
    assessmentBasis: "internal_conservative_assessment", clinicalEfficacyValidated: false };
}
