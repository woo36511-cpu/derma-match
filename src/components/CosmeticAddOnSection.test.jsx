import { fireEvent, render, screen, within } from "@testing-library/react";
import { SimpleCareScreen } from "../screens/SimpleCareScreen";
import { getCosmeticQuestions } from "../data/cosmeticAddOns";
import { buildSimpleCarePlan } from "../utils/simpleCarePlan";

const click = name => fireEvent.click(screen.getByRole("button", { name }));
const surveyAnswers = { afterWash: "별로 불편하지 않다", afternoonFeel: "얼굴 전체가 번들거린다", areaDifference: "얼굴 전체가 기름진 편이다", creamFeel: "적당히 편안하다", innerDryness: "거의 없다", sensitivity: "거의 없다", mainIssue: "특별한 고민은 없다" };
const profile = { skinType: "지성", hydrationLevel: 8, scores: { sensitivity: 0 }, careNeeds: {}, skinState: {} };
const answers = { goal: "tone", comfort: "comfortable", actives: ["none"], experience: "new", special: "none" };
const initialRecord = { id: "survey-existing", journeyId: "journey-existing", additionalCare: { concern: "none" } };
function optional(choices = answers, carePlan = {}) {
  click("추가 화장품 후보 찾아보기");
  for (const [index, q] of getCosmeticQuestions(choices, carePlan).entries()) {
    for (const value of q.multiple ? choices[q.id] : [choices[q.id]]) {
      const label = q.options.find(o => o.value === value).label;
      fireEvent.click(screen.getByRole("button", { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }));
    }
    click(index === getCosmeticQuestions(choices, carePlan).length - 1 ? "추가 추천 확인하고 저장" : "다음");
  }
}
test("an opt-in recommendation saves in the same journey, shows a photo, and contains no Coupang purchase link", () => {
  const onSave = jest.fn(); const { unmount } = render(<SimpleCareScreen profile={profile} surveyAnswers={surveyAnswers} initialRecord={initialRecord} onSave={onSave} />);
  expect(onSave).not.toHaveBeenCalled(); optional();
  expect(screen.getByAltText("마녀공장 갈락 나이아신 3.0 에센스")).toHaveAttribute("src", "/products/manyo-galac-niacin-3.png");
  const section = screen.getByRole("region", { name: "기능성·고민별 화장품 추가" });
  expect(section.querySelector('a[href*="coupang"]')).toBeNull(); expect(within(section).getByText("추천 이유·사용 순서·주의사항").closest("details")).not.toHaveAttribute("open");
  const saved = onSave.mock.calls[0][0]; expect(saved.id).toBe(initialRecord.id); expect(saved.cosmeticAddOn.recommendedProductId).toBe(51);
  expect(saved.productUsagePlan.map(p => p.productId)).not.toContain(51);
  unmount(); render(<SimpleCareScreen profile={profile} surveyAnswers={surveyAnswers} initialRecord={saved} onSave={onSave} />);
  expect(screen.getByAltText("마녀공장 갈락 나이아신 3.0 에센스")).toBeInTheDocument();
  click("추가 선택 지우기"); expect(onSave.mock.calls[1][0]).not.toHaveProperty("cosmeticAddOn"); expect(onSave.mock.calls[1][0].id).toBe(initialRecord.id);
});
test("cosmetic-first care on a saved blackhead result keeps its original scope until edited", () => {
  const careAnswers = { concern: "acne", shape: "blackhead", areaState: "comfortable", medicine: "none" };
  const carePlan = buildSimpleCarePlan(careAnswers, { legacyExtent: true }); const onSave = jest.fn();
  render(<SimpleCareScreen profile={profile} surveyAnswers={surveyAnswers} initialRecord={{ ...initialRecord, additionalCare: careAnswers }} onSave={onSave} />);
  expect(screen.getByRole("region", { name: "일반의약품 후보" })).toBeInTheDocument();
  optional({ ...answers, goal: "texture", route: "cosmetic_first" }, carePlan);
  expect(screen.queryByRole("region", { name: "일반의약품 후보" })).not.toBeInTheDocument();
  expect(onSave.mock.calls[0][0].symptomAssessment.allowMedicationRecommendation).toBe(false);
  expect(onSave.mock.calls[0][0].symptomAssessment.ruleVersion).toBe("type-and-extra-care-v3");
  click("추가 선택 지우기"); expect(screen.getByRole("region", { name: "일반의약품 후보" })).toBeInTheDocument();
});
test("irritated skin receives a hold without a product image or a replacement medication", () => {
  render(<SimpleCareScreen profile={profile} surveyAnswers={surveyAnswers} initialRecord={initialRecord} onSave={() => {}} />);
  optional({ goal: "tone", comfort: "irritated" });
  expect(screen.getByRole("heading", { name: "지금은 새 기능성 제품을 추가하지 않아요." })).toBeInTheDocument();
  expect(within(screen.getByRole("region", { name: "기능성·고민별 화장품 추가" })).queryByRole("img")).not.toBeInTheDocument();
});
test("failed add-on persistence shows an explicit error and retry reuses the same record", () => {
  const onSave = jest.fn().mockImplementationOnce(() => { throw new Error("quota"); });
  render(<SimpleCareScreen profile={profile} surveyAnswers={surveyAnswers} initialRecord={initialRecord} onSave={onSave} />);
  optional(); expect(screen.getByRole("alert")).toHaveTextContent("저장하지 못했어요");
  click("저장 다시 시도"); expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(onSave.mock.calls[0][0].id).toBe(onSave.mock.calls[1][0].id);
  expect(onSave.mock.calls[1][0].cosmeticAddOn.recommendedProductId).toBe(51);
});
