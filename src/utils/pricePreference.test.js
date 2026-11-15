import references from "../data/officialPriceReferences.json";
import { products } from "../data/products";
import { getOfficialPriceReference, preferComparablePrice } from "./pricePreference";
import { buildDynamicRoutine } from "./routineRecommendation";

test("the budget preference changes only the ordering of similar-suitability eligible choices", () => {
  const first = { score: 28 }, affordable = { score: 27.5 }, worse = { score: 20 };
  const pool = [first, affordable, worse];
  const prices = new Map([[first, { amount: 25000 }], [affordable, { amount: 17000 }], [worse, { amount: 5000 }]]);
  expect(preferComparablePrice(pool, p => p.score, "any", p => prices.get(p))).toBe(pool);
  expect(preferComparablePrice(pool, p => p.score, "important", p => prices.get(p))).toEqual([affordable, first, worse]);
  prices.delete(affordable);
  expect(preferComparablePrice(pool, p => p.score, "important", p => prices.get(p))).toBe(pool);
});

test("the real catalog prefers a lower priced comparable cleanser only when requested", () => {
  jest.useFakeTimers().setSystemTime(new Date("2026-11-15T05:00:00Z"));
  try {
    const context = { mainConcern: "none", basicOnly: true, observedSkin: { drynessArea: "none", observedOil: "whole" } };
    const original = buildDynamicRoutine(7, { ...context, pricePreference: "any" });
    const budget = buildDynamicRoutine(7, { ...context, pricePreference: "important" });
    expect(original.products.cleanser.id).toBe(77);
    expect(budget.products.cleanser.id).toBe(59);
    expect(budget.selectionEvidence.cleanser.selectionPath).toBe("comparable_official_price");
  } finally {
    jest.useRealTimers();
  }
});

test("the saved reference must be current, sourced, and match the package volume", () => {
  const product = products.find(p => p.id === 1);
  const now = Date.parse("2026-11-15T11:00:00+09:00");
  expect(getOfficialPriceReference(product, references, now)).toMatchObject({ amount: 15000, volume: "200ml" });
  expect(getOfficialPriceReference({ ...product, volume: "500ml" }, references, now)).toBeNull();
  expect(getOfficialPriceReference(product, references, Date.parse("2027-02-01"))).toBeNull();
  expect(getOfficialPriceReference(product, { 1: { ...references[1], url: "https://example.com/product/22" } }, now)).toBeNull();
  expect(Object.keys(references).filter(id => !getOfficialPriceReference(products.find(p => p.id === Number(id)), references, now))).toEqual([]);
});
