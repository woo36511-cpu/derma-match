import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import App from "./App";
import { skinSurveyQuestions } from "./data/skinSurvey";
import { feedbackQuestions } from "./data/feedbackQuestions";
import * as issueQuestions from "./data/skinIssueQuestions";
import { SAVED_SURVEY_KEY, JOURNEY_HISTORY_KEY } from "./data/storageKeys";

const click = (name) => fireEvent.click(screen.getByRole("button", { name }));
const history = () => JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

function completeSurvey() {
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
  click(/피부타입 알고 있어요/);
  click(/지성 \/ 번들거림/);
  expect(screen.getByText("8단계")).toBeInTheDocument();
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
  click(/처음 시작해요/);
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
  expect(
    screen.getByRole("heading", { name: "추천 루틴" }),
  ).toBeInTheDocument();
  click("2주 사용 후 피드백 입력");
  completeFeedback({ usageDetails: true });
  expect(history()[1].journeyId).toBe(history()[0].journeyId);
  expect(history()[1].outcome.skinComparison).toMatchObject({ complete: true, baselineRecordId: history()[0].id });
  expect(screen.getByRole("heading", { name: "Before / After · 피부 상태 8축" })).toBeInTheDocument();
  expect(screen.getByText("기록 충분")).toBeInTheDocument();
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
    click(/처음 시작해요/);
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
  click(/피부타입 알고 있어요/);
  fireEvent(
    window,
    new PopStateEvent("popstate", { state: { step: "start" } }),
  );
  expect(
    screen.getByRole("button", { name: /처음 시작해요/ }),
  ).toBeInTheDocument();
});

test("a failed device write keeps the user on the current routine instead of creating an unsaved journey", () => {
  render(<App />);
  click(/피부타입 알고 있어요/);
  const disk = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    click("이 루틴으로 시작하기");
    expect(screen.getByRole("button", { name: "이 루틴으로 시작하기" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("저장하지 못했어요");
    expect(history()).toBeNull();
  } finally { disk.mockRestore(); log.mockRestore(); }
});
