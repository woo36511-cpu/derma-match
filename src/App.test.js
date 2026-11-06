import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import App from "./App";
import { skinSurveyQuestions } from "./data/skinSurvey";
import { feedbackQuestions } from "./data/feedbackQuestions";
import * as issueQuestions from "./data/skinIssueQuestions";
import { getVisibleSymptomQuestions } from "./data/symptomQuestions";
import { SAVED_SURVEY_KEY, JOURNEY_HISTORY_KEY } from "./data/storageKeys";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
function openExistingEntry(name) {
  fireEvent.click(screen.getByText("피부타입별 추천·전체 설문 보기", { selector: "summary" }));
  click(name);
}
const history = () => JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY) || "[]").filter(record => !record.assessmentOnly);

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

function completeSymptomCheck(overrides = {}, { continueFlow = true } = {}) {
  const values = { concern: "none", breathing: "no", eyeWarning: "no", eruption: "no", change: "stable", surface: "intact", barrier: "none", habit: "observe", area: "face", form: "mixed", comedones: "yes", uniform: "no", itch: "none", follicular: "no", shaving: "no", pain: "none", duration: "under_week", recentProduct: "none", ...overrides };
  for (const question of getVisibleSymptomQuestions(values)) {
    expect(screen.getByRole("heading", { name: question.q })).toBeInTheDocument();
    click(question.options.find(option => option.value === values[question.id]).label);
    const next = screen.queryByRole("button", { name: "다음", exact: true });
    if (next) fireEvent.click(next);
    else {
      const finish = screen.queryByRole("button", { name: "내 피부 관리 보기", exact: true });
      if (finish) fireEvent.click(finish);
    }
  }
  if (continueFlow) click("피부 관리 설문·기록 이어가기");
}

function completeSurvey() {
  if (screen.queryByRole("heading", { name: "지금 피부 상태부터 확인할게요" })) completeSymptomCheck();
  for (const question of skinSurveyQuestions) {
    expect(
      screen.getByRole("heading", { name: question.question }),
    ).toBeInTheDocument();
    click(question.options[question.options.length - 1].label);
    click(
      question === skinSurveyQuestions[skinSurveyQuestions.length - 1]
        ? "피부 고민 선택"
        : "다음",
    );
  }
}

function completeFeedback({ usageDetails = false } = {}) {
  screen
    .getAllByRole("button", { name: "꾸준히 사용함", exact: true })
    .forEach((button) => fireEvent.click(button));
  if (usageDetails) {
    for (const [label, value] of [
      ["실제 사용한 날 수", "14"], ["사용 빈도", "daily"],
      ["권장량과 비교한 사용량", "recommended"], ["사용 중 쉬거나 중단했나요?", "false"],
      ["사용할 때 따가움·붉어짐이 있었나요?", "false"], ["안내한 사용법대로 사용했나요?", "true"],
    ]) {
      screen.getAllByLabelText(label).forEach((input) => fireEvent.change(input, { target: { value } }));
    }
  }
  for (const question of feedbackQuestions) {
    const option = usageDetails && question.id === "usageDuration" ? question.options[2] : question.options[0];
    screen
      .getAllByRole("button", { name: option.label, exact: true })
      .forEach((button) => fireEvent.click(button));
  }
  click("피부 상태 다시 확인하기");
  for (const question of skinSurveyQuestions) {
    const label = question.options[question.options.length - 1].label;
    screen
      .getAllByRole("button", { name: label, exact: true })
      .forEach((button) => fireEvent.click(button));
  }
  click("변화 저장하고 다음 추천 보기");
}

