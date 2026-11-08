import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";
import { SimpleCareScreen } from "./screens/SimpleCareScreen";
import { getAdaptiveObservationQuestions as getObservationQuestions, adaptiveObservationQuestions as observationQuestions, adaptiveSupportQuestions, ADAPTIVE_MEASUREMENT_VERSION as OBSERVATION_MEASUREMENT_VERSION } from "./data/adaptiveObservationSurvey";
import { observationQuestions as previousObservationQuestions, OBSERVATION_SURVEY_VERSION } from "./data/observationSurvey";
import { analyzeObservationSurvey } from "./utils/analyzeObservationSurvey";
import { skinSurveyQuestions } from "./data/skinSurvey";
import { getSimpleCareQuestions } from "./data/simpleCare";
import { analyzeSkinSurvey } from "./utils/analyzeSkinSurvey";
import { feedbackQuestions } from "./data/feedbackQuestions";
import { getVisibleSymptomQuestions } from "./data/symptomQuestions";
import { buildSimpleSkinRecord } from "./utils/simpleSkinRecord";
import { buildSimpleCarePlan } from "./utils/simpleCarePlan";
import { buildDynamicRoutine } from "./utils/routineRecommendation";
import { JOURNEY_HISTORY_KEY } from "./data/storageKeys";

const click = name => fireEvent.click(screen.getByRole("button", { name }));
const records = () => JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY) || "[]");
const values = Object.fromEntries(skinSurveyQuestions.map(q => [q.id, q.type === "multi" ? [q.options[0].label] : q.options[0].label]));
beforeEach(() => { localStorage.clear(); window.history.replaceState({}, "", "/"); });
function baseSurvey(overrides = {}) {
  click("피부타입 확인하고 추천받기");
  expect(screen.queryByRole("heading", { name: "지금 피부 상태부터 확인할게요" })).not.toBeInTheDocument();
  const observed = { skinChange: "steady", observedOil: "tzone", drynessArea: "none", moisturizerUse: "comfortable", reactionPattern: "none", washResponse: "comfortable", surfaceObservation: "normal", ...overrides };
  const answers = Object.fromEntries([...observationQuestions, ...adaptiveSupportQuestions].map(q => [q.id, q.options.find(o => o.value === (observed[q.id] ?? "unknown"))?.label]));
  const questions = getObservationQuestions(answers);
  for (const [index, question] of questions.entries()) {
    expect(screen.getByRole("heading", { name: question.question })).toBeInTheDocument();
    click(answers[question.id]);
    click(index === questions.length - 1 ? "추가 고민 선택" : "다음");
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
  expect(records()[0].result.observationAssessment.evidence).toContain("이마·코에 유분, 볼에는 적음");
  expect(records()[0].skinMeasurement.values.acneActivity).toBeNull();
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

test("unknown observations are saved as unknown and never become a normal-skin routine", () => {
  render(<App />); baseSurvey(Object.fromEntries(observationQuestions.map(q => [q.id, "unknown"]))); extraCare({ concern: "none" });
  expect(screen.getByRole("heading", { level: 1, name: /기본 관리부터 시작/ })).toBeInTheDocument();
  expect(screen.getByText("아직 확인되지 않은 항목은 남겨두고, 아래 기본 관리부터 시작해요.")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "지금 시작할 관리" })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "피부타입별 기본 화장품" })).not.toBeInTheDocument();
  expect(records()[0].routine).toEqual({});
  expect(records()[0].skinMeasurement.measurementVersion).toBe(OBSERVATION_MEASUREMENT_VERSION);
  expect(Object.values(records()[0].skinMeasurement.values).every(v => v === null)).toBe(true);
  cleanup(); render(<App />); click("최근 결과 다시 보기");
  expect(screen.queryByRole("region", { name: "피부타입별 기본 화장품" })).not.toBeInTheDocument();
});
test("current surface irritation overrides a reassuring extra-concern answer", () => {
  render(<App />); baseSurvey({ surfaceObservation: "irritated" }); extraCare({ concern: "acne", shape: "blackhead", areaState: "comfortable", medicine: "none" });
  expect(screen.getByRole("heading", { name: "현재 자극부터 가라앉히는 방향으로 줄여요." })).toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "일반의약품 후보" })).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "피부타입별 기본 화장품" })).not.toBeInTheDocument();
  expect(records()[0].routine).toEqual({});
});

