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
import { getCosmeticQuestions } from "./data/cosmeticAddOns";
import { getCosmeticObservationConfig } from "./data/productObservationGoals";
import { COMFORT_QUESTION, OBSERVATION_KINDS } from "./utils/moisturizerObservation";
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
function extraCare(input) {
  const answers = { breakoutExtent: "local", ...input };
  const questions = getSimpleCareQuestions(answers);
  for (const [index, q] of questions.entries()) {
    expect(screen.getByRole("heading", { name: q.q })).toBeInTheDocument();
    const picked = q.multiple ? answers.shapes ?? [answers.shape] : [answers[q.id]];
    for (const value of picked) fireEvent.click(screen.getByRole("button", { name: new RegExp(q.options.find(option => option.value === value).label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }));
    if (q.locations) for (const [shape, area] of Object.entries(answers.locations ?? {})) {
      fireEvent.change(screen.getByLabelText(q.options.find(option => option.value === shape).label + " 부위"), { target: { value: area } });
    }
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
test("procedure options stay out of the result until requested and follow the chosen scar shape", () => {
  render(<App />); baseSurvey();
  extraCare({ concern: "acne", shape: "indented_scar", areaState: "comfortable", medicine: "none" });
  const control = screen.getByRole("button", { name: "피부과 시술 선택지 보기" });
  expect(control).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByText("부작용과 주의점")).not.toBeInTheDocument();
  fireEvent.click(control);
  const choice = screen.getByRole("combobox", { name: "패임이 어떤 모습에 가까워요?" });
  expect(screen.queryByRole("heading", { name: "TCA CROSS" })).not.toBeInTheDocument();
  fireEvent.change(choice, { target: { value: "narrow" } });
  expect(screen.getByRole("heading", { name: "TCA CROSS" })).toBeVisible();
  expect(screen.getByText("부작용과 주의점")).toBeVisible();
  expect(screen.queryByRole("heading", { name: "서브시전" })).not.toBeInTheDocument();
  fireEvent.change(choice, { target: { value: "unknown" } });
  expect(screen.queryByRole("heading", { name: "TCA CROSS" })).not.toBeInTheDocument();
  fireEvent.click(control);
  expect(screen.queryByRole("combobox", { name: "패임이 어떤 모습에 가까워요?" })).not.toBeInTheDocument();
  expect(records()).toHaveLength(1);
});

test("active inflamed breakouts with old marks don't offer an elective procedure", () => {
  render(<App />); baseSurvey();
  extraCare({ concern: "acne", shapes: ["red", "indented_scar"], primaryShape: "indented_scar",
    locations: { red: "chin", indented_scar: "cheeks" }, areaState: "comfortable", medicine: "none" });
  expect(screen.queryByRole("button", { name: "피부과 시술 선택지 보기" })).not.toBeInTheDocument();
  expect(screen.queryByText("TCA CROSS")).not.toBeInTheDocument();
});

test("blackheads show licensed visual references and the targeted OTC product beside the basic routine", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "acne", shape: "blackhead", areaState: "comfortable", medicine: "none" });
  const drug = screen.getByRole("region", { name: "일반의약품 후보" });
  expect(within(drug).getByRole("heading", { name: "클리어틴외용액 2%" })).toBeInTheDocument();
  expect(within(drug).getByText(/검은 면포/)).toBeInTheDocument();
  expect(records()[0].mainConcern).toBe("blackhead_sebum");
  click("추가 고민 답변 바꾸기");
  click(/여드름·좁쌀·블랙헤드 또는 자국·흉터가 있어요/); click("다음");
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
test("different acne appearances and traces retain priority and locations through save and reopen", () => {
  render(<App />); baseSurvey();
  const chosen = { concern: "acne", shapes: ["closed", "red", "dark_mark", "indented_scar"], primaryShape: "red",
    locations: { closed: "forehead", red: "chin", dark_mark: "cheeks", indented_scar: "cheeks" }, areaState: "comfortable", medicine: "none" };
  extraCare(chosen);
  expect(screen.getByText(/먼저 고른 고민: 고름 없는 작은 붉은 뾰루지 · 턱·턱선/)).toBeInTheDocument();
  const secondary = screen.getByRole("region", { name: "함께 선택한 고민" });
  expect(within(secondary).getByText("살색·하얀 좁쌀 · 이마")).toBeInTheDocument();
  expect(within(secondary).getByText("평평한 갈색·회갈색 자국 · 볼")).toBeInTheDocument();
  expect(within(secondary).getByText("패인 흉터처럼 보여요 · 볼")).toBeInTheDocument();
  expect(screen.getAllByRole("region", { name: "일반의약품 후보" })).toHaveLength(1);
  expect(records()[0].additionalCare).toMatchObject({ ...chosen, shape: "red" });
  cleanup(); render(<App />); click("최근 결과 다시 보기");
  expect(screen.getByRole("region", { name: "함께 선택한 고민" })).toHaveTextContent("살색·하얀 좁쌀 · 이마");
  click("추가 고민 답변 바꾸기"); click("다음"); click("다음");
  click(/평평한 갈색·회갈색 자국/); click("다음");
  expect(screen.getByRole("button", { name: /심한 통증·따가움은 없어요/ })).toHaveAttribute("aria-pressed", "false");
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

function startFollowUp(onFeedback = () => {}) {
  click("시작 화면");
  click(screen.queryByRole("button", { name: "루틴·제품 자세히 체크하기" }) ? "루틴·제품 자세히 체크하기" : "2주 후 체크하기");
  const symptomValues = { concern: "none", breathing: "no", eyeWarning: "no", eruption: "no", change: "stable", surface: "intact", barrier: "none", habit: "observe", area: "face", form: "mixed", comedones: "yes", uniform: "no", itch: "none", follicular: "no", shaving: "no", pain: "none", duration: "under_week", recentProduct: "none" };
  for (const q of getVisibleSymptomQuestions(symptomValues)) {
    click(q.options.find(o => o.value === symptomValues[q.id]).label);
    click(screen.queryByRole("button", { name: "다음", exact: true }) ? "다음" : "내 피부 관리 보기");
  }
  click("피부 관리 설문·기록 이어가기");
  onFeedback();
  screen.queryAllByRole("button", { name: "전혀 사용하지 않음", exact: true }).forEach(button => fireEvent.click(button));
  for (const q of feedbackQuestions) {
    const option = q.options.find(o => o.value === 0) || q.options[0];
    const container = screen.getByText(q.q).parentElement;
    fireEvent.click(within(container).getByRole("button", { name: option.label, exact: true }));
  }
  click("피부 상태 다시 확인하기");
}
function completeStandardRecheck() {
  const observed = { skinChange: "steady", observedOil: "tzone", drynessArea: "none", moisturizerUse: "comfortable", washResponse: "comfortable", reactionPattern: "none", surfaceObservation: "normal" };
  for (const q of getObservationQuestions()) {
    const container = screen.getByText(q.question).parentElement;
    fireEvent.click(within(container).getByRole("button", { name: q.options.find(o => o.value === observed[q.id]).label, exact: true }));
  }
  click("변화 저장하고 다음 추천 보기");
}
test("recheck keeps the new observation scale and does not invent missing axes", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "none" }); startFollowUp();
  completeStandardRecheck();
  const followUp = records().find(record => record.type === "feedback" && !record.assessmentOnly);
  expect(followUp.outcome.skinComparison.after.measurementVersion).toBe(OBSERVATION_MEASUREMENT_VERSION);
  expect(followUp.outcome.skinComparison.comparisonStatus).toBe("partial");
  expect(followUp.outcome.skinComparison.delta.acneActivity).toBeNull();
  expect(followUp.surveyVersion).toBe(records()[0].surveyVersion);
});
test("follow-up prioritizes the first concern and compares saved observations by appearance and area", () => {
  render(<App />); baseSurvey();
  extraCare({ concern: "acne", shapes: ["red", "dark_mark", "indented_scar"], primaryShape: "red",
    locations: { red: "chin", dark_mark: "cheeks", indented_scar: "cheeks" },
    areaState: "comfortable", medicine: "none" });

  startFollowUp(() => {
    const tracker = within(screen.getByRole("region", { name: "고민별 변화 기록" }));
    const red = within(tracker.getByRole("group", { name: /먼저 확인.*붉은 뾰루지.*턱·턱선/ }));
    fireEvent.click(red.getByRole("button", { name: "3~5개" }));
    fireEvent.click(tracker.getByText("다른 고민도 확인하기 (2개)"));
    const mark = within(tracker.getByRole("group", { name: "평평한 갈색·회갈색 자국 · 볼" }));
    fireEvent.click(mark.getByRole("button", { name: "옅어졌어요" }));
  });
  completeStandardRecheck();
  expect(screen.queryByRole("region", { name: "고민별 변화 기록" })).not.toBeInTheDocument();
  const first = records().find(record => record.concernTracking);
  expect(first.concernTracking.sourceRecordId).toBe(records()[0].id);
  expect(first.concernTracking.entries).toMatchObject([
    { shape: "red", area: "chin", value: "three_five" },
    { shape: "dark_mark", area: "cheeks", value: "less" },
  ]);
  expect(Object.keys(first.feedbackAnswers)).not.toContain("concernTracking:red:chin");

  click("처음부터 다시"); click("최근 결과 다시 보기");
  startFollowUp(() => {
    const tracker = within(screen.getByRole("region", { name: "고민별 변화 기록" }));
    const red = within(tracker.getByRole("group", { name: /붉은 뾰루지.*턱·턱선/ }));
    expect(red.getByText(/이전 기록.*3~5개/)).toBeInTheDocument();
    fireEvent.click(red.getByRole("button", { name: "1~2개" }));
  });
  completeStandardRecheck();
  expect(screen.queryByRole("region", { name: "고민별 변화 기록" })).not.toBeInTheDocument();
  click("처음부터 다시"); click("내 피부 변화 보기");
  expect(screen.getByText("관리 시작 때와 비교 · 옅어졌어요")).toBeInTheDocument();
  expect(screen.getByText("최근 7일 새 돌기 · 1~2개")).toBeInTheDocument();
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

test("saved product IDs remain historical when recommendation rules change, and a fresh review is explicit", () => {
  const oldAnswers = Object.fromEntries(previousObservationQuestions.map(q => [q.id, q.id === "observedOil" ? q.options.find(o => o.value === "tzone").label : q.id === "drynessArea" ? q.options.find(o => o.value === "none").label : q.options[0].label]));
  const oldProfile = analyzeObservationSurvey(oldAnswers);
  const record = buildSimpleSkinRecord(oldAnswers, oldProfile, { products: {} }, buildSimpleCarePlan({ concern: "none" }));
  record.routine = { cleanser: 27, toner: 44, serum: 29, cream: 18 };
  delete record.recommendationAssessment;
  localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify([record]));
  render(<App />); click("최근 결과 다시 보기");
  expect(screen.getByText(/저장 당시의 제품 후보/)).toBeInTheDocument();
  expect(screen.getByText("닥터지 약산성 클렌징 젤 폼")).toBeInTheDocument();
  expect(records()[0].routine).toEqual(record.routine);
  click("새 기준으로 다시 확인");
  expect(screen.getByRole("heading", { name: observationQuestions[0].question })).toBeInTheDocument();
});

test("current routine review reuses a completed survey and suggests only a different basic moisturizer", () => {
  render(<App />); baseSurvey(); extraCare({ concern: "none" });
  click("지금 쓰는 제품 점검하기");
  const search = screen.getByRole("searchbox", { name: "브랜드나 제품명" });
  fireEvent.change(search, { target: { value: "피지오겔 DMT" } });
  const product = "피지오겔 DMT 데일리 모이스쳐 테라피 페이셜 크림";
  click(product + " 내 루틴에 담기");
  const review = within(screen.getByRole("region", { name: "내 루틴 점검" }));
  expect(review.getByText(/지난 피부 설문.*복합성 성향/)).toBeVisible();
  expect(review.getByRole("button", { name: /같은 제품이라면 지난 설문 답변 적용/ })).toBeVisible();
  fireEvent.change(review.getByRole("combobox", { name: product + " 사용 반응" }), { target: { value: "heavy" } });
  fireEvent.click(review.getByText("대체 후보 보기"));
  expect(review.getByText(/지난 설문과 이번 사용 반응에 맞춰 고른 같은 단계 후보예요/)).toBeVisible();
  expect(review.getAllByText(product, { exact: true })).toHaveLength(1);

  fireEvent.change(search, { target: { value: "굿모닝 젤 클렌저" } });
  const cleanser = "코스알엑스 약산성 굿모닝 젤 클렌저";
  click(cleanser + " 내 루틴에 담기");
  fireEvent.change(review.getByRole("combobox", { name: cleanser + " 사용 반응" }), { target: { value: "irritation" } });
  expect(review.getByText("자극 먼저 확인")).toBeVisible();
  expect(review.getByText(/새 제품 후보는 잠시 보류할게요/)).toBeVisible();
  expect(review.queryByText(/지난 설문과 이번 사용 반응에 맞춰 고른/)).not.toBeInTheDocument();
});

test("saved concerns can be recorded immediately and the next check restores only that concern's previous count", () => {
  render(<App />); baseSurvey();
  extraCare({ concern: "acne", shapes: ["red", "dark_mark"], primaryShape: "red",
    locations: { red: "chin", dark_mark: "cheeks" }, areaState: "comfortable", medicine: "none" });
  click("시작 화면"); click("2주 후 체크하기");
  expect(screen.getByRole("heading", { name: "지난 고민만 빠르게 체크" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "변화만 저장" })).toBeDisabled();
  click("3~5개"); click("변화만 저장");
  expect(screen.getByRole("heading", { name: "고민 변화를 저장했어요" })).toBeInTheDocument();
  const saved = records().find(record => record.source === "concern_check");
  expect(saved.concernTracking.entries).toMatchObject([{ shape: "red", area: "chin", value: "three_five" }]);
  expect(saved).not.toHaveProperty("routine");
  expect(saved).not.toHaveProperty("outcome");
  expect(records().filter(record => record.source === "symptom_check")).toHaveLength(0);

  click("내 피부 변화 보기");
  const history = within(screen.getByRole("region", { name: "고민 변화 빠른 기록" }));
  expect(history.getByText("최근 7일 새 돌기 · 3~5개")).toBeVisible();
  click("시작 화면으로 돌아가기"); click("고민 변화 바로 기록");
  expect(screen.getByText(/이전 기록.*3~5개/)).toBeVisible();
});
test("the symptom result can return to the concern draft without allowing a new routine", () => {
  render(<App />); baseSurvey();
  extraCare({ concern: "acne", shape: "red", areaState: "comfortable", medicine: "none" });
  click("시작 화면"); click("고민 변화 바로 기록"); click("1~2개"); click("증상 자세히 확인하기");
  const symptoms = { concern: "breakouts", change: "stable", surface: "intact", barrier: "none",
    duration: "two_six_weeks", area: "face", form: "papules", comedones: "no", itch: "none",
    shaving: "no", pain: "none", recentProduct: "none", habit: "observe" };
  for (const question of getVisibleSymptomQuestions(symptoms)) {
    click(question.options.find(option => option.value === symptoms[question.id]).label);
    click(screen.queryByRole("button", { name: "다음", exact: true }) ? "다음" : "내 피부 관리 보기");
  }
  expect(screen.getByRole("heading", { name: "트러블이 가라앉는지 먼저 살펴봐요" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "피부 관리 설문·기록 이어가기" })).not.toBeInTheDocument();
  click("고민 변화 기록으로 돌아가기");
  expect(screen.getByRole("button", { name: "1~2개" })).toHaveAttribute("aria-pressed", "true");
  click("변화만 저장");
  expect(screen.getByText("최근 7일 새 돌기 · 1~2개")).toBeVisible();
});

test("multiple areas without severe pain do not enter the local medicine path", () => {
  render(<App />); baseSurvey();
  extraCare({ concern: "acne", shape: "red", areaState: "comfortable", breakoutExtent: "multiple", medicine: "none" });
  expect(screen.getByRole("heading", { name: "돌기가 많은 곳에는 국소용 후보를 넓게 바르지 않아요." })).toBeVisible();
  expect(screen.queryByRole("region", { name: "일반의약품 후보" })).not.toBeInTheDocument();
  expect(records()[0].additionalCare).toMatchObject({ areaState: "comfortable", breakoutExtent: "multiple" });
});
test("a previous broad count can be compared subjectively without inventing a count", () => {
  render(<App />); baseSurvey();
  extraCare({ concern: "acne", shape: "red", areaState: "comfortable", breakoutExtent: "crowded", medicine: "none" });
  click("시작 화면"); click("고민 변화 바로 기록"); click("세기 어려울 만큼 많아요");
  expect(screen.queryByText(/지난 기록과 비교해 새로 난 돌기가/)).not.toBeInTheDocument();
  click("변화만 저장"); click("시작 화면으로"); click("고민 변화 바로 기록"); click("세기 어려울 만큼 많아요");
  click("지난번보다 줄었어요");
  click("변화만 저장");
  expect(screen.getByText("최근 7일 새 돌기 · 세기 어려울 만큼 많아요")).toBeVisible();
  expect(screen.getByText("느낀 변화 · 지난번보다 줄었어요")).toBeVisible();
  expect(records().filter(record => record.source === "concern_check").at(-1).concernTracking.entries[0])
    .toMatchObject({ value: "too_many", trend: "less", previous: { value: "too_many" } });
});
test("recent environmental exposure is shown in the first result alongside observed skin traits", () => {
  render(<App />);
  baseSurvey({ skinChange: "changed", recentEnvironment: "dry_air", drynessArea: "cheeks", drynessTiming: "day" });
  extraCare({ concern: "none" });
  expect(screen.getByRole("heading", { name: "최근 달라진 환경" })).toBeVisible();
  expect(screen.getByText(/볼·입 주변의 당김이 노출이 적은 날에도/)).toBeVisible();
  expect(records()[0].result.observationAssessment.environmentContext).toMatchObject({ value: "dry_air" });
  expect(records()[0].result.skinType).toBe("복합성 성향");
});

test("guests can track three product types separately and compare symptom-free days and comfort", () => {
  jest.useFakeTimers();
  try {
    jest.setSystemTime(new Date("2026-11-12T00:00:00Z"));
    render(<App />); baseSurvey({ drynessArea: "cheeks", drynessTiming: "day", washResponse: "tight" });
    extraCare({ concern: "none" });
    const choose = (name, value) => fireEvent.change(screen.getByRole("combobox", { name }), { target: { value } });
    const changeLink = "다음 화장품 고르기";
    const begin = kind => {
      fireEvent.click(screen.getByText("지금 쓰는 제품 기록하기 (선택)"));
      click(new RegExp(`^${OBSERVATION_KINDS[kind].label} ·`));
    };
    expect(screen.queryByRole("button", { name: "보습제 사용 기록 시작" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: changeLink })).not.toBeInTheDocument();
    click("시작 화면"); click(changeLink);
    begin("cream");
    const prompt = OBSERVATION_KINDS.cream.question;
    expect(screen.queryByRole("checkbox", { name: /내부 분석에 동의/ })).not.toBeInTheDocument();
    choose(prompt, "unknown");
    expect(screen.getByRole("button", { name: "시작 기록 저장" })).toBeDisabled();
    choose(prompt, "5"); choose(COMFORT_QUESTION, "3"); choose("오늘 이 제품을 어떻게 쓰기로 했나요?", "keep");
    click("시작 기록 저장");
    fireEvent.click(screen.getByText("내 기록 자세히 보기"));
    expect(screen.getByText(/기존 제품 유지 · 시작 전 볼 당김 5일/)).toBeVisible();

    for (const kind of ["serum", "cleanser"]) {
      click("제품 기록 목록으로");
      begin(kind);
      expect(screen.queryByRole("combobox", { name: prompt })).not.toBeInTheDocument();
      choose(OBSERVATION_KINDS[kind].question, "3"); choose("오늘 이 제품을 어떻게 쓰기로 했나요?", "keep");
      click("시작 기록 저장");
    }

    click("시작 화면으로");
    jest.setSystemTime(new Date("2026-11-26T01:00:00Z"));
    click(changeLink);
    click(/보습제 · 변화 기록 열기/);
    const answerFollowUp = (question, answer) => {
      choose(question, answer);
      choose("이 기간에 실제로 어떤 제품을 썼나요?", "existing");
      choose("얼마나 자주 썼나요?", "daily"); choose("불편함이 있거나 사용을 중단했나요?", "none");
      choose("다른 화장품·약·세안 습관이나 생활 환경도 달라졌나요?", "no");
    };
    answerFollowUp(prompt, "0"); choose(COMFORT_QUESTION, "1");
    click("변화 기록 저장");
    expect(screen.getByText("사용 기록을 저장했어요.")).toBeVisible();
    fireEvent.click(screen.getByText("내 기록 자세히 보기"));
    expect(screen.getByText("재체크: 최근 7일 동안 볼 당김 0일")).toBeVisible();
    expect(screen.getByText("피부 불편함: 많이 → 조금")).toBeVisible();

    click("제품 기록 목록으로"); click(/세안제 · 변화 기록 열기/);
    answerFollowUp(OBSERVATION_KINDS.cleanser.question, "unknown");
    click("변화 기록 저장");
    fireEvent.click(screen.getByText("내 기록 자세히 보기"));
    expect(screen.getByText(/당긴 날을 기억하지 못해 전후 비교는 건너뛰었어요/)).toBeVisible();
    const data = records().filter(row => row.source === "skin_product_observation");
    expect(data).toHaveLength(3);
    expect(data.every(row => row.productObservation.analysisConsent === null)).toBe(true);
    const read = kind => data.find(row => row.productObservation.protocol === OBSERVATION_KINDS[kind].protocol).productObservation;
    expect(read("cream").followUp).toMatchObject({ elapsedDays: 14, used: "existing", days: 0, comfort: 1 });
    expect(read("cleanser").followUp.days).toBeNull();
    expect(read("serum").followUp).toBeUndefined();
  } finally { jest.useRealTimers(); }
});


test("blackhead cosmetic observations are optional and stay outside the recommendation result", () => {
  jest.useFakeTimers();
  try {
    jest.setSystemTime(new Date("2026-11-12T00:00:00Z"));
    render(<App />); baseSurvey(); extraCare({ concern: "acne", shape: "blackhead", areaState: "comfortable", medicine: "none" });
    const input = { goal: "texture", route: "cosmetic_first", comfort: "comfortable", actives: ["none"], experience: "new", special: "none" };
    const questions = getCosmeticQuestions(input, { pharmacy: true, answers: { shape: "blackhead" } });
    click("추가 화장품 후보 찾아보기");
    for (const [index, question] of questions.entries()) {
      const option = question.options.find(o => o.value === (question.multiple ? input[question.id][0] : input[question.id]));
      click(new RegExp(option.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      click(index === questions.length - 1 ? "추가 추천 확인하고 저장" : "다음");
    }
    const productId = records()[0].cosmeticAddOn.recommendedProductId;
    expect(productId).not.toBeNull();
    expect(screen.queryByText("지금 쓰는 제품 기록하기 (선택)")).not.toBeInTheDocument();
    click("시작 화면"); click("다음 화장품 고르기");
    expect(screen.getByRole("button", { name: "새 화장품 추천받기" })).toBeEnabled();
    fireEvent.click(screen.getByText("지금 쓰는 제품 기록하기 (선택)")); click(/^블랙헤드 ·/);
    const choose = (name, value) => fireEvent.change(screen.getByRole("combobox", { name }), { target: { value } });
    const prompt = getCosmeticObservationConfig("blackhead").question;
    choose("어느 부위를 기준으로 기록할까요?", "nose");
    choose(prompt, "3"); choose("오늘 이 제품을 어떻게 쓰기로 했나요?", "start");
    click("시작 기록 저장"); click("시작 화면으로");
    jest.setSystemTime(new Date("2026-12-10T01:00:00Z"));
    click("다음 화장품 고르기"); click(/^블랙헤드 · 변화 기록 열기/);
    expect(screen.getByText("기록한 부위 · 코")).toBeVisible();
    choose(prompt, "1"); choose("이 기간에 실제로 어떤 제품을 썼나요?", "recommended");
    choose("얼마나 자주 썼나요?", "daily"); choose("실제로 사용한 날은 총 얼마나 되나요?", "28_plus");
    choose("불편함이 있거나 사용을 중단했나요?", "none"); choose("다른 화장품·약·세안 습관이나 생활 환경도 달라졌나요?", "no");
    click("변화 기록 저장");
    expect(screen.getByText("사용 기록을 저장했어요.")).toBeVisible();
    expect(screen.getByText(/재체크: 6개 이상 → 1~2개/)).not.toBeVisible();
    expect(records().find(row => row.productObservation).productObservation).toMatchObject({
      productId, area: "nose", baselineValue: 3, analysisConsent: null, followUp: { value: 1, useDays: "28_plus" },
    });
    click("새 화장품 추천받기");
    expect(screen.getByRole("heading", { name: observationQuestions[0].question })).toBeVisible();
  } finally { jest.useRealTimers(); }
});

test("a saved use reaction changes the next routine without a data explanation on the result", () => {
  render(<App />); baseSurvey({ drynessArea: "cheeks", drynessTiming: "day" });
  extraCare({ concern: "none" });
  const original = records()[0].routine.serum;
  expect(original).not.toBeNull();
  click("시작 화면"); click("다음 화장품 고르기");
  fireEvent.click(screen.getByText("지금 쓰는 제품 기록하기 (선택)")); click(/^수분 세럼 ·/);
  const choose = (name, value) => fireEvent.change(screen.getByRole("combobox", { name }), { target: { value } });
  const prompt = OBSERVATION_KINDS.serum.question;
  choose(prompt, "5"); choose("오늘 이 제품을 어떻게 쓰기로 했나요?", "start");
  click("시작 기록 저장");
  choose(prompt, "unknown"); choose("이 기간에 실제로 어떤 제품을 썼나요?", "recommended");
  choose("얼마나 자주 썼나요?", "sometimes");
  choose("불편함이 있거나 사용을 중단했나요?", "stopped_irritation");
  choose("다른 화장품·약·세안 습관이나 생활 환경도 달라졌나요?", "no");
  click("중간 기록 저장");
  expect(records().find(record => record.productObservation)?.productObservation.analysisConsent).toBeNull();
  click("시작 화면으로");
  baseSurvey({ drynessArea: "cheeks", drynessTiming: "day" });
  extraCare({ concern: "none" });
  const next = records().filter(record => record.type === "initial_survey").at(-1).routine.serum;
  expect(next).not.toBeNull();
  expect(next).not.toBe(original);
  expect(screen.queryByText("내 기록 자세히 보기")).not.toBeInTheDocument();
  expect(screen.queryByText("지금 쓰는 제품 기록하기 (선택)")).not.toBeInTheDocument();
});

test("first survey keeps the two comfortable serums entered before the result", () => {
  render(<App />); baseSurvey({ observedOil: "whole" });
  fireEvent.click(screen.getByText("쓰는 화장품 검색·직접 입력 (선택)"));
  const search = screen.getByRole("searchbox", { name: "브랜드나 제품명" });
  fireEvent.change(search, { target: { value: "코스알엑스 나이아신아마이드 15 세럼" } });
  click("코스알엑스 나이아신아마이드 15 세럼 내 루틴에 담기");
  fireEvent.change(screen.getByRole("combobox", { name: "코스알엑스 나이아신아마이드 15 세럼 사용 반응" }), { target: { value: "comfortable" } });
  fireEvent.change(search, { target: { value: "테스트 재생 세럼" } });
  fireEvent.click(screen.getByText("목록에 없는 제품 직접 추가"));
  fireEvent.change(screen.getByRole("combobox", { name: "제품 종류" }), { target: { value: "serum" } });
  click("입력한 제품 담기");
  fireEvent.change(screen.getByRole("combobox", { name: "테스트 재생 세럼 사용 반응" }), { target: { value: "comfortable" } });
  extraCare({ concern: "none" });
  const keep = within(screen.getByRole("region", { name: "지금 쓰는 세럼" }));
  expect(keep.getByText(/코스알엑스 나이아신아마이드 15 세럼 · 테스트 재생 세럼/)).toBeVisible();
  expect(records()[0].routine.serum).toBeNull();
  expect(records()[0].productUsagePlan.some(product => product.category === "serum")).toBe(false);
});

test("a first-time visitor can keep an unnamed serum without using product search", () => {
  render(<App />); baseSurvey();
  fireEvent.change(screen.getByRole("combobox", { name: /지금 쓰는 세럼은 어때요/ }), { target: { value: "keep" } });
  extraCare({ concern: "none" });
  expect(screen.getByText("편하게 쓰는 세럼은 그대로 유지해요.")).toBeVisible();
  expect(records()[0].routine.serum).toBeNull();
  expect(records()[0].routinePreferences.serum).toBe("keep");
});
