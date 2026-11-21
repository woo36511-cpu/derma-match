import { buildDynamicRoutine } from "./routineRecommendation";
import { buildRoutineSurveyContext, getReviewedRoutineProduct, makeManualRoutineEntry } from "./currentRoutineReview";
import { getRoutineLookupProduct, officialExpansionCount, routineLookupCategories, searchRoutineProducts } from "./routineLookup";

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

test("hair mist, body lotion and discontinued fragrance are searchable by their verified sizes", () => {
  const hair = searchRoutineProducts("샹스 오 땅드르 헤어 미스트 35ml").matches[0];
  const body = searchRoutineProducts("샹스 오 땅드르 핸드 앤 바디 로션 400ml").matches[0];
  expect(routineLookupCategories[hair.category]).toBe("헤어케어");
  expect(hair).toMatchObject({ id: "lookup:chanel:126780", listingOnly: true, formulaVerified: false });
  expect(body).toMatchObject({ id: "lookup:chanel:126720", category: "bodyCare", listingOnly: true, formulaVerified: false });
  expect(getReviewedRoutineProduct(hair)).toBeNull();
  expect(getReviewedRoutineProduct(body)).toBeNull();

  const { matches } = searchRoutineProducts("그랑핸드 수지 살몬 멀티 퍼퓸");
  expect(matches).toHaveLength(2);
  expect(matches).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: "lookup:granhand:714", volume: "100ml" }),
    expect.objectContaining({ id: "lookup:granhand:714:200ml", volume: "200ml", discontinuedInKorea: true, formulaVerified: false }),
  ]));
  expect(getRoutineLookupProduct("lookup:chanel:126310")?.volume).toBe("50ml");
});