function startFollowUp() {
  click("시작 화면"); click("2주 후 체크하기");
  const symptomValues = { concern: "none", breathing: "no", eyeWarning: "no", eruption: "no", change: "stable", surface: "intact", barrier: "none", habit: "observe", area: "face", form: "mixed", comedones: "yes", uniform: "no", itch: "none", follicular: "no", shaving: "no", pain: "none", duration: "under_week", recentProduct: "none" };
  for (const q of getVisibleSymptomQuestions(symptomValues)) {
    click(q.options.find(o => o.value === symptomValues[q.id]).label);
    click(screen.queryByRole("button", { name: "다음", exact: true }) ? "다음" : "내 피부 관리 보기");
  }
  click("피부 관리 설문·기록 이어가기");
  screen.queryAllByRole("button", { name: "전혀 사용하지 않음", exact: true }).forEach(button => fireEvent.click(button));
  for (const q of feedbackQuestions) {
    const option = q.options.find(o => o.value === 0) || q.options[0];
    const container = screen.getByText(q.q).parentElement;
    fireEvent.click(within(container).getByRole("button", { name: option.label, exact: true }));
  }
  click("피부 상태 다시 확인하기");
}
test("recheck keeps the new observation scale and does not invent missing axes", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "none" }); startFollowUp();
  const observed = { skinChange: "steady", observedOil: "tzone", drynessArea: "none", moisturizerUse: "comfortable", washResponse: "comfortable", reactionPattern: "none", surfaceObservation: "normal" };
  for (const q of getObservationQuestions()) {
    const container = screen.getByText(q.question).parentElement;
    fireEvent.click(within(container).getByRole("button", { name: q.options.find(o => o.value === observed[q.id]).label, exact: true }));
  }
  click("변화 저장하고 다음 추천 보기");
  const followUp = records().find(record => record.type === "feedback" && !record.assessmentOnly);
  expect(followUp.outcome.skinComparison.after.measurementVersion).toBe(OBSERVATION_MEASUREMENT_VERSION);
  expect(followUp.outcome.skinComparison.comparisonStatus).toBe("partial");
  expect(followUp.outcome.skinComparison.delta.acneActivity).toBeNull();
  expect(followUp.surveyVersion).toBe(records()[0].surveyVersion);
});
test("unknown follow-up observations suppress a new routine and do not crash on a missing level", () => {
  render(<App />); baseSurvey(Object.fromEntries(observationQuestions.map(q => [q.id, "unknown"]))); extraCare({ concern: "none" }); startFollowUp();
  const unknownAnswers = Object.fromEntries([...observationQuestions, ...adaptiveSupportQuestions].map(q => [q.id, q.options.find(o => o.value === "unknown").label]));
  for (const q of getObservationQuestions(unknownAnswers)) {
    const container = screen.getByText(q.question).parentElement;
    fireEvent.click(within(container).getByRole("button", { name: unknownAnswers[q.id], exact: true }));
  }
  click("변화 저장하고 다음 추천 보기");
  const followUp = records().find(record => record.type === "feedback" && !record.assessmentOnly);
  expect(followUp.nextState.hydrationLevel).toBeNull(); expect(followUp.routine.cleanser).toBeNull();
  expect(screen.getByText("지금은 새 제품 추천보다 상태 확인이 먼저예요")).toBeInTheDocument();
});

