import { buildSimpleCarePlan } from "./simpleCarePlan";
const base = { concern: "acne", shape: "red", areaState: "comfortable", medicine: "none" };
test("cosmetic support and medicine evidence remain distinct in acne results", () => {
  const p = buildSimpleCarePlan(base);
  expect(p.careReview.cosmeticRole).toContain("세안·보습");
  expect(p.careReview.cosmeticRole).toContain("치료 효과 순위");
  expect(p.careReview.evidence).toContain("대신 사용하지");
  expect(p.careReview.sources.some(s => s.url.includes("dpharm.co.kr"))).toBe(true);
});
test("product-specific stop criteria override a generic multiweek acne review", () => {
  const salicylic = buildSimpleCarePlan({ ...base, shape: "blackhead" });
  expect(salicylic.careReview.effectCheck).toContain("수회 사용해도 개선이 없으면");
  expect(salicylic.careReview.sources[0].url).toContain("201306847");
  const acnon = buildSimpleCarePlan({ ...base, medicine: "acnon", duration: "few_weeks", response: "same" });
  expect(acnon.careReview.effectCheck).toContain("중단");
  const benzoyl = buildSimpleCarePlan({ ...base, medicine: "patima", duration: "few_days", response: "same" });
  expect(benzoyl.pharmacy).toBeNull(); expect(benzoyl.careReview.effectCheck).toContain("며칠만으로 실패");
  expect(benzoyl.careReview.evidence).toContain("강한 권고 성분");
});
test("worsening and prescription use never get an arbitrary waiting or switching instruction", () => {
  const worse = buildSimpleCarePlan({ ...base, medicine: "patima", duration: "few_days", response: "worse" });
  expect(worse.careReview.effectCheck).toContain("시험하지 않아요"); expect(worse.pharmacy).toBeNull();
  const prescribed = buildSimpleCarePlan({ ...base, medicine: "prescribed", duration: "long", response: "same" });
  expect(prescribed.careReview.effectCheck).toContain("처방받은"); expect(prescribed.pharmacy).toBeNull();
});