test("quick recommendation survives reload and saves two feedback rounds in the same journey", () => {
  const { unmount } = render(<App />);
  openExistingEntry(/피부타입 알고 있어요/);
  completeSymptomCheck();
  click(/지성 \/ 번들거림/);
  expect(screen.getByText("8단계")).toBeInTheDocument();
  const reasonSummary = screen.getByText("이 루틴을 추천한 이유", { selector: "summary" });
  const reason = screen.getByText(/유분과 피지 관리가 필요한 상태라/);
  expect(reason).not.toBeVisible();
  expect(screen.getByRole("heading", { name: "추천 루틴" })).toBeVisible();
  fireEvent.click(reasonSummary);
  expect(reason).toBeVisible();
  fireEvent.click(reasonSummary);
  expect(reason).not.toBeVisible();
  click("이 루틴으로 시작하기");
  expect(history()).toHaveLength(1);
  const initial = history()[0];
  expect(initial.source).toBe("quick");
  expect(initial.result.hydrationLevel).toBe(8);
  expect(initial.productUsagePlan).toHaveLength(4);
  expect(initial.journeySchemaVersion).toBe(3);
  expect(initial.skinMeasurement.values.dryness).toBeNull();
  expect(
    screen.getByRole("button", { name: "피부 상태 다시 확인하기" }),
  ).toBeDisabled();
  unmount();
  render(<App />);
  click("첫 체크하기");
  completeSymptomCheck();
  completeFeedback({ usageDetails: true });
  expect(history()).toHaveLength(2);
  expect(history()[1].journeyId).toBe(initial.journeyId);
  expect(history()[1].outcome.followUpSkinState).toBeTruthy();
  expect(history()[1].evaluatedRoutine).toEqual(initial.routine);
  expect(history()[1].outcome.skinComparison.comparableAxisCount).toBe(0);
  expect(history()[1].dataReliability.level).toBe("low");
  expect(history()[1].actualProductUsage[0].actualUsage).toMatchObject({ durationDays: 14, frequency: "daily", usedAsDirected: true });
  expect(history()[1].followUpSurveyAnswers).toBeTruthy();
  expect(screen.getByText(/비교할 이전 8축 측정이 없어요/)).toBeInTheDocument();
  const firstFeedbackId = history()[1].id;
  click("피드백 다시 선택");
  completeFeedback({ usageDetails: true });
  expect(history()).toHaveLength(2);
  expect(history()[1].id).toBe(firstFeedbackId);
  expect(history()[1].evaluatedRecordId).toBe(initial.id);
  expect(history()[1].evaluatedRoutine).toEqual(initial.routine);
  click("처음부터 다시");
  click("2차 체크하기");
  completeSymptomCheck();
  completeFeedback({ usageDetails: true });
  expect(history()).toHaveLength(3);
  expect(new Set(history().map((record) => record.journeyId)).size).toBe(1);
  expect(history()[2].outcome.skinComparison).toMatchObject({ baselineRecordId: firstFeedbackId, complete: true });
  expect(history()[2].dataReliability).toMatchObject({ level: "high", productAttributionReady: false });
  click("처음부터 다시");
  click("변화 기록 보기");
  expect(
    screen.getByRole("heading", { name: "내 피부 변화" }),
  ).toBeInTheDocument();
});

test("survey answers gate progression and a saved result can be reopened", () => {
  const { unmount } = render(<App />);
  openExistingEntry(/처음 시작해요/);
  expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  completeSurvey();
  click(/특별한 고민 없음/);
  click("다음");
  expect(history()).toHaveLength(1);
  expect(JSON.parse(localStorage.getItem(SAVED_SURVEY_KEY)).mainConcern).toBe(
    "none",
  );
  unmount();
  render(<App />);
  click("최근 결과 다시 보기");
  completeSymptomCheck();
  expect(
    screen.getByRole("heading", { name: "추천 루틴" }),
  ).toBeInTheDocument();
  click("2주 사용 후 피드백 입력");
  completeSymptomCheck();
  completeFeedback({ usageDetails: true });
  expect(history()[1].journeyId).toBe(history()[0].journeyId);
  expect(history()[1].outcome.skinComparison).toMatchObject({ complete: true, baselineRecordId: history()[0].id });
  expect(screen.getByRole("heading", { name: "Before / After · 피부 상태 8축" })).toBeInTheDocument();
  expect(screen.getByText("기록 충분")).toBeInTheDocument();
  expect(screen.getByRole("table", { hidden: true })).not.toBeVisible();
  expect(screen.getByRole("heading", { name: "다음 단계 기본 루틴" })).toBeVisible();
});

const concerns = [
  ["inflammatory_acne", issueQuestions.inflammatoryAcneQuestions],
  ["closed_comedones", issueQuestions.closedComedoneQuestions],
  ["blackhead_sebum", issueQuestions.blackheadSebumQuestions],
  ["dehydration", issueQuestions.dehydrationQuestions],
  ["sensitivity_redness", issueQuestions.sensitivityRednessQuestions],
  ["oiliness", issueQuestions.oilinessQuestions],
];

