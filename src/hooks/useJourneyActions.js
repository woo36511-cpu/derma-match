import { buildProductUsagePlan } from "../utils/productUsagePlan";
import { SAVED_SURVEY_KEY, JOURNEY_HISTORY_KEY } from "../data/storageKeys";
import {
  buildSkinStateDelta,
  buildFeedbackConfounders,
  buildFeedbackUsageReport,
  buildFeedbackDataQuality,
  getFeedbackConditionSnapshot,
  getJourneyChangeReasons,
} from "../utils/feedbackAnalysis";

export function useJourneyActions({
  surveyAnswers,
  mainConcern,
  issueAnswers,
  surveyResult,
  adjustedSurveyCareNeeds,
  surveyRoutine,
  setSavedSurvey,
  setActiveJourneyId,
  setViewJourneyId,
  setJourneyHistory,
  quickLevel,
  quickRoutine,
  setMainConcern,
  setBaseLevel,
  setAnswers,
  setProductUsageFeedback,
  setFeedbackSurveyAnswers,
  setStep,
  journeyHistory,
  activeJourneyId,
  feedbackJourneyRecords,
  feedbackSurveyComplete,
  followUpSurveyResult,
  feedbackTargetProducts,
  productUsageFeedback,
  answers,
  baseLevel,
  nextLevel,
  feedbackMainConcern,
  nextRoutine,
  userContext,
  savedSurvey,
  setSurveyAnswers,
  setIssueAnswers,
  setSurveyIndex,
  setIssueIndex,
  savedSurveyResult,
}) {
  const saveSurveyResult = () => {
    const timestamp = Date.now();
    const savedAt = new Date().toISOString();

    const journeyId = `journey-${timestamp}`;

    const data = {
      id: `survey-${timestamp}`,
      journeyId,
      journeySchemaVersion: 2,
      type: "initial_survey",

      surveyAnswers,
      mainConcern,
      issueAnswers,

      result: {
        skinType: surveyResult.skinType,

        hydrationLevel: surveyResult.hydrationLevel,

        scores: surveyResult.scores,

        skinState: surveyResult.skinState,

        careNeeds: adjustedSurveyCareNeeds,

        lifestyleTags: surveyResult.lifestyleTags,
      },

      routine: {
        cleanser: surveyRoutine.products.cleanser?.id ?? null,

        toner: surveyRoutine.products.toner?.id ?? null,

        serum: surveyRoutine.products.serum?.id ?? null,

        cream: surveyRoutine.products.cream?.id ?? null,
      },

      productUsagePlan: buildProductUsagePlan(
        surveyRoutine.products,
        surveyResult.skinType,
        savedAt,
      ),

      savedAt,
    };

    try {
      // 가장 최근 설문 결과 저장
      localStorage.setItem(SAVED_SURVEY_KEY, JSON.stringify(data));

      setSavedSurvey(data);
      setActiveJourneyId(journeyId);
      setViewJourneyId(null);

      // Skin Journey 누적
      const savedHistory = localStorage.getItem(JOURNEY_HISTORY_KEY);

      let history = [];

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);

        if (Array.isArray(parsedHistory)) {
          history = parsedHistory;
        }
      }

      const updatedHistory = [...history, data];

      localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify(updatedHistory));

      setJourneyHistory(updatedHistory);
    } catch (error) {
      console.error("설문 결과를 저장하지 못했어요.", error);
    }
  };

  const startQuickJourneyFeedback = () => {
    const timestamp = Date.now();
    const savedAt = new Date().toISOString();

    const journeyId = `journey-quick-${timestamp}`;

    const quickSkinType =
      quickLevel <= 4 ? "건성" : quickLevel <= 6 ? "수부지 / 복합성" : "지성";

    const quickStartData = {
      id: `quick-${timestamp}`,
      journeyId,
      journeySchemaVersion: 2,

      type: "initial_survey",
      source: "quick",

      mainConcern: "none",

      result: {
        skinType: quickSkinType,

        hydrationLevel: quickLevel,

        scores: {},

        // 빠른 추천은 정식 설문을 거치지 않으므로
        // 피부 상태를 임의로 만들어내지 않음
        skinState: null,
        careNeeds: null,
      },

      routine: {
        cleanser: quickRoutine.products.cleanser?.id ?? null,

        toner: quickRoutine.products.toner?.id ?? null,

        serum: quickRoutine.products.serum?.id ?? null,

        cream: quickRoutine.products.cream?.id ?? null,
      },

      productUsagePlan: buildProductUsagePlan(
        quickRoutine.products,
        quickSkinType,
        savedAt,
      ),

      savedAt,
    };

    try {
      const savedHistory = localStorage.getItem(JOURNEY_HISTORY_KEY);

      let history = [];

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);

        if (Array.isArray(parsedHistory)) {
          history = parsedHistory;
        }
      }

      const updatedHistory = [...history, quickStartData];

      localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify(updatedHistory));

      setJourneyHistory(updatedHistory);

      setActiveJourneyId(journeyId);
      setViewJourneyId(null);

      setMainConcern("none");
      setBaseLevel(quickLevel);
      setAnswers({});
      setProductUsageFeedback({});
      setFeedbackSurveyAnswers({});

      setStep("feedback");
    } catch (error) {
      console.error("빠른 추천 Journey를 저장하지 못했어요.", error);

      setActiveJourneyId(journeyId);
      setViewJourneyId(null);
      setMainConcern("none");
      setBaseLevel(quickLevel);
      setAnswers({});
      setProductUsageFeedback({});
      setFeedbackSurveyAnswers({});

      setStep("feedback");
    }
  };

  const saveFeedbackResult = () => {
    const savedAt = new Date().toISOString();

    const currentJourneyRecords = journeyHistory.filter(
      (item) =>
        item.journeyId === activeJourneyId || item.id === activeJourneyId,
    );

    const latestJourneyRecord =
      currentJourneyRecords.length > 0
        ? currentJourneyRecords[currentJourneyRecords.length - 1]
        : null;

    const baselineRecord =
      feedbackJourneyRecords.find((item) => item.type === "initial_survey") ||
      null;

    const baselineSkinState =
      latestJourneyRecord?.outcome?.followUpSkinState ??
      latestJourneyRecord?.result?.skinState ??
      baselineRecord?.result?.skinState ??
      null;

    const followUpSkinState = feedbackSurveyComplete
      ? followUpSurveyResult.skinState
      : null;

    const skinStateDelta = buildSkinStateDelta(
      baselineSkinState,
      followUpSkinState,
    );

    const actualProductUsage = feedbackTargetProducts.map(
      ({ category, product }) => ({
        productId: product.id,

        productNameSnapshot: product.name,

        category,

        usageStatus: productUsageFeedback[product.id]?.status ?? "unknown",
      }),
    );

    const confounders = buildFeedbackConfounders(answers);

    const usageReport = buildFeedbackUsageReport(answers);

    const dataQuality = buildFeedbackDataQuality(answers);

    const feedbackData = {
      id: `feedback-${Date.now()}`,
      type: "feedback",
      journeySchemaVersion: 2,

      feedbackAnswers: answers,

      journeyId: activeJourneyId,

      // 이번 피드백이 실제로 평가한
      // 이전 루틴을 함께 보존
      evaluatedRoutine: latestJourneyRecord?.routine ?? null,

      evaluatedProductUsagePlan: latestJourneyRecord?.productUsagePlan ?? null,

      actualProductUsage,

      usageReport,
      confounders,
      dataQuality: {
        ...dataQuality,

        usedProductCount: actualProductUsage.filter(
          (item) =>
            item.usageStatus === "consistent" ||
            item.usageStatus === "occasional",
        ).length,

        productAttributionReady:
          actualProductUsage.filter(
            (item) =>
              item.usageStatus === "consistent" ||
              item.usageStatus === "occasional",
          ).length === 1 &&
          actualProductUsage.filter((item) => item.usageStatus === "consistent")
            .length === 1 &&
          dataQuality.confidenceLevel === "high",
      },

      outcome: {
        conditionSnapshot: getFeedbackConditionSnapshot(answers),

        baselineSkinState,
        followUpSkinState,
        skinStateDelta,

        baselineLifestyleTags:
          latestJourneyRecord?.outcome?.followUpLifestyleTags ??
          latestJourneyRecord?.result?.lifestyleTags ??
          baselineRecord?.result?.lifestyleTags ??
          baselineRecord?.lifestyleTags ??
          [],

        followUpLifestyleTags: feedbackSurveyComplete
          ? followUpSurveyResult.lifestyleTags
          : [],
      },

      changeReasons: getJourneyChangeReasons(
        answers,
        {
          hydrationLevel: baseLevel,
          mainConcern,
        },
        {
          hydrationLevel: nextLevel,
          mainConcern: feedbackMainConcern,
        },
      ),

      previousState: {
        hydrationLevel: baseLevel,
        mainConcern,
      },

      nextState: {
        hydrationLevel: nextLevel,
        mainConcern: feedbackMainConcern,
      },

      routine: {
        cleanser: nextRoutine.products.cleanser?.id ?? null,

        toner: nextRoutine.products.toner?.id ?? null,

        serum: nextRoutine.products.serum?.id ?? null,

        cream: nextRoutine.products.cream?.id ?? null,
      },

      productUsagePlan: buildProductUsagePlan(
        nextRoutine.products,
        userContext.skinType,
        savedAt,
      ),

      savedAt,
    };

    try {
      const savedHistory = localStorage.getItem(JOURNEY_HISTORY_KEY);

      let history = [];

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);

        if (Array.isArray(parsedHistory)) {
          history = parsedHistory;
        }
      }

      const updatedHistory = [...history, feedbackData];

      localStorage.setItem(JOURNEY_HISTORY_KEY, JSON.stringify(updatedHistory));

      setJourneyHistory(updatedHistory);

      setStep("result");
    } catch (error) {
      console.error("피드백 결과를 저장하지 못했어요.", error);

      setStep("result");
    }
  };

  const openSavedSurveyResult = () => {
    if (!savedSurvey?.surveyAnswers) return;

    setSurveyAnswers(savedSurvey.surveyAnswers);
    setMainConcern(savedSurvey.mainConcern || "");
    setIssueAnswers(savedSurvey.issueAnswers || {});
    setSurveyIndex(0);
    setIssueIndex(0);
    setStep("surveyResult");
  };

  const startSavedFeedback = () => {
    if (!savedSurvey?.surveyAnswers || !savedSurveyResult) {
      return;
    }

    const savedJourneyId = savedSurvey.journeyId || savedSurvey.id;

    setActiveJourneyId(savedJourneyId);

    // 예전 기록은 journeyId가 없을 수 있으므로
    // 기존 위치 기반 방식도 유지
    const savedSurveyIndex = journeyHistory.findIndex(
      (item) => item.id === savedSurvey.id,
    );

    const currentJourney = savedSurvey.journeyId
      ? journeyHistory.filter(
          (item) =>
            item.journeyId === savedSurvey.journeyId ||
            item.id === savedSurvey.id,
        )
      : savedSurveyIndex >= 0
        ? journeyHistory.slice(savedSurveyIndex)
        : [];

    const latestRecord =
      currentJourney.length > 0
        ? currentJourney[currentJourney.length - 1]
        : null;

    let latestLevel = savedSurveyResult.hydrationLevel;

    let latestConcern = savedSurvey.mainConcern || "";

    if (latestRecord?.type === "feedback") {
      latestLevel = latestRecord.nextState?.hydrationLevel ?? latestLevel;

      latestConcern = latestRecord.nextState?.mainConcern ?? latestConcern;
    }

    if (latestRecord?.type === "initial_survey") {
      latestLevel = latestRecord.result?.hydrationLevel ?? latestLevel;

      latestConcern = latestRecord.mainConcern ?? latestConcern;
    }

    setSurveyAnswers(savedSurvey.surveyAnswers);

    setMainConcern(latestConcern);

    setIssueAnswers(savedSurvey.issueAnswers || {});

    setBaseLevel(latestLevel);

    setAnswers({});
    setProductUsageFeedback({});
    setFeedbackSurveyAnswers({});

    setStep("feedback");
  };

  return {
    saveSurveyResult,
    startQuickJourneyFeedback,
    saveFeedbackResult,
    openSavedSurveyResult,
    startSavedFeedback,
  };
}
