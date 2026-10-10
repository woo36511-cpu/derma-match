import { getProductCareProfile } from "./productCareProfile";

export function getProductEvidenceSnapshot(product) {
  const evidence = product?.evidence || {};

  return {
    evidenceLevel: evidence.evidenceLevel ?? "unverified",

    officialProductVerified: evidence.officialProductVerified ?? false,

    fullIngredientsVerified: evidence.fullIngredientsVerified ?? false,

    concentrationDisclosure: evidence.concentrationDisclosure ?? "unknown",

    lastVerifiedAt: evidence.lastVerifiedAt ?? null,
  };
}

export function buildProductUsagePlan(
  productsByCategory = {},
  skinType = "",
  startedAt = null,
) {
  return Object.entries(productsByCategory)
    .filter(([, product]) => !!product)
    .map(([category, product]) => {
      let recommendedAmount = product.usageAmount?.normal ?? null;

      if (skinType.includes("지성") || skinType.includes("수부지")) {
        recommendedAmount = product.usageAmount?.oily ?? recommendedAmount;
      } else if (skinType.includes("건성")) {
        recommendedAmount = product.usageAmount?.dry ?? recommendedAmount;
      }

      return {
        productId: product.id,

        productNameSnapshot: product.name,

        category,
        startedAt,

        recommendationSnapshot: {
          hydrationLevel: product.hydrationLevel ?? null,

          careProfile: getProductCareProfile(product),

          evidence: getProductEvidenceSnapshot(product),

          recommendedAmount,

          recommendedTiming: product.usage?.when ?? null,
        },

        // 실제 사용 데이터는
        // 사용자가 답하기 전까지 추정하지 않음
        actualUsage: {
          amount: null,
          frequency: null,
          stoppedEarly: null,
          stopReason: null,
        },
      };
    });
}