test("conflicting answers get a clarification instead of a forced type, and guidance starts folded", () => {
  render(<App />); click("피부타입 확인하고 추천받기");
  expect(screen.getByText("답변 기준 자세히 보기").closest("details")).not.toHaveAttribute("open");
  click("시작 화면으로");
  baseSurvey({ drynessArea: "cheeks", drynessTiming: "persistent", moisturizerUse: "comfortable", drynessContext: "unknown", contextDryArea: "unknown" }); extraCare({ concern: "none" });
  expect(screen.getByRole("heading", { name: /유분 중심 관리부터 시작/ })).toBeInTheDocument();
  expect(records()[0].result.observationAssessment.status).toBe("partial");
});

test("historical simple results keep the historical scale until a fresh survey is started", () => {
  const p = analyzeSkinSurvey(values, skinSurveyQuestions);
  const record = buildSimpleSkinRecord(values, p, buildDynamicRoutine(p.hydrationLevel), buildSimpleCarePlan({ concern: "none" }));
  delete record.surveyVersion;
  localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify([record]));
  render(<App />); click("최근 결과 다시 보기");
  expect(screen.getByText("예전 설문 기준으로 저장된 결과예요. 당시 답변과 점수를 유지했어요.")).toBeInTheDocument();
  expect(records()[0].skinMeasurement.measurementVersion).toBe("survey-8-axis-v1");
  click("새 기준으로 다시 확인");
  expect(screen.getByRole("heading", { name: observationQuestions[0].question })).toBeInTheDocument();
  expect(records()[0].skinMeasurement).toEqual(record.skinMeasurement);
});

test("unknown oil is resolved with a face diagram and the refined answer is saved", () => {
  render(<App />); baseSurvey({ observedOil: "coating", oilTouch: "whole" }); extraCare({ concern: "none" });
  expect(screen.getByText("도움 질문에서 확인한 답변도 반영했어요.")).toBeInTheDocument();
  expect(records()[0].result.observationAssessment.resolvedObservations.observedOil).toBe("whole");
  expect(records()[0].result.observationAssessment.refinements.some(item => item.questionId === "oilTouch")).toBe(true);
  cleanup(); render(<App />); click("최근 결과 다시 보기");
  expect(screen.getByRole("region", { name: "피부타입별 기본 화장품" })).toBeInTheDocument();
});
test("before/after context explains different answers without treating them as inconsistent", () => {
  render(<App />); baseSurvey({ drynessArea: "cheeks", drynessTiming: "persistent", moisturizerUse: "comfortable", drynessContext: "before_after", contextReturn: "no" }); extraCare({ concern: "none" });
  expect(records()[0].result.observationAssessment.typeComplete).toBe(true);
  expect(records()[0].skinMeasurement.values.dryness).toBe(3);
  expect(screen.getByRole("region", { name: "피부타입별 기본 화장품" })).toBeInTheDocument();
});
test("a saved v2 observation result keeps its original questionnaire and measurement", () => {
  const answers = Object.fromEntries(previousObservationQuestions.map(q => [q.id, q.options[q.options.length - 1].label]));
  const profile = analyzeObservationSurvey(answers);
  const record = buildSimpleSkinRecord(answers, profile, { products: {} }, buildSimpleCarePlan({ concern: "none" }));
  localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify([record])); render(<App />); click("최근 결과 다시 보기");
  expect(screen.getByRole("heading", { name: /피부 성향 판단 보류/ })).toBeInTheDocument();
  expect(records()[0].surveyVersion).toBe(OBSERVATION_SURVEY_VERSION);
  expect(records()[0].skinMeasurement.measurementVersion).toBe("observed-skin-axes-v2");
  click("피부타입 답변 다시 보기");
  expect(screen.getByRole("heading", { name: previousObservationQuestions[previousObservationQuestions.length - 1].question })).toBeInTheDocument();
  expect(screen.queryByText("답변을 돕는 추가 질문")).not.toBeInTheDocument();
});
