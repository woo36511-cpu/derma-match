import {
  buildProductUsagePlan,
  buildProductUsageRecord,
} from "../utils/productUsagePlan";
import { createJourneyRecordId } from "../utils/journeyStorage";
import {
  buildFeedbackConfounders,
  buildFeedbackUsageReport,
  getFeedbackConditionSnapshot,
  getJourneyChangeReasons,
} from "../utils/feedbackAnalysis";
import {
  buildSkinMeasurement,
  getRecordSkinMeasurement,
  buildSkinComparison,
} from "../utils/skinStateMeasurement";
import { buildUsageReliability } from "../utils/usageReliability";

export function useJourneyActions({
  surveyAnswers,
  mainConcern,
  issueAnswers,
  surveyResult,
  adjustedSurveyCareNeeds,
  surveyRoutine,
  setActiveJourneyId,
  setViewJourneyId,
  quickLevel,
  quickRoutine,
  setMainConcern,
  setBaseLevel,
  setAnswers,
  setProductUsageFeedback,
  setFeedbackSurveyAnswers,
  setStep,
  journeyHistory,
  persistRecord,
  activeJourneyId,
  feedbackJourneyRecords,
  feedbackTargetRecord,
  feedbackDraft,
  setFeedbackDraft,
  feedbackSurveyComplete,
  feedbackSurveyAnswers,
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
    setFeedbackDraft(null);
    const savedAt = new Date().toISOString();

    const journeyId = createJourneyRecordId("journey");

    const data = {
      id: createJourneyRecordId("survey"),
      journeyId,
      journeySchemaVersion: 3,
      type: "initial_survey",

      surveyAnswers,
      mainConcern,
      issueAnswers,

      skinMeasurement: buildSkinMeasurement(surveyResult.skinState, savedAt),

      result: {
        skinType: surveyResult.skinType,

        hydrationLevel: surveyResult.hydrationLevel,

        scores: surveyResult.scores,

        skinState: surveyResult.skinState,

        careNeeds: adjustedSurveyCareNeeds,

        lifestyleTags: surveyResult.lifestyleTags,

        lifestyleConfounders: surveyResult.lifestyleConfounders,
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
      persistRecord(data);
      setActiveJourneyId(journeyId);
      setViewJourneyId(null);
      return true;
    } catch (error) {
      console.error("설문 결과를 저장하지 못했어요.", error);
      return false;
    }
  };

  const startQuickJourneyFeedback = () => {
    setFeedbackDraft(null);
    const savedAt = new Date().toISOString();

    const journeyId = createJourneyRecordId("journey-quick");

    const quickSkinType =
      quickLevel <= 4 ? "건성" : quickLevel <= 6 ? "수부지 / 복합성" : "지성";

    const quickStartData = {
      id: createJourneyRecordId("quick"),
      journeyId,
      journeySchemaVersion: 3,

      type: "initial_survey",
      source: "quick",

      mainConcern: "none",

      skinMeasurement: buildSkinMeasurement(null, savedAt, "unmeasured"),

      result: {
        skinType: quickSkinType,

        hydrationLevel: quickLevel,

        scores: {},

        // 빠른 추천은 정식 설문을 거치지 않으므로
        // 피부 상태를 임의로 만들어내지 않음
        skinState: null,
        careNeeds: null,
        lifestyleConfounders: null,
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
      persistRecord(quickStartData);

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
    }
  };

  const saveFeedbackResult = () => {
    if (!feedbackSurveyComplete) return;
    const savedAt = new Date().toISOString();

    const currentJourneyRecords = journeyHistory.filter(
      (item) =>
        item.journeyId === activeJourneyId || item.id === activeJourneyId,
    );

    const latestJourneyRecord =
      feedbackTargetRecord || (currentJourneyRecords.length > 0
        ? currentJourneyRecords[currentJourneyRecords.length - 1]
        : null);

    const baselineRecord =
      feedbackJourneyRecords.find((item) => item.type === "initial_survey") ||
      null;

    const before = getRecordSkinMeasurement(latestJourneyRecord);
    const baselineSkinState = before.source === "unmeasured" ? null : before.values;

    const followUpSkinState = feedbackSurveyComplete
      ? followUpSurveyResult.skinState
      : null;

    const skinComparison = buildSkinComparison(
      before,
      buildSkinMeasurement(followUpSkinState, savedAt, "recheck"),
      latestJourneyRecord?.id ?? null,
    );
    const skinStateDelta = skinComparison.comparableAxisCount > 0 ? skinComparison.delta : null;

    const actualProductUsage = feedbackTargetProducts.map(
      ({ category, product }) =>
        buildProductUsageRecord(product, category, productUsageFeedback),
    );

    const confounders = buildFeedbackConfounders(answers);

    const usageReport = buildFeedbackUsageReport(answers);

    const dataReliability = buildUsageReliability({
      feedbackAnswers: answers,
      actualProductUsage,
      skinComparison,
    });

    const feedbackData = {
      id: feedbackDraft?.savedRecordId || createJourneyRecordId("feedback"),
      type: "feedback",
      journeySchemaVersion: 3,

      feedbackAnswers: answers,

      followUpSurveyAnswers: feedbackSurveyAnswers,

      journeyId: activeJourneyId,
      evaluatedRecordId: latestJourneyRecord?.id ?? null,

      // 이번 피드백이 실제로 평가한
      // 이전 루틴을 함께 보존
      evaluatedRoutine: latestJourneyRecord?.routine ?? null,

      evaluatedProductUsagePlan: latestJourneyRecord?.productUsagePlan ?? null,

      actualProductUsage,

      usageReport,
      confounders,
      dataReliability,
      dataQuality: {
        confidenceScore: dataReliability.score,
        confidenceLevel: dataReliability.level,
        usedProductCount: dataReliability.usedProductCount,
        majorConfounderCount: confounders.majorConfounderCount,
        confounderLevel: confounders.confounderLevel,
        productAttributionReady: dataReliability.productAttributionReady,
      },

      outcome: {
        conditionSnapshot: getFeedbackConditionSnapshot(answers),

        baselineSkinState,
        followUpSkinState,
        skinStateDelta,
        skinComparison,

        baselineLifestyleTags:
          latestJourneyRecord?.outcome?.followUpLifestyleTags ??
          latestJourneyRecord?.result?.lifestyleTags ??
          baselineRecord?.result?.lifestyleTags ??
          baselineRecord?.lifestyleTags ??
          [],

        followUpLifestyleTags: feedbackSurveyComplete
          ? followUpSurveyResult.lifestyleTags
          : [],

        followUpLifestyleConfounders: feedbackSurveyComplete
          ? followUpSurveyResult.lifestyleConfounders
          : null,
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
      persistRecord(feedbackData);
      setFeedbackDraft({ evaluatedRecordId: latestJourneyRecord?.id, savedRecordId: feedbackData.id });

      setStep("result");
    } catch (error) {
      console.error("피드백 결과를 저장하지 못했어요.", error);
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
    setFeedbackDraft(null);

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
