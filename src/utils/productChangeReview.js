import { getExactCatalogProduct } from "./currentRoutineReview";

export function getCatalogChangeFormula(product) {
  const catalog = getExactCatalogProduct(product);
  if (!product?.formulaVerified || !catalog?.fullIngredients?.length) return null;
  return { ingredients: catalog.fullIngredients, sourceUrl: product.officialUrl };
}

export function getIngredientClue(ingredients, reactions) {
  const has = pattern => ingredients.find(name => pattern.test(name.trim()));
  if (reactions.some(value => ["red", "sting", "dry"].includes(value))) {
    const retinoid = has(/^(레티놀|레티날|retinol|retinal|retinaldehyde)$/i);
    if (retinoid) return { ingredient: retinoid, detail: "레티놀 계열은 사용 후 건조함이나 자극과 함께 살펴볼 수 있어요. 전성분만으로 이 제품이 원인인지, 실제 자극이 얼마나 클지는 알 수 없어요." };
  }
  if (reactions.some(value => value === "red" || value === "sting")) {
    const fragrance = has(/^(향료|fragrance|parfum)$/i);
    if (fragrance) return { ingredient: fragrance, detail: "향료는 새로 생긴 붉어짐이나 따가움과 함께 살펴볼 수 있는 성분이에요. 이 제품이나 향료가 원인이라는 뜻은 아니에요." };
  }
  if (reactions.includes("better") && reactions.every(value => value === "better")) {
    const humectant = has(/^(글리세린|glycerin|판테놀|panthenol|소듐하이알루로네이트|sodium hyaluronate)$/i);
    if (humectant) return { ingredient: humectant, detail: "수분을 유지하는 데 쓰이는 성분이에요. 사용 후 피부가 편해진 것과 관련이 있을 수 있지만, 이 성분만의 효과인지는 알 수 없어요." };
  }
  return null;
}