test.each(concerns)(
  "%s follow-up questions reach the guide and save the selected concern",
  (concernId, questions) => {
    render(<App />);
    openExistingEntry(/처음 시작해요/);
    completeSurvey();
    const concern = issueQuestions.skinConcernOptions.find(
      (item) => item.id === concernId,
    );
    click(`${concern.label} ${concern.desc}`);
    click("다음");
    for (let i = 0; i < questions.length; i++) {
      const current = questions.find((question) =>
        screen.queryByRole("heading", { name: question.q }),
      );
      if (!current) break;
      click(current.options[0].label);
      const next = screen.queryByRole("button", { name: "다음", exact: true });
      if (next) fireEvent.click(next);
      else {
        click("분석 결과 보기");
        break;
      }
    }
    expect(history()).toHaveLength(1);
    expect(history()[0].mainConcern).toBe(concernId);
    expect(
      screen.getByRole("heading", { name: "추천 루틴" }),
    ).toBeInTheDocument();
    cleanup();
  },
);

test("browser popstate restores the prior screen", () => {
  render(<App />);
  openExistingEntry(/피부타입 알고 있어요/);
  fireEvent(
    window,
    new PopStateEvent("popstate", { state: { step: "start" } }),
  );
  expect(
    screen.getByRole("button", { name: "지금 피부 고민 확인하기" }),
  ).toBeInTheDocument();
});

test("a failed device write keeps the user on the current routine instead of creating an unsaved journey", () => {
  render(<App />);
  openExistingEntry(/피부타입 알고 있어요/);
  completeSymptomCheck();
  const beforeFailure = history();
  const disk = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    click("이 루틴으로 시작하기");
    expect(screen.getByRole("button", { name: "이 루틴으로 시작하기" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("저장하지 못했어요");
    expect(history()).toEqual(beforeFailure);
  } finally { disk.mockRestore(); log.mockRestore(); }
});

test("urgent symptoms stop immediately, persist independently and cannot expose products through browser back", () => {
  render(<App />);
  openExistingEntry(/피부타입 알고 있어요/);
  click("갑자기 붓거나 두드러기가 났어요");
  click("다음");
  click("네");
  expect(screen.getByRole("alert")).toHaveTextContent("119");
  expect(screen.queryByRole("button", { name: "피부 관리 설문·기록 이어가기" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "추천 루틴" })).not.toBeInTheDocument();
  const records = JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY));
  expect(records[0]).toMatchObject({ assessmentOnly: true, source: "symptom_check", symptomAssessment: { urgency: "emergency" } });
  expect(records[0]).not.toHaveProperty("skinMeasurement");
  fireEvent(window, new PopStateEvent("popstate", { state: { step: "quickRecommend" } }));
  expect(screen.getByRole("heading", { name: "지금은 새 제품 추천보다 상태 확인이 먼저예요" })).toBeInTheDocument();
});

test("overlapping breakout patterns save skin and product observations without automatic medication switching", () => {
  const { unmount } = render(<App />);
  click("증상 변화·악화 재설문");
  completeSymptomCheck({ concern: "breakouts", area: "trunk", form: "pustules", comedones: "no", uniform: "yes", itch: "strong", follicular: "yes", change: "worse", habit: "products", recentProduct: "active" }, { continueFlow: false });
  expect(screen.getByRole("heading", { name: "오늘 해볼 피부 관리" })).toBeInTheDocument();
  expect(screen.getByText("답변에서 확인한 피부 특징")).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: /모낭염 가능성/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "피부 관리 설문·기록 이어가기" })).not.toBeInTheDocument();
  expect(screen.getByText(/새 제품을 쓰기 시작한 날과 피부가 달라진 날/)).toBeInTheDocument();
  const records = JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY));
  expect(records).toHaveLength(1);
  expect(records[0].symptomAssessment.answers).toMatchObject({ recentProduct: "active", habit: "products" });
  unmount();
  render(<App />);
  click("지난 증상 확인 기록");
  expect(screen.getByText(/지난번에 저장한 확인 결과/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "피부 관리 설문·기록 이어가기" })).not.toBeInTheDocument();
});

