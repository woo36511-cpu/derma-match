import { PRODUCT_CARE_AXES, getProductEvidenceStatus } from "./productEvidence";
export function clampProductCareScore(value) {
  return Math.max(0, Math.min(10, Math.round(value)));
}
export function getProductCareProfile(product) {
  const reviewed = getProductEvidenceStatus(product).profileReviewed;
  // Unknown is zero contribution to ranking, not proof that a product is ineffective.
  // Tags and ingredient-name counts never manufacture an efficacy score.
  return Object.fromEntries(PRODUCT_CARE_AXES.map(key => [key, reviewed ? product.careProfile[key] : 0]));
}
