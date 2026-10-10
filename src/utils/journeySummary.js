import { skinConcernOptions } from "../data/skinIssueQuestions";
import { getJourneyChangeReasons } from "./feedbackAnalysis";

export function buildJourneySummary({ journeyHistory, step, viewJourneyId }) {
  const latestSurveyRecord =
    [...journeyHistory]
      .reverse()
      .find((item) => item.type === "initial_survey") || null;

  const journeyStartRecords = journeyHistory.filter(
    (item) => item.type === "initial_survey",
  );

  const getRecordsForJourney = (startRecord) => {
    if (!startRecord) {
      return [];
    }

    // journeyId가 있는 신규 기록
    if (startRecord.journeyId) {
      return journeyHistory.filter(
        (item) =>
          item.journeyId === startRecord.journeyId ||
          item.id === startRecord.id,
      );
    }

    // 예전 journeyId 없는 기록 호환
    const startIndex = journeyHistory.findIndex(
      (item) => item.id === startRecord.id,
    );

    if (startIndex < 0) {
      return [];
    }

    const nextJourneyIndex = journeyHistory.findIndex(
      (item, index) => index > startIndex && item.type === "initial_survey",
    );

    return nextJourneyIndex >= 0
      ? journeyHistory.slice(startIndex, nextJourneyIndex)
      : journeyHistory.slice(startIndex);
  };

  const viewedJourneyStartRecord =
    step === "journey" && viewJourneyId
      ? journeyStartRecords.find(
          (item) => (item.journeyId || item.id) === viewJourneyId,
        ) || latestSurveyRecord
      : latestSurveyRecord;

  const activeJourneyRecords = getRecordsForJourney(viewedJourneyStartRecord);

  const journeyOptions = [...journeyStartRecords]
    .reverse()
    .map((startRecord, index) => {
      const records = getRecordsForJourney(startRecord);

      const latestRecord =
        records.length > 0 ? records[records.length - 1] : startRecord;

      const currentLevel =
        latestRecord?.type === "feedback"
          ? latestRecord.nextState?.hydrationLevel
          : startRecord.result?.hydrationLevel;

      const checkCount = records.filter(
        (item) => item.type === "feedback",
      ).length;

      return {
        id: startRecord.journeyId || startRecord.id,

        number: journeyStartRecords.length - index,

        isLatest: index === 0,

        source: startRecord.source === "quick" ? "빠른 추천" : "피부 설문",

        skinType: startRecord.result?.skinType || "피부 기록",

        currentLevel,

        checkCount,

        savedAt: startRecord.savedAt,
      };
    });

  const firstJourneyRecord =
    activeJourneyRecords.length > 0 ? activeJourneyRecords[0] : null;

  const latestJourneyRecord =
    activeJourneyRecords.length > 0
      ? activeJourneyRecords[activeJourneyRecords.length - 1]
      : null;

  const getJourneyLevel = (item) => {
    if (!item) return null;

    if (item.type === "initial_survey") {
      return item.result?.hydrationLevel ?? null;
    }

    if (item.type === "feedback") {
      return item.nextState?.hydrationLevel ?? null;
    }

    return null;
  };

  const getJourneyConcern = (item) => {
    if (!item) return "none";

    if (item.type === "initial_survey") {
      return item.mainConcern || "none";
    }

    if (item.type === "feedback") {
      return item.nextState?.mainConcern || "none";
    }

    return "none";
  };

  const firstJourneyLevel = getJourneyLevel(firstJourneyRecord);

  const latestJourneyLevel = getJourneyLevel(latestJourneyRecord);

  const journeyLevelChange =
    firstJourneyLevel !== null && latestJourneyLevel !== null
      ? latestJourneyLevel - firstJourneyLevel
      : 0;

  const latestJourneyConcern =
    skinConcernOptions.find(
      (item) => item.id === getJourneyConcern(latestJourneyRecord),
    )?.label || "특별한 고민 없음";

  const viewedJourneyKey =
    viewedJourneyStartRecord?.journeyId || viewedJourneyStartRecord?.id || null;

  const viewedJourneyIndex = journeyStartRecords.findIndex(
    (item) => (item.journeyId || item.id) === viewedJourneyKey,
  );

  const previousJourneyStartRecord =
    viewedJourneyIndex > 0 ? journeyStartRecords[viewedJourneyIndex - 1] : null;

  const previousJourneyRecords = getRecordsForJourney(
    previousJourneyStartRecord,
  );

  const previousJourneyLatestRecord =
    previousJourneyRecords.length > 0
      ? previousJourneyRecords[previousJourneyRecords.length - 1]
      : null;

  const previousJourneyEndLevel = getJourneyLevel(previousJourneyLatestRecord);

  const previousJourneyConcern =
    skinConcernOptions.find(
      (item) => item.id === getJourneyConcern(previousJourneyLatestRecord),
    )?.label || "특별한 고민 없음";

  const currentJourneyStartConcern =
    skinConcernOptions.find(
      (item) => item.id === getJourneyConcern(firstJourneyRecord),
    )?.label || "특별한 고민 없음";

  const previousJourneySkinType =
    previousJourneyStartRecord?.result?.skinType || "피부 기록";

  const currentJourneySkinType =
    viewedJourneyStartRecord?.result?.skinType || "피부 기록";

  const journeyTransitionChange =
    previousJourneyEndLevel !== null && firstJourneyLevel !== null
      ? firstJourneyLevel - previousJourneyEndLevel
      : 0;

  const journeyTransitionMessage =
    previousJourneyEndLevel === null || firstJourneyLevel === null
      ? "두 Journey의 단계 정보를 비교하기 어려워요."
      : journeyTransitionChange === 0
        ? "이전 Journey 마지막과 이번 Journey 시작 단계가 같아요."
        : journeyTransitionChange > 0
          ? `이전 Journey 마지막보다 이번 시작이 ${journeyTransitionChange}단계 더 가벼운 루틴 방향이에요.`
          : `이전 Journey 마지막보다 이번 시작이 ${Math.abs(
              journeyTransitionChange,
            )}단계 더 촉촉한 루틴 방향이에요.`;

  const feedbackCount = activeJourneyRecords.filter(
    (item) => item.type === "feedback",
  ).length;

  const isQuickJourney = latestSurveyRecord?.source === "quick";

  const quickJourneyCurrentLevel = isQuickJourney
    ? getJourneyLevel(latestJourneyRecord)
    : null;

  const quickJourneySkinType = isQuickJourney
    ? latestSurveyRecord?.result?.skinType || "피부타입 직접 선택"
    : null;

  const currentJourneyRecords = activeJourneyRecords;

  const journeyRoundSummaries = currentJourneyRecords
    .map((record, recordIndex) => {
      if (record.type !== "feedback") {
        return null;
      }

      const previousRecord =
        recordIndex > 0 ? currentJourneyRecords[recordIndex - 1] : null;

      const previousLevel =
        record.previousState?.hydrationLevel ?? getJourneyLevel(previousRecord);

      const currentLevel =
        record.nextState?.hydrationLevel ?? getJourneyLevel(record);

      const concernLabel =
        skinConcernOptions.find(
          (concern) => concern.id === (record.nextState?.mainConcern || "none"),
        )?.label || "특별한 고민 없음";

      const previousRoutine = previousRecord?.routine || {};

      const currentRoutine = record.routine || {};

      const allCategories = [
        ...new Set([
          ...Object.keys(previousRoutine),
          ...Object.keys(currentRoutine),
        ]),
      ];

      const changedProductCount = allCategories.filter(
        (category) =>
          (previousRoutine[category] ?? null) !==
          (currentRoutine[category] ?? null),
      ).length;

      const reasons =
        record.changeReasons?.length > 0
          ? record.changeReasons
          : getJourneyChangeReasons(
              record.feedbackAnswers || {},
              record.previousState || {},
              record.nextState || {},
            );

      const round = currentJourneyRecords
        .slice(0, recordIndex + 1)
        .filter((item) => item.type === "feedback").length;

      let direction = "단계 유지";

      if (previousLevel !== null && currentLevel !== null) {
        if (currentLevel > previousLevel) {
          direction = "더 가볍게";
        }

        if (currentLevel < previousLevel) {
          direction = "더 촉촉하게";
        }
      }

      return {
        id: record.id || `summary-${recordIndex}`,

        round,

        previousLevel,
        currentLevel,

        direction,

        concernLabel,

        changedProductCount,

        reason: reasons[0] || "피드백을 반영해 루틴을 조정했어요.",
      };
    })
    .filter(Boolean);

  return {
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
  };
}
