import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";
import { SimpleCareScreen } from "./screens/SimpleCareScreen";
import { skinSurveyQuestions } from "./data/skinSurvey";
import { getSimpleCareQuestions } from "./data/simpleCare";
import { analyzeSkinSurvey } from "./utils/analyzeSkinSurvey";
import { JOURNEY_HISTORY_KEY } from "./data/storageKeys";

const click = name => fireEvent.click(screen.getByRole("button", { name }));
const records = () => JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY) || "[]");
const values = Object.fromEntries(skinSurveyQuestions.map(q => [q.id, q.type === "multi" ? [q.options[0].label] : q.options[0].label]));
beforeEach(() => { localStorage.clear(); window.history.replaceState({}, "", "/"); });
function baseSurvey() {
  click("피부타입 확인하고 추천받기");
  expect(screen.queryByRole("heading", { name: "지금 피부 상태부터 확인할게요" })).not.toBeInTheDocument();
  for (const [index, question] of skinSurveyQuestions.entries()) {
    click(question.options[0].label);
    click(index === skinSurveyQuestions.length - 1 ? "추가 고민 선택" : "다음");
  }
}
function extraCare(answers) {
  const questions = getSimpleCareQuestions(answers);
  for (const [index, q] of questions.entries()) {
    expect(screen.getByRole("heading", { name: q.q })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(q.options.find(option => option.value === answers[q.id]).label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }));
    click(index === questions.length - 1 ? "기본 루틴과 추가 관리 보기" : "다음");
  }
}
test("main flow preserves skin-type survey, saves four basic categories, and reopens its simple result", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "none" });
  expect(screen.getByRole("region", { name: "피부타입별 기본 화장품" })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "일반의약품 후보" })).not.toBeInTheDocument();
  expect(Object.keys(records()[0].routine)).toEqual(["cleanser", "toner", "serum", "cream"]);
  expect(records()[0].source).toBe("simple");
  cleanup(); render(<App />); click("최근 결과 다시 보기");
  expect(screen.getByRole("heading", { name: "피부타입에 맞는 기본 루틴이면 충분해요." })).toBeInTheDocument();
  expect(records()).toHaveLength(1);
});
test("blackheads show licensed visual references and the targeted OTC product beside the basic routine", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "acne", shape: "blackhead", areaState: "comfortable", medicine: "none" });
  const drug = screen.getByRole("region", { name: "일반의약품 후보" });
  expect(within(drug).getByRole("heading", { name: "클리어틴외용액 2%" })).toBeInTheDocument();
  expect(within(drug).getByText(/검은 면포/)).toBeInTheDocument();
  expect(records()[0].mainConcern).toBe("blackhead_sebum");
  click("추가 고민 답변 바꾸기");
  click(/여드름·좁쌀·블랙헤드가 있어요/); click("다음");
  expect(screen.getByText("실제 사진·구조 그림으로 비교하기")).toBeInTheDocument();
  expect(screen.getByAltText("면포성 여드름 실제 사진")).toHaveAttribute("src", "/skin-examples/closed-comedones.jpg");
});
test("a few days of unchanged Patima does not add a second medication", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "acne", shape: "red", areaState: "comfortable", medicine: "patima", duration: "few_days", response: "same" });
  expect(screen.getByRole("heading", { name: /파티마겔을 며칠 쓴 것만으로/ })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "일반의약품 후보" })).not.toBeInTheDocument();
  expect(records()[0].additionalCare.duration).toBe("few_days");
});
test("small localized acne pustules have a named Acnon candidate", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "acne", shape: "pus", areaState: "comfortable", medicine: "none" });
  expect(screen.getByRole("heading", { name: "애크논크림" })).toBeInTheDocument();
  expect(screen.getByAltText("애크논크림 제품 포장")).toBeInTheDocument();
});
test("folliculitis shows common care and folded cause-specific information, without a trial antibiotic", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "folliculitis", areaState: "comfortable", medicine: "none" });
  expect(screen.getByRole("region", { name: "모낭염 공통 관리와 약품 정보" })).toBeInTheDocument();
  expect(screen.getByText("원인별 약품과 구분 단서 보기").closest("details")).not.toHaveAttribute("open");
  expect(screen.getByText(/무피로신 외용제/)).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "일반의약품 후보" })).not.toBeInTheDocument();
});
test("spreading swelling interrupts products and does not ask unnecessary medication questions", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "acne", shape: "red", areaState: "concerning" });
  expect(screen.getByRole("heading", { name: /오늘 확인받으세요/ })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "피부타입별 기본 화장품" })).not.toBeInTheDocument();
});
test("save failure is explicit and retry reuses the same record ID", () => {
  const onSave = jest.fn().mockImplementationOnce(() => { throw new Error("quota"); });
  render(<SimpleCareScreen profile={analyzeSkinSurvey(values, skinSurveyQuestions)} surveyAnswers={values} onSave={onSave} onBack={() => {}} onHome={() => {}} />);
  extraCare({ concern: "none" }); expect(screen.getByRole("alert")).toHaveTextContent("저장하지 못했어요");
  click("저장 다시 시도"); expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(onSave.mock.calls[0][0].id).toBe(onSave.mock.calls[1][0].id);
});
