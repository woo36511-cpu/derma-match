import { useState, useRef, useMemo, useEffect } from "react";
import { getProductById, getRoutineProducts } from "../utils/productCatalog";
import { feedbackQuestions } from "../data/feedbackQuestions";
import { skinSurveyQuestions } from "../data/skinSurvey";
import {
  analyzeSkinSurvey,
  adjustCareNeedsForIssue,
} from "../utils/analyzeSkinSurvey";
import { SAVED_SURVEY_KEY, JOURNEY_HISTORY_KEY } from "../data/storageKeys";
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
import { useJourneyActions } from "./useJourneyActions";

export function useSkinCoach() {
  const starterLevel = 5;

  const [step, setStep] = useState("start");
  const [answers, setAnswers] = useState({});
  const [quickLevel, setQuickLevel] = useState(5);
  const isBrowserBackRef = useRef(false);
  const [baseLevel, setBaseLevel] = useState(5);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [savedSurvey, setSavedSurvey] = useState(null);
  const [journeyHistory, setJourneyHistory] = useState([]);
  const [activeJourneyId, setActiveJourneyId] = useState(null);
  const [viewJourneyId, setViewJourneyId] = useState(null);
  const [mainConcern, setMainConcern] = useState("");
  const [issueAnswers, setIssueAnswers] = useState({});
  const [issueIndex, setIssueIndex] = useState(0);

  const [productUsageFeedback, setProductUsageFeedback] = useState({});

  const [feedbackSurveyAnswers, setFeedbackSurveyAnswers] = useState({});

  const feedbackJourneyRecords = useMemo(
    () =>
      journeyHistory.filter(
        (item) =>
          item.journeyId === activeJourneyId || item.id === activeJourneyId,
      ),
    [journeyHistory, activeJourneyId],
  );

  const feedbackTargetRecord =
    feedbackJourneyRecords.length > 0
      ? feedbackJourneyRecords[feedbackJourneyRecords.length - 1]
      : null;

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
      ({ product }) => !!productUsageFeedback[product.id],
    );

  const isComplete =
    feedbackQuestions.every((q) => answers[q.id] !== undefined) &&
    isProductUsageComplete;

  const feedbackSurveyComplete = skinSurveyQuestions.every((question) => {
    const answer = feedbackSurveyAnswers[question.id];

    if (question.type === "multi") {
      return Array.isArray(answer) && answer.length > 0;
    }

    return !!answer;
  });

  const followUpSurveyResult = useMemo(
    () => analyzeSkinSurvey(feedbackSurveyAnswers, skinSurveyQuestions),
    [feedbackSurveyAnswers],
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
    try {
      const saved = localStorage.getItem(SAVED_SURVEY_KEY);

      if (saved) {
        setSavedSurvey(JSON.parse(saved));
      }

      const savedJourney = localStorage.getItem(JOURNEY_HISTORY_KEY);

      if (savedJourney) {
        const parsedJourney = JSON.parse(savedJourney);

        if (Array.isArray(parsedJourney)) {
          setJourneyHistory(parsedJourney);
        }
      }
    } catch (error) {
      console.error("저장된 피부 기록을 불러오지 못했어요.", error);
    }
  }, []);

  const nextLevel = useMemo(() => {
    if (feedbackSurveyComplete) {
      return followUpSurveyResult.hydrationLevel;
    }

    return calculateNextLevel(baseLevel, answers);
  }, [baseLevel, answers, feedbackSurveyComplete, followUpSurveyResult]);

  const surveyResult = useMemo(() => {
    return analyzeSkinSurvey(surveyAnswers, skinSurveyQuestions);
  }, [surveyAnswers]);

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

  const starterRoutine = getRoutineProducts(starterLevel);
  const nextRoutine = buildDynamicRoutine(nextLevel, {
    mainConcern: feedbackMainConcern,

    careNeeds: feedbackSurveyComplete
      ? followUpSurveyResult.careNeeds
      : adjustedSurveyCareNeeds,

    isSensitive: feedbackSurveyComplete
      ? followUpSurveyResult.skinType?.includes("민감") ||
        (followUpSurveyResult.scores?.sensitivity ?? 0) >= 2
      : surveyResult.skinType?.includes("민감") ||
        (surveyResult.scores?.sensitivity ?? 0) >= 2 ||
        feedbackMainConcern === "sensitivity_redness",
  });
  const quickRoutine = buildDynamicRoutine(quickLevel);
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

  const surveyRoutine = buildDynamicRoutine(surveyResult.hydrationLevel, {
    mainConcern,

    careNeeds: adjustedSurveyCareNeeds,

    isSensitive:
      surveyResult.skinType?.includes("민감") ||
      (surveyResult.scores?.sensitivity ?? 0) >= 2,
  });

  const savedSurveyResult = useMemo(() => {
    if (!savedSurvey?.surveyAnswers) return null;

    return analyzeSkinSurvey(savedSurvey.surveyAnswers, skinSurveyQuestions);
  }, [savedSurvey]);

  const hasSavedSurvey = !!savedSurveyResult;

  const currentSurveyQuestion = skinSurveyQuestions[surveyIndex];
  const currentSurveyAnswer = currentSurveyQuestion
    ? surveyAnswers[currentSurveyQuestion.id]
    : null;

  const isLastSurveyQuestion = surveyIndex === skinSurveyQuestions.length - 1;

  const isCurrentSurveyAnswered = currentSurveyQuestion
    ? currentSurveyQuestion.type === "multi"
      ? Array.isArray(currentSurveyAnswer) && currentSurveyAnswer.length > 0
      : !!currentSurveyAnswer
    : false;

  const surveyProgress = ((surveyIndex + 1) / skinSurveyQuestions.length) * 100;

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
    level: nextLevel,
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
      [productId]: value,
    }));
  };

  const handleFeedbackSurveyAnswer = (question, option) => {
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

      // 눈/입술 붓기가 아니라면 호흡 질문의 예전 답변 삭제
      if (question.id === "swelling" && option.value !== "eyes_lips") {
        delete next.breathing;
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
      saveSurveyResult();
      setStep("surveyResult");
      return;
    }

    setIssueIndex((prev) =>
      Math.min(prev + 1, activeIssueQuestions.length - 1),
    );
  };

  const resetFlow = () => {
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
      setStep("issueSelect");
      return;
    }

    setSurveyIndex((prev) =>
      Math.min(prev + 1, skinSurveyQuestions.length - 1),
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

    setStep("feedback");
  };

  const {
    saveSurveyResult,
    startQuickJourneyFeedback,
    saveFeedbackResult,
    openSavedSurveyResult,
    startSavedFeedback,
  } = useJourneyActions({
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
  });

  return {
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
