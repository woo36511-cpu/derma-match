import { products } from "../data/products";
import { calculateProductScore } from "./scoring";

export function getRecommendedProducts(userProfile, category, limit = 3) {
  return products
    .filter((product) => product.category === category)
    .map((product) => ({
      ...product,
      score: calculateProductScore(product, userProfile)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}