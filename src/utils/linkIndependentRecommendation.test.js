import { products } from "../data/products";
import { buildDynamicRoutine, pickAlternativeNonExfoliatingProduct, pickBestProductByCategory } from "./routineRecommendation";
import { buildCosmeticAddOnPlan } from "./cosmeticAddOnPlan";

const originalLinks = products.map(product => product.link);
afterEach(() => products.forEach((product, index) => { product.link = originalLinks[index]; }));
const setLinks = choose => products.forEach(product => { product.link = choose(product); });
const ids = routine => Object.fromEntries(Object.entries(routine.products).map(([category, product]) => [category, product?.id ?? null]));
const contexts = [
  { mainConcern: "none", basicOnly: true },
  { mainConcern: "none", basicOnly: true, isSensitive: true, careNeeds: { hydrationNeed: 8, barrierCareNeed: 7, soothingNeed: 6 } },
  { mainConcern: "oiliness", careNeeds: { lightTextureNeed: 9, congestionCareNeed: 4 } },
];
test.each(contexts)("basic recommendations do not exclude the best match without a purchase link: %j", context => {
  for (let level = 1; level <= 10; level++) {
    for (const category of ["cleanser", "toner", "serum", "cream"]) {
      setLinks(() => "");
      const expected = pickBestProductByCategory(category, level, context);
      expect(expected).not.toBeNull();
      setLinks(product => product.id === expected.id ? "" : `https://example.com/product/${product.id}`);
      expect(pickBestProductByCategory(category, level, context)?.id).toBe(expected.id);
    }
  }
});
test("alternative selection ranks a linkless winner equally, including when another product is excluded", () => {
  for (const category of ["toner", "serum", "cream"]) for (const level of [3, 5, 7]) for (const context of [{}, { isSensitive: true }]) {
    setLinks(() => "");
    const first = pickAlternativeNonExfoliatingProduct(category, level, context);
    for (const excluded of [[], [first.id]]) {
      const expected = pickAlternativeNonExfoliatingProduct(category, level, context, excluded);
      expect(expected).not.toBeNull();
      setLinks(product => product.id === expected.id ? "#" : `https://example.com/product/${product.id}`);
      expect(pickAlternativeNonExfoliatingProduct(category, level, context, excluded)?.id).toBe(expected.id);
      setLinks(() => "");
    }
  }
});
test("the complete routine is invariant when links are removed, added or placeholders", () => {
  for (const context of contexts) for (const level of [2, 5, 8]) {
    setLinks(() => ""); const expected = ids(buildDynamicRoutine(level, context));
    for (const link of [() => "#", p => `https://example.com/product/${p.id}`, p => Object.values(expected).includes(p.id) ? "" : `https://example.com/product/${p.id}`]) {
      setLinks(link); expect(ids(buildDynamicRoutine(level, context))).toEqual(expected);
    }
  }
});
test("optional cosmetic selection also ignores purchase links", () => {
  const input = { goal: "tone", comfort: "comfortable", actives: ["none"], experience: "tolerated", special: "none" };
  const context = { profile: { skinType: "지성", hydrationLevel: 8, scores: { sensitivity: 0 }, careNeeds: {} }, surveyAnswers: { afterWash: "별로 불편하지 않다", afternoonFeel: "얼굴 전체가 번들거린다", areaDifference: "얼굴 전체가 기름진 편이다" } };
  setLinks(() => ""); const expected = buildCosmeticAddOnPlan(input, context);
  expect(expected.product).not.toBeNull();
  setLinks(product => product.id === expected.product.id ? "" : `https://example.com/product/${product.id}`);
  const next = buildCosmeticAddOnPlan(input, context);
  expect(next.product?.id).toBe(expected.product.id); expect(next.status).toBe(expected.status);
});
