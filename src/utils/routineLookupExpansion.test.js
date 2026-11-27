import { buildDynamicRoutine } from "./routineRecommendation";
import { buildRoutineSurveyContext, getReviewedRoutineProduct, makeManualRoutineEntry } from "./currentRoutineReview";
import { getRoutineLookupProduct, officialExpansionCount, searchRoutineProducts } from "./routineLookup";

test("official listings can be found and recorded but do not imply formula verification or enter recommendations", () => {
  expect(officialExpansionCount).toBeGreaterThan(400);
  const result = searchRoutineProducts("넘버즈인 1번 판토텐산 액티브업 수딩세럼 50ml").matches[0];
  expect(result).toMatchObject({ id: "lookup:numbuzin:28", brand: "넘버즈인", volume: "50ml", listingOnly: true, formulaVerified: false });
  expect(getRoutineLookupProduct(result.id)).toBe(result);
  expect(getReviewedRoutineProduct(result)).toBeNull();
  expect(buildRoutineSurveyContext("yes", [{ id: result.id, reaction: "comfortable" }]).serum.band).toBe("unknown");
  for (const level of [2, 5, 8]) expect(Object.values(buildDynamicRoutine(level).products).every(p => p === null || typeof p.id === "number")).toBe(true);
});

test("shared product names need a volume before reusing a reviewed formula", () => {
  const name = "스킨1004 마다가스카르 센텔라 앰플";
  expect(getReviewedRoutineProduct(makeManualRoutineEntry(name, "serum"))).toBeNull();
  expect(getReviewedRoutineProduct(makeManualRoutineEntry(`${name} 55ml`, "serum"))).toBeNull();
  expect(getReviewedRoutineProduct(makeManualRoutineEntry(`${name} 100ml`, "serum"))?.catalog.id).toBe(25);
});

test("skincare search omits fragrance and makeup but retains masks", () => {
  expect(searchRoutineProducts("샹스 오 땅드르").matches).toHaveLength(0);
  expect(getRoutineLookupProduct("lookup:beyond:1058")).toBeNull();
  expect(getRoutineLookupProduct("lookup:thesaem:1768801816")).toBeNull();
  expect(getRoutineLookupProduct("lookup:thesaem:0000000685")?.category).toBe("mask");
});

test("routine lookup accepts mixed-language brand names, compact queries, and isolated typos", () => {
  const expected = expect.objectContaining({ name: expect.stringContaining("굿모닝 젤 클렌저") });
  expect(searchRoutineProducts("굿모닝젤클렌저COSRX").matches).toContainEqual(expected);
  expect(searchRoutineProducts("COSRX굿모닝젤클렌저").matches).toContainEqual(expected);
  expect(searchRoutineProducts("COSRX 굿모닝 젤 클렌져").matches).toContainEqual(expected);
  expect(searchRoutineProducts("COSRX 굿모닝 젤 클렌저", 12, false, ["sunscreen"]).matches).toHaveLength(0);
});