test("worsening reported during feedback triggers a fresh symptom check before any next routine", () => {
  render(<App />);
  openExistingEntry(/피부타입 알고 있어요/);
  completeSymptomCheck();
  click("이 루틴으로 시작하기");
  screen.getAllByRole("button", { name: "꾸준히 사용함", exact: true }).forEach(button => fireEvent.click(button));
  for (const question of feedbackQuestions) {
    const option = question.id === "trouble" ? question.options[3] : question.options[0];
    screen.getAllByRole("button", { name: option.label, exact: true }).forEach(button => fireEvent.click(button));
  }
  click("원래 있던 트러블이 더 심해졌어요");
  click("피부 상태 다시 확인하기");
  expect(screen.getByRole("heading", { name: "지금 피부 상태부터 확인할게요" })).toBeInTheDocument();
  completeSymptomCheck({ concern: "sensitive", change: "worse" }, { continueFlow: false });
  expect(screen.getByRole("heading", { name: "새 제품보다 악화·자극 원인 확인이 먼저예요" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "다음 단계 기본 루틴" })).not.toBeInTheDocument();
});

const guidedBreakoutBase = {
  concern: "breakouts", change: "stable", surface: "intact", basicRoutine: "both",
  barrier: "none", duration: "under_week", area: "chin", form: "mixed",
  comedones: "yes", itch: "none", follicular: "no", shaving: "no", pain: "none",
  recentProduct: "none",
};

function answerGuidedCheck(overrides, { hydration = false } = {}) {
  click("지금 피부 고민 확인하기");
  const answers = { ...guidedBreakoutBase, ...overrides };
  const questions = getVisibleSymptomQuestions(answers, { guided: true });
  for (const [index, question] of questions.entries()) {
    expect(screen.getByRole("heading", { name: question.q })).toBeVisible();
    click(question.options.find(option => option.value === answers[question.id]).label);
    if (index < questions.length - 1 || hydration) click("다음");
  }
}

test("guided check keeps a comfortable routine and gives breakout care without product recommendations", () => {
  render(<App />);
  answerGuidedCheck({});
  click("내 피부 관리 보기");
  expect(screen.getByRole("heading", { name: "턱 트러블을 짜거나 건드리지 않고 지켜봐요." })).toBeVisible();
  expect(screen.getByText("잘 맞던 세안제와 보습제는 유지해요.")).toBeVisible();
  expect(screen.queryByRole("heading", { name: "보습제 후보 한 가지" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "피부 관리 설문·기록 이어가기" })).not.toBeInTheDocument();
});

test("guided check asks about hydration for tightness and suggests only one basic moisturizer", () => {
  render(<App />);
  answerGuidedCheck({ basicRoutine: "cleanser", barrier: "dry" }, { hydration: true });
  expect(screen.getByRole("heading", { name: "오후가 되면 피부가 보통 어떤가요?" })).toBeVisible();
  click("건조하고 당기는 느낌이 이어져요");
  click("내 피부 관리 보기");
  expect(screen.getByRole("heading", { name: "세안 후 보습제 한 가지만 먼저 써봐요." })).toBeVisible();
  expect(screen.getByRole("heading", { name: "보습제 후보 한 가지" })).toBeVisible();
  expect(screen.getAllByRole("img")).toHaveLength(1);
  expect(screen.getByText(/추정 수분감 3단계/)).not.toBeVisible();
  fireEvent.click(screen.getByText("왜 이렇게 안내했나요?", { selector: "summary" }));
  expect(screen.getByText(/추정 수분감 3단계/)).toBeVisible();
  expect(screen.getByText(/트러블을 짜거나 건드리지 않고 지켜봐요/)).toBeVisible();
  expect(history()).toHaveLength(0);
});

test("guided check prioritizes repeated stinging and does not offer new products", () => {
  render(<App />);
  answerGuidedCheck({ barrier: "stinging" });
  click("내 피부 관리 보기");
  expect(screen.getByRole("heading", { name: "새 제품보다 악화·자극 원인 확인이 먼저예요" })).toBeVisible();
  expect(screen.getByText(/편안했던 세안·보습만 유지해요/)).toBeVisible();
  expect(screen.queryByRole("heading", { name: "보습제 후보 한 가지" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "피부 관리 설문·기록 이어가기" })).not.toBeInTheDocument();
});

