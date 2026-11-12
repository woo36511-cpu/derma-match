import { ADAPTIVE_SURVEY_VERSION } from "../data/adaptiveObservationSurvey";
import { isObservationVersion, questionsForSurveyVersion, analyzeSurveyVersion, cleanVersionedSurveyAnswers } from "../utils/skinSurveyVersions";
import { useState, useRef, useMemo, useEffect } from "react";
import { getProductById } from "../utils/productCatalog";
import { feedbackQuestions } from "../data/feedbackQuestions";
import {
  adjustCareNeedsForIssue,
} from "../utils/analyzeSkinSurvey";
import {
  calculateNextLevel,
  getFeedbackMainConcern,
  getFeedbackValue,
  getLevelChangeMessage,
  getFeedbackAdvice,
} from "../utils/feedbackAnalysis";
import { routineMap } from "../data/routineInfo";
import {
  buildDynamicRoutine,
  buildRoutineReason,
  getRecommendedIngredients,
} from "../utils/routineRecommendation";
import { analyzeInflammatoryAcneGuide } from "../utils/skinIssues/analyzeInflammatoryAcneGuide";
import { analyzeClosedComedoneGuide } from "../utils/skinIssues/analyzeClosedComedoneGuide";
import { analyzeBlackheadSebumGuide } from "../utils/skinIssues/analyzeBlackheadSebumGuide";
import { analyzeDehydrationGuide } from "../utils/skinIssues/analyzeDehydrationGuide";
import { analyzeSensitivityRednessGuide } from "../utils/skinIssues/analyzeSensitivityRednessGuide";
import { analyzeOilinessGuide } from "../utils/skinIssues/analyzeOilinessGuide";
import {
  skinConcernOptions,
  getVisibleInflammatoryAcneQuestions,
  getVisibleClosedComedoneQuestions,
  getVisibleBlackheadSebumQuestions,
  getVisibleDehydrationQuestions,
  getVisibleSensitivityRednessQuestions,
  getVisibleOilinessQuestions,
} from "../data/skinIssueQuestions";
import { buildJourneySummary } from "../utils/journeySummary";
import { getConcernTracking } from "../utils/concernTracking";
import { useJourneyActions } from "./useJourneyActions";
import { useJourneyAccount } from "./useJourneyAccount";
import { useMoisturizerObservation } from "./useMoisturizerObservation";
import { collectPersonalProductFeedback } from "../utils/personalProductFeedback";
import { getBasicObservationTracks, getObservationKinds, isProductObservation } from "../utils/moisturizerObservation";
import { useConcernCheck, isConcernCheckRecord } from "./useConcernCheck";
import { useSymptomCheck, isSymptomCheckRecord } from "./useSymptomCheck";
import { applyRoutineSafety, getRoutineSafety, getFeedbackRoutineSafety, feedbackNeedsSymptomReview } from "../utils/symptomAssessment";