test("blackhead guidance offers one cosmetic at a time and a separate pharmacy discussion option", () => {
  render(<App />);
  answerGuidedCheck({ concern: "blackheads", blackheadPattern: "dark", currentActives: "no" });
  click("내 피부 관리 보기");
  expect(screen.getByText("코스알엑스 살리실산 데일리 젠틀 클렌저")).toBeVisible();
  expect(screen.getByText("잘 맞던 세안제와 보습제는 유지해요.")).toBeVisible();
  expect(screen.getByText("코스알엑스 BHA 블랙헤드 파워 리퀴드")).not.toBeVisible();
  fireEvent.click(screen.getByText("토너·리퀴드 대안 보기", { selector: "summary" }));
  expect(screen.getByText("코스알엑스 BHA 블랙헤드 파워 리퀴드")).toBeVisible();
  expect(screen.getByText("약사와 확인할 일반의약품 · 클리어틴외용액 2%")).toBeVisible();
});

test.each([
  { blackheadPattern: "dark", currentActives: "yes" },
  { blackheadPattern: "even" },
  { blackheadPattern: "dark", barrier: "stinging" },
])("blackhead check avoids adding exfoliants or OTC products for %j", overrides => {
  render(<App />);
  answerGuidedCheck({ concern: "blackheads", ...overrides });
  click("내 피부 관리 보기");
  expect(screen.queryByText("코스알엑스 살리실산 데일리 젠틀 클렌저")).not.toBeInTheDocument();
  expect(screen.queryByText(/클리어틴외용액/)).not.toBeInTheDocument();
});

test("mild acne-like bumps and folliculitis-like bumps do not get the same pharmacy advice", () => {
  render(<App />);
  answerGuidedCheck({ form: "papules", currentActives: "no" });
  click("내 피부 관리 보기");
  expect(screen.getByText("약사와 확인할 일반의약품 · 애크논크림")).toBeVisible();
  click("시작 화면으로");
  answerGuidedCheck({ form: "pustules", comedones: "no", follicular: "yes" });
  click("내 피부 관리 보기");
  expect(screen.getByRole("heading", { name: "모낭염처럼 보이는 돌기가 있다면" })).toBeVisible();
  expect(screen.queryByText(/약사와 확인할 일반의약품/)).not.toBeInTheDocument();
});

test.each([
  ["건조하고 당기는 느낌이 이어져요", /피지오겔|일리윤/],
  ["번들거림이 더 신경 쓰여요", /토리든 다이브인 저분자 히알루론산 수딩 크림/],
])("beginner check offers four basic slots matched to %s", (afternoon, cream) => {
  render(<App />);
  answerGuidedCheck({ concern: "none", basicRoutine: "neither" }, { hydration: true });
  click(afternoon);
  click("내 피부 관리 보기");
  expect(screen.getByRole("heading", { name: "피부에 맞는 기초 제품 네 가지" })).toBeVisible();
  expect(screen.getAllByRole("img")).toHaveLength(4);
  expect(screen.getByRole("img", { name: cream })).toBeVisible();
  expect(screen.getAllByText("선택", { exact: true })).toHaveLength(2);
  expect(screen.queryByText(/약사와 확인할 일반의약품/)).not.toBeInTheDocument();
});

test("wrinkle care keeps a well-tolerated sunscreen instead of adding another one", () => {
  render(<App />);
  answerGuidedCheck({ concern: "wrinkles", usesSunscreen: "yes" });
  click("내 피부 관리 보기");
  expect(screen.getByText("잘 맞던 선크림과 기초 관리는 유지해요.")).toBeVisible();
  expect(screen.queryByText("라운드랩 자작나무 수분 선크림")).not.toBeInTheDocument();
});

test.each([
  [{ concern: "oily", usesToner: "no" }, "이즈앤트리 그린티 프레쉬 토너"],
  [{ concern: "sensitive", sensitiveCare: "comfortable_no_serum" }, "스킨1004 마다가스카르 센텔라 앰플"],
  [{ concern: "wrinkles", usesSunscreen: "no" }, "라운드랩 자작나무 수분 선크림"],
])("guided care suggests a missing optional product for %j", (answers, name) => {
  render(<App />);
  answerGuidedCheck(answers);
  click("내 피부 관리 보기");
  expect(screen.getByText(name)).toBeVisible();
});

test("an irritated beginner does not get a four-product starter routine", () => {
  render(<App />);
  answerGuidedCheck({ concern: "sensitive", basicRoutine: "neither", sensitiveCare: "irritated" });
  click("내 피부 관리 보기");
  expect(screen.getByText("피부 반응이 확인될 때까지 새 제품을 추가하지 않아요.")).toBeVisible();
  expect(screen.queryByRole("heading", { name: "피부에 맞는 기초 제품 네 가지" })).not.toBeInTheDocument();
});