export function useSkinCoach() {
  const starterLevel = 5;
  const { savedSurvey, journeyHistory: storedHistory, persistRecord, account, ownerId } = useJourneyAccount();
  // Symptom-only checks have no 8-axis measurement or product-effect attribution.
  const journeyHistory = useMemo(() => storedHistory.filter(record => !isSymptomCheckRecord(record) && !isConcernCheckRecord(record) && !isProductObservation(record)), [storedHistory]);

  const personalProductFeedback = useMemo(() => collectPersonalProductFeedback(storedHistory), [storedHistory]);
  const [step, setStep] = useState("start");
  const moisturizerObservation = useMoisturizerObservation({ ownerId, savedSurvey, storedHistory, persistRecord, setStep });
  const symptomCheck = useSymptomCheck({ ownerId, storedHistory, persistRecord, setStep });
  const [answers, setAnswers] = useState({});
  const symptomFeedbackSafety = getFeedbackRoutineSafety(symptomCheck.assessment, answers);
  const [quickLevel, setQuickLevel] = useState(5);
  const isBrowserBackRef = useRef(false);
  const [baseLevel, setBaseLevel] = useState(5);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [simpleMode, setSimpleMode] = useState(false);
  const [simpleRecord, setSimpleRecord] = useState(null);
  const [activeJourneyId, setActiveJourneyId] = useState(null);
  const [viewJourneyId, setViewJourneyId] = useState(null);
  const concernCheck = useConcernCheck({ ownerId, savedSurvey, storedHistory, persistRecord, setStep, setViewJourneyId, beginSymptomCheck: symptomCheck.begin });
  const [mainConcern, setMainConcern] = useState("");
  const [issueAnswers, setIssueAnswers] = useState({});
  const [issueIndex, setIssueIndex] = useState(0);

  const [productUsageFeedback, setProductUsageFeedback] = useState({});

  const [feedbackSurveyAnswers, setFeedbackSurveyAnswers] = useState({});
  const [feedbackDraft, setFeedbackDraft] = useState(null);

  const feedbackJourneyRecords = useMemo(
    () =>
      journeyHistory.filter(
        (item) =>
          item.journeyId === activeJourneyId || item.id === activeJourneyId,
      ),
    [journeyHistory, activeJourneyId],
  );

  const concernTracking = useMemo(
    () => getConcernTracking(storedHistory.filter(record =>
      record.journeyId === activeJourneyId || record.id === activeJourneyId
    ), feedbackDraft?.savedRecordId),
    [storedHistory, activeJourneyId, feedbackDraft?.savedRecordId],
  );

  const feedbackTargetRecord =
    feedbackJourneyRecords.find((record) => record.id === feedbackDraft?.evaluatedRecordId) ||
    (feedbackJourneyRecords.length > 0
      ? feedbackJourneyRecords[feedbackJourneyRecords.length - 1]
      : null);

  const feedbackTargetProducts = useMemo(() => {
    const routine = feedbackTargetRecord?.routine;

    if (!routine) return [];

    return Object.entries(routine)
      .map(([category, productId]) => {
        const product = getProductById(productId);

        if (!product) return null;

        return {
          category,
          product,
        };
      })
      .filter(Boolean);
  }, [feedbackTargetRecord]);

  const isProductUsageComplete =
    feedbackTargetProducts.length === 0 ||
    feedbackTargetProducts.every(
      ({ product }) => ["consistent", "occasional", "stopped", "never_used"].includes(productUsageFeedback[product.id]?.status),
    );

  const isComplete =
    feedbackQuestions.every((q) => answers[q.id] !== undefined) &&
    isProductUsageComplete;

  const feedbackSurveyVersion = feedbackTargetRecord?.surveyVersion || feedbackJourneyRecords.find(record => record.type === "initial_survey")?.surveyVersion;
  const observationFeedback = isObservationVersion(feedbackSurveyVersion);
  const feedbackQuestionsForSkin = questionsForSurveyVersion(feedbackSurveyVersion, feedbackSurveyAnswers);
  const feedbackSurveyComplete = feedbackQuestionsForSkin.every((question) => {
    const answer = feedbackSurveyAnswers[question.id];

    if (question.type === "multi") {
      return Array.isArray(answer) && answer.length > 0;
    }

    return !!answer;
  });

  const followUpSurveyResult = useMemo(
    () => analyzeSurveyVersion(feedbackSurveyVersion, feedbackSurveyAnswers),
    [feedbackSurveyAnswers, feedbackSurveyVersion],
  );

  useEffect(() => {
    window.history.replaceState({ step: "start" }, "", window.location.href);

    const handlePopState = (event) => {
      isBrowserBackRef.current = true;

      const previousStep = event.state?.step || "start";
      setStep(previousStep);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (isBrowserBackRef.current) {
      isBrowserBackRef.current = false;
      return;
    }

    const currentHistoryStep = window.history.state?.step;

    if (currentHistoryStep !== step) {
      window.history.pushState({ step }, "", window.location.href);
    }
  }, [step]);
  useEffect(() => {
    setStep("start");
    setSimpleMode(false); setSimpleRecord(null);
    setActiveJourneyId(null);
    setViewJourneyId(null);
    setSurveyAnswers({});
    setIssueAnswers({});
    setAnswers({});
    setProductUsageFeedback({});
    setFeedbackSurveyAnswers({});
    setFeedbackDraft(null);
    setMainConcern("");
    setSurveyIndex(0);
    setIssueIndex(0);
    setBaseLevel(5);
  }, [ownerId]);

  const nextLevel = useMemo(() => {
    if (observationFeedback && !feedbackSurveyComplete) return null;
    if (feedbackSurveyComplete) {
      return followUpSurveyResult.hydrationLevel;
    }

    return calculateNextLevel(baseLevel, answers);
  }, [baseLevel, answers, feedbackSurveyComplete, followUpSurveyResult, observationFeedback]);

  const surveyVersion = simpleMode ? simpleRecord?.surveyVersion ?? (simpleRecord ? "legacy-skin-v1" : ADAPTIVE_SURVEY_VERSION) : "legacy-skin-v1";
  const observationMode = isObservationVersion(surveyVersion);
  const activeSurveyQuestions = questionsForSurveyVersion(surveyVersion, surveyAnswers);
  const surveyResult = useMemo(() => {
    return analyzeSurveyVersion(surveyVersion, surveyAnswers);
  }, [surveyAnswers, surveyVersion]);

  const adjustedSurveyCareNeeds = useMemo(
    () =>
      adjustCareNeedsForIssue(
        surveyResult.careNeeds,
        mainConcern,
        issueAnswers,
      ),
    [surveyResult.careNeeds, mainConcern, issueAnswers],
  );

  const feedbackMainConcern = feedbackSurveyComplete
    ? followUpSurveyResult.mainIssue
    : getFeedbackMainConcern(answers, mainConcern);

  const starterRoutineInfo = routineMap[starterLevel];
  const nextRoutineInfo = routineMap[nextLevel];

  const starterRoutine = buildDynamicRoutine(starterLevel, { mainConcern: "none", basicOnly: true, isSensitive: true, personalProductFeedback });
  const observationFeedbackHold = observationFeedback && (!feedbackSurveyComplete || followUpSurveyResult.observationAssessment?.canRecommendBasics === false);
  const feedbackSafety = observationFeedbackHold ? { blocked: true, reason: followUpSurveyResult.observationAssessment?.recommendationReason ?? "현재 피부 상태 답변을 먼저 확인해요." } : symptomFeedbackSafety;
  const feedbackProfile = feedbackSurveyComplete ? followUpSurveyResult : surveyResult;
  const nextPersonalProductFeedback = useMemo(() => {
    if (!Object.keys(productUsageFeedback).length) return personalProductFeedback;
    const draft = { actualProductUsage: feedbackTargetProducts.map(({ product }) => ({
      productId: product.id, actualUsage: productUsageFeedback[product.id],
    })) };
    return collectPersonalProductFeedback([
      ...storedHistory.filter(record => record.id !== feedbackDraft?.savedRecordId), draft,
    ]);
  }, [feedbackTargetProducts, feedbackDraft?.savedRecordId, personalProductFeedback, productUsageFeedback, storedHistory]);
  const nextRoutine = applyRoutineSafety(observationFeedbackHold ? { products: {} } : buildDynamicRoutine(nextLevel, {
    basicOnly: feedbackSurveyVersion === ADAPTIVE_SURVEY_VERSION,
    mainConcern: feedbackMainConcern,
    personalProductFeedback: nextPersonalProductFeedback,
    observationKinds: getObservationKinds(feedbackProfile),
    observationTracks: getBasicObservationTracks(feedbackProfile),
    observedSkin: feedbackProfile.observationAssessment?.resolvedObservations,

    careNeeds: feedbackSurveyComplete
      ? followUpSurveyResult.careNeeds
      : adjustedSurveyCareNeeds,

    isSensitive: feedbackSurveyComplete
      ? followUpSurveyResult.observationAssessment?.isSensitive || followUpSurveyResult.skinType?.includes("민감") ||
        (followUpSurveyResult.scores?.sensitivity ?? 0) >= 2
      : surveyResult.skinType?.includes("민감") ||
        (surveyResult.scores?.sensitivity ?? 0) >= 2 ||
        feedbackMainConcern === "sensitivity_redness",
  }), feedbackSafety);
  const quickSafety = getRoutineSafety(symptomCheck.assessment);
  const quickRoutine = applyRoutineSafety(buildDynamicRoutine(quickLevel, { personalProductFeedback }), quickSafety);
  const quickRoutineReason = buildRoutineReason(quickLevel);

  const acneGuide = useMemo(() => {
    if (mainConcern !== "inflammatory_acne") {
      return null;
    }

    return analyzeInflammatoryAcneGuide(issueAnswers);
  }, [mainConcern, issueAnswers]);

  const closedComedoneGuide = useMemo(() => {
    if (mainConcern !== "closed_comedones") {
      return null;
    }

    return analyzeClosedComedoneGuide(issueAnswers, surveyResult);
  }, [mainConcern, issueAnswers, surveyResult]);

  const blackheadGuide = useMemo(() => {
    if (mainConcern !== "blackhead_sebum") {
      return null;
    }

    return analyzeBlackheadSebumGuide(issueAnswers, surveyResult);
  }, [mainConcern, issueAnswers, surveyResult]);

  const dehydrationGuide = useMemo(() => {
    if (mainConcern !== "dehydration") {
      return null;
    }

    return analyzeDehydrationGuide(issueAnswers, surveyResult);
  }, [mainConcern, issueAnswers, surveyResult]);

  const sensitivityGuide = useMemo(() => {
    if (mainConcern !== "sensitivity_redness") {
      return null;
    }

    return analyzeSensitivityRednessGuide(issueAnswers);
  }, [mainConcern, issueAnswers]);

  const oilinessGuide = useMemo(() => {
    if (mainConcern !== "oiliness") {
      return null;
    }

    return analyzeOilinessGuide(issueAnswers, surveyResult);
  }, [mainConcern, issueAnswers, surveyResult]);

  const activeIssueGuide =
    mainConcern === "inflammatory_acne"
      ? acneGuide
      : mainConcern === "closed_comedones"
        ? closedComedoneGuide
        : mainConcern === "blackhead_sebum"
          ? blackheadGuide
          : mainConcern === "dehydration"
            ? dehydrationGuide
            : mainConcern === "sensitivity_redness"
              ? sensitivityGuide
              : mainConcern === "oiliness"
                ? oilinessGuide
                : null;

  const selectedConcern = skinConcernOptions.find(
    (concern) => concern.id === mainConcern,
  );

  const finalSkinProfile = {
    ...surveyResult,

    mainIssue: mainConcern || surveyResult.mainIssue,

    issueLabel: selectedConcern?.label || surveyResult.issueLabel,

    issueAnswers,

    careNeeds: adjustedSurveyCareNeeds,

    acneGuide,
    issueGuide: activeIssueGuide,
  };

  const routineSafety = getRoutineSafety(symptomCheck.assessment, activeIssueGuide);
  const surveyRoutine = applyRoutineSafety(buildDynamicRoutine(surveyResult.hydrationLevel, {
    mainConcern,
    personalProductFeedback,

    careNeeds: adjustedSurveyCareNeeds,

    isSensitive:
      surveyResult.skinType?.includes("민감") ||
      (surveyResult.scores?.sensitivity ?? 0) >= 2,
  }), routineSafety);

  const savedSurveyResult = useMemo(() => {
    if (!savedSurvey?.surveyAnswers) return null;

    return analyzeSurveyVersion(savedSurvey.surveyVersion, savedSurvey.surveyAnswers);
  }, [savedSurvey]);

  const hasSavedSurvey = !!savedSurveyResult;

  const currentSurveyQuestion = activeSurveyQuestions[surveyIndex];
  const currentSurveyAnswer = currentSurveyQuestion
    ? surveyAnswers[currentSurveyQuestion.id]
    : null;

  const isLastSurveyQuestion = surveyIndex === activeSurveyQuestions.length - 1;

  const isCurrentSurveyAnswered = currentSurveyQuestion
    ? currentSurveyQuestion.type === "multi"
      ? Array.isArray(currentSurveyAnswer) && currentSurveyAnswer.length > 0
      : !!currentSurveyAnswer
    : false;

  const surveyProgress = ((surveyIndex + 1) / activeSurveyQuestions.length) * 100;

  const activeIssueQuestions =
    mainConcern === "inflammatory_acne"
      ? getVisibleInflammatoryAcneQuestions(issueAnswers)
      : mainConcern === "closed_comedones"
        ? getVisibleClosedComedoneQuestions(issueAnswers)
        : mainConcern === "blackhead_sebum"
          ? getVisibleBlackheadSebumQuestions(issueAnswers)
          : mainConcern === "dehydration"
            ? getVisibleDehydrationQuestions(issueAnswers)
            : mainConcern === "sensitivity_redness"
              ? getVisibleSensitivityRednessQuestions(issueAnswers)
              : mainConcern === "oiliness"
                ? getVisibleOilinessQuestions(issueAnswers)
                : [];

  const currentIssueQuestion = activeIssueQuestions[issueIndex] || null;

  const currentIssueAnswer = currentIssueQuestion
    ? issueAnswers[currentIssueQuestion.id]
    : null;

  const isLastIssueQuestion =
    activeIssueQuestions.length > 0 &&
    issueIndex === activeIssueQuestions.length - 1;

  const issueProgress =
    activeIssueQuestions.length > 0
      ? ((issueIndex + 1) / activeIssueQuestions.length) * 100
      : 0;

  const surveyUserContext = {
    mainConcern,
    level: surveyResult.hydrationLevel,
    careNeeds: adjustedSurveyCareNeeds,
    isSensitive:
      surveyResult.skinType?.includes("민감") ||
      (surveyResult.scores?.sensitivity ?? 0) >= 2,
    troubleScore:
      mainConcern === "inflammatory_acne"
        ? Math.max(surveyResult.scores.acne ?? 0, 1)
        : (surveyResult.scores.acne ?? 0),
    skinType: surveyResult.skinType,
    season: "spring",
    goal: finalSkinProfile.issueLabel,
  };

  const irritationLabel = answers.irritation?.label || "";

  const ingredients = getRecommendedIngredients(nextLevel, {
    clogged: getFeedbackValue(answers, "clogged"),

    trouble: getFeedbackValue(answers, "trouble"),

    irritated:
      irritationLabel.includes("따가움") ||
      irritationLabel.includes("붉어짐") ||
      irritationLabel.includes("불편함"),
  });
  const levelChangeMessage = getLevelChangeMessage(baseLevel, nextLevel);
  const feedbackAdvice = getFeedbackAdvice(answers);
  const userContext = {
    mainConcern: feedbackMainConcern,
    personalProductFeedback: nextPersonalProductFeedback,
    level: nextLevel,
    careNeeds: feedbackSurveyComplete
      ? followUpSurveyResult.careNeeds
      : adjustedSurveyCareNeeds,
    isSensitive:
      getFeedbackValue(answers, "dry") <= -1 ||
      getFeedbackValue(answers, "trouble") >= 1 ||
      (answers.irritation?.label || "").includes("따가움") ||
      (answers.irritation?.label || "").includes("붉어짐"),
    troubleScore: getFeedbackValue(answers, "trouble"),
    skinType: nextLevel <= 4 ? "건성" : nextLevel <= 6 ? "수부지" : "지성",
    season: "spring",
    goal:
      getFeedbackValue(answers, "trouble") >= 1
        ? "트러블 관리"
        : nextLevel <= 4
          ? "보습"
          : "유분 밸런스",
  };
  const routineReason = buildRoutineReason(nextLevel);
  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleProductUsageAnswer = (productId, value) => {
    setProductUsageFeedback((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...value },
    }));
  };

  const handleFeedbackSurveyAnswer = (question, option) => {
    if (observationFeedback) {
      setFeedbackSurveyAnswers(prev => cleanVersionedSurveyAnswers(feedbackSurveyVersion, { ...prev, [question.id]: option.label }));
      return;
    }
    setFeedbackSurveyAnswers((prev) => {
      const currentAnswer = prev[question.id];

      if (question.type === "multi") {
        const currentList = Array.isArray(currentAnswer) ? currentAnswer : [];

        if (option.lifestyle === "none" || option.lifestyle === "unknown") {
          return {
            ...prev,
            [question.id]: [option.label],
          };
        }

        const withoutNone = currentList.filter(
          (item) =>
            item !== "딱히 해당되는 게 없다" && item !== "잘 모르겠어요",
        );

        const alreadySelected = withoutNone.includes(option.label);

        return {
          ...prev,
          [question.id]: alreadySelected
            ? withoutNone.filter((item) => item !== option.label)
            : [...withoutNone, option.label],
        };
      }

      return {
        ...prev,
        [question.id]: option.label,
      };
    });
  };
  const handleSurveyAnswer = (question, option) => {
    if (observationMode) {
      setSurveyAnswers(prev => cleanVersionedSurveyAnswers(surveyVersion, { ...prev, [question.id]: option.label }));
      return;
    }
    setSurveyAnswers((prev) => {
      const currentAnswer = prev[question.id];

      if (question.type === "multi") {
        const currentList = Array.isArray(currentAnswer) ? currentAnswer : [];

        if (option.lifestyle === "none" || option.lifestyle === "unknown") {
          return {
            ...prev,
            [question.id]: [option.label],
          };
        }

        const withoutNone = currentList.filter(
          (item) =>
            item !== "딱히 해당되는 게 없다" && item !== "잘 모르겠어요",
        );
        const alreadySelected = withoutNone.includes(option.label);

        return {
          ...prev,
          [question.id]: alreadySelected
            ? withoutNone.filter((item) => item !== option.label)
            : [...withoutNone, option.label],
        };
      }

      return {
        ...prev,
        [question.id]: option.label,
      };
    });
  };
  const handleIssueAnswer = (question, option) => {
    setIssueAnswers((prev) => {
      const next = {
        ...prev,
        [question.id]: option,
      };

      // 턱/턱선이 아니게 바꾸면 예전 면도 답변 제거
      if (question.id === "area" && option.value !== "chin_jaw") {
        delete next.shaving;
      }

      // 단순 붉은 트러블로 바꾸면 예전 통증 답변 제거
      if (
        question.id === "form" &&
        !["pustule", "nodule", "cluster"].includes(option.value)
      ) {
        delete next.pain;
      }

      return next;
    });
  };

  const handlePrevIssue = () => {
    if (issueIndex === 0) {
      setStep("issueSelect");
      return;
    }

    setIssueIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextIssue = () => {
    if (!currentIssueAnswer) return;

    if (isLastIssueQuestion) {
      if (saveSurveyResult()) setStep("surveyResult");
      return;
    }

    setIssueIndex((prev) =>
      Math.min(prev + 1, activeIssueQuestions.length - 1),
    );
  };

  const resetFlow = () => {
    setSimpleMode(false); setSimpleRecord(null);
    setFeedbackDraft(null);
    setAnswers({});
    setSurveyAnswers({});
    setProductUsageFeedback({});
    setFeedbackSurveyAnswers({});
    setBaseLevel(5);
    setSurveyIndex(0);
    setMainConcern("");
    setIssueAnswers({});
    setIssueIndex(0);
    setActiveJourneyId(null);
    setViewJourneyId(null);
    setStep("start");
  };

  const handlePrevSurvey = () => {
    if (surveyIndex === 0) {
      setStep("start");
      return;
    }

    setSurveyIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextSurvey = () => {
    if (!isCurrentSurveyAnswered) return;

    if (isLastSurveyQuestion) {
      setStep(simpleMode ? "simpleCare" : "issueSelect");
      return;
    }

    setSurveyIndex((prev) =>
      Math.min(prev + 1, activeSurveyQuestions.length - 1),
    );
  };

  const {
    latestSurveyRecord,
    viewedJourneyStartRecord,
    activeJourneyRecords,
    journeyOptions,
    latestJourneyRecord,
    firstJourneyLevel,
    latestJourneyLevel,
    journeyLevelChange,
    latestJourneyConcern,
    previousJourneyStartRecord,
    previousJourneyEndLevel,
    previousJourneyConcern,
    currentJourneyStartConcern,
    previousJourneySkinType,
    currentJourneySkinType,
    journeyTransitionMessage,
    feedbackCount,
    isQuickJourney,
    quickJourneyCurrentLevel,
    quickJourneySkinType,
    journeyRoundSummaries,
  } = buildJourneySummary({ journeyHistory, step, viewJourneyId });
  const resumeQuickJourneyFeedback = () => {
    if (!isQuickJourney || !latestSurveyRecord) {
      return;
    }

    const journeyId = latestSurveyRecord.journeyId || latestSurveyRecord.id;

    const latestRecord =
      activeJourneyRecords.length > 0
        ? activeJourneyRecords[activeJourneyRecords.length - 1]
        : latestSurveyRecord;

    let latestLevel = latestSurveyRecord.result?.hydrationLevel ?? 5;

    let latestConcern = latestSurveyRecord.mainConcern || "none";

    if (latestRecord?.type === "feedback") {
      latestLevel = latestRecord.nextState?.hydrationLevel ?? latestLevel;

      latestConcern = latestRecord.nextState?.mainConcern ?? latestConcern;
    }

    setActiveJourneyId(journeyId);

    // 빠른 추천이므로 예전 설문 상태 제거
    setSurveyAnswers({});
    setIssueAnswers({});

    setMainConcern(latestConcern);
    setBaseLevel(latestLevel);
    setAnswers({});
    setProductUsageFeedback({});
    setFeedbackSurveyAnswers({});
    setFeedbackDraft(null);

    symptomCheck.begin("feedback");
  };

  const {
    saveSurveyResult,
    startQuickJourneyFeedback,
    saveFeedbackResult,
    openSavedSurveyResult: openLegacySavedSurveyResult,
    startSavedFeedback,
  } = useJourneyActions({
    symptomAssessment: symptomCheck.assessment,
    beginSymptomCheck: symptomCheck.begin,
    clearSymptomAssessment: symptomCheck.clearAssessment,
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
    concernTracking,
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
  });

  const startCheckedFlow = destination => {
    setSimpleMode(false); setSimpleRecord(null);
    symptomCheck.begin(destination);
  };

  const startSimpleSkinCare = () => {
    setSimpleMode(true); setSimpleRecord(null);
    setSurveyAnswers({}); setSurveyIndex(0); setMainConcern(""); setIssueAnswers({});
    setActiveJourneyId(null); setStep("survey");
  };
  const saveSimpleSkinRecord = record => {
    persistRecord(record);
    setSimpleRecord(record); setActiveJourneyId(record.journeyId); setViewJourneyId(null);
  };
  const openSavedSurveyResult = () => {
    if (savedSurvey?.source === "simple") {
      setSimpleMode(true); setSimpleRecord(savedSurvey); setSurveyAnswers(savedSurvey.surveyAnswers);
      setActiveJourneyId(savedSurvey.journeyId); setStep("simpleCare");
    } else { setSimpleMode(false); setSimpleRecord(null); openLegacySavedSurveyResult(); }
  };

  const startSymptomRecheck = () => {
    if (isQuickJourney) resumeQuickJourneyFeedback();
    else if (hasSavedSurvey) startSavedFeedback();
    else symptomCheck.begin("survey");
  };

  return {
    personalProductFeedback, simpleMode, simpleRecord, startSimpleSkinCare, saveSimpleSkinRecord, startCheckedFlow, surveyAnswers,
    symptomCheck, concernCheck, moisturizerObservation, routineSafety, feedbackSafety, quickSafety, startSymptomRecheck,
    continueFeedback: () => feedbackNeedsSymptomReview(answers) ? symptomCheck.begin("recheck") : setStep("recheck"),
    account,
    concernCheckHistory: storedHistory.filter(record => isConcernCheckRecord(record) &&
      record.concernTracking?.sourceRecordId === viewedJourneyStartRecord?.id),
    resetFlow,
    step,
    setActiveJourneyId,
    setStep,
    isQuickJourney,
    quickJourneySkinType,
    quickJourneyCurrentLevel,
    feedbackCount,
    latestJourneyRecord,
    resumeQuickJourneyFeedback,
    hasSavedSurvey,
    savedSurvey,
    savedSurveyResult,
    openSavedSurveyResult,
    startSavedFeedback,
    journeyOptions,
    viewedJourneyStartRecord,
    setViewJourneyId,
    previousJourneyStartRecord,
    previousJourneyEndLevel,
    previousJourneySkinType,
    firstJourneyLevel,
    currentJourneySkinType,
    latestJourneyLevel,
    journeyTransitionMessage,
    previousJourneyConcern,
    currentJourneyStartConcern,
    activeJourneyRecords,
    latestJourneyConcern,
    journeyLevelChange,
    journeyRoundSummaries,
    setQuickLevel,
    quickLevel,
    quickRoutineReason,
    quickRoutine,
    startQuickJourneyFeedback,
    activeSurveyQuestions, feedbackQuestionsForSkin,
    currentSurveyQuestion,
    surveyIndex,
    surveyProgress,
    currentSurveyAnswer,
    handleSurveyAnswer,
    handlePrevSurvey,
    handleNextSurvey,
    isCurrentSurveyAnswered,
    isLastSurveyQuestion,
    surveyResult,
    mainConcern,
    setIssueAnswers,
    setIssueIndex,
    setMainConcern,
    setSurveyIndex,
    saveSurveyResult,
    currentIssueQuestion,
    selectedConcern,
    issueIndex,
    activeIssueQuestions,
    issueProgress,
    currentIssueAnswer,
    handleIssueAnswer,
    handlePrevIssue,
    handleNextIssue,
    isLastIssueQuestion,
    finalSkinProfile,
    activeIssueGuide,
    surveyRoutine,
    surveyUserContext,
    setSurveyAnswers,
    starterRoutine,
    starterRoutineInfo,
    userContext,
    setBaseLevel,
    starterLevel,
    setAnswers,
    feedbackTargetProducts,
    concernTracking,
    productUsageFeedback,
    handleProductUsageAnswer,
    answers,
    handleAnswer,
    nextLevel,
    nextRoutineInfo,
    isComplete,
    feedbackSurveyAnswers,
    handleFeedbackSurveyAnswer,
    saveFeedbackResult,
    feedbackSurveyComplete,
    nextRoutine,
    baseLevel,
    levelChangeMessage,
    feedbackAdvice,
    routineReason,
    ingredients,
  };
}
