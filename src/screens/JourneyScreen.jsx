import { SectionTitle } from "../components/SectionTitle";
import { formatSavedAt } from "../utils/formatSavedAt";
import {
  compareFeedbackConditions,
  getJourneyChangeReasons,
} from "../utils/feedbackAnalysis";
import { skinConcernOptions } from "../data/skinIssueQuestions";
import { getProductById, getCategoryLabel } from "../utils/productCatalog";
import React from "react";

export function JourneyScreen({
  journeyOptions,
  viewedJourneyStartRecord,
  setViewJourneyId,
  previousJourneyStartRecord,
  previousJourneyEndLevel,
  previousJourneySkinType,
  firstJourneyLevel,
  currentJourneySkinType,
  latestJourneyLevel,
  feedbackCount,
  journeyTransitionMessage,
  previousJourneyConcern,
  currentJourneyStartConcern,
  activeJourneyRecords,
  latestJourneyConcern,
  journeyLevelChange,
  journeyRoundSummaries,
  setStep,
}) {
  return (
    <section>
      <SectionTitle
        title="내 피부 변화"
        desc="처음 진단부터 2주 피드백까지 피부 상태와 추천 루틴이 어떻게 바뀌었는지 확인할 수 있어요."
      />
      {journeyOptions.length > 1 && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-900">Skin Journey 기록</p>

            <p className="mt-1 text-sm text-gray-500">
              이전에 시작했던 피부 관리 기록을 다시 확인할 수 있어요.
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3">
            {journeyOptions.map((journey) => {
              const viewedId =
                viewedJourneyStartRecord?.journeyId ||
                viewedJourneyStartRecord?.id;

              const active = viewedId === journey.id;

              return (
                <button
                  key={journey.id}
                  type="button"
                  onClick={() => setViewJourneyId(journey.id)}
                  className={`min-w-[260px] text-left rounded-3xl border p-5 transition ${
                    active
                      ? "bg-slate-950 text-white border-slate-950 shadow-md"
                      : "bg-white text-gray-900 border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span
                      className={`text-xs font-bold ${
                        active ? "text-emerald-300" : "text-emerald-600"
                      }`}
                    >
                      Journey {journey.number}
                    </span>

                    {journey.isLatest && (
                      <span
                        className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                          active
                            ? "bg-white/10 text-white"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        현재
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs mb-2 ${
                      active ? "text-slate-400" : "text-gray-400"
                    }`}
                  >
                    {journey.source} · {formatSavedAt(journey.savedAt)}
                  </p>

                  <h3 className="text-lg font-black break-keep">
                    {journey.skinType}
                    {" · "}
                    {journey.currentLevel ?? "-"}
                    단계
                  </h3>

                  <p
                    className={`mt-3 text-sm ${
                      active ? "text-slate-300" : "text-gray-500"
                    }`}
                  >
                    {journey.checkCount}회 체크
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {previousJourneyStartRecord && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="rounded-[2rem] bg-white border border-emerald-100 shadow-sm p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-sm font-bold text-emerald-600 mb-2">
                장기 변화
              </p>

              <h3 className="text-xl sm:text-2xl font-black text-gray-900 break-keep">
                이전 Journey와 비교했어요
              </h3>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed break-keep">
                이전 관리 기록의 마지막 상태와 이번 관리 기록의 시작 상태를
                비교해요.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400 mb-2">
                  이전 Journey 마지막
                </p>

                <p className="text-xl font-black text-gray-800">
                  {previousJourneyEndLevel ?? "-"}단계
                </p>

                <p className="mt-2 text-xs text-gray-500 break-keep">
                  {previousJourneySkinType}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600 mb-2">
                  이번 Journey 시작
                </p>

                <p className="text-xl font-black text-emerald-800">
                  {firstJourneyLevel ?? "-"}단계
                </p>

                <p className="mt-2 text-xs text-emerald-700 break-keep">
                  {currentJourneySkinType}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-xs text-slate-400 mb-2">이번 Journey 현재</p>

                <p className="text-xl font-black text-emerald-300">
                  {latestJourneyLevel ?? "-"}단계
                </p>

                <p className="mt-2 text-xs text-slate-300">
                  {feedbackCount}회 체크
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4 mb-3">
              <p className="text-xs text-gray-400 mb-2">루틴 방향 변화</p>

              <p className="text-sm font-bold text-gray-800 leading-relaxed break-keep">
                {journeyTransitionMessage}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400 mb-1">
                  이전 Journey 마지막 고민
                </p>

                <p className="text-sm font-bold text-gray-800 break-keep">
                  {previousJourneyConcern}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600 mb-1">
                  이번 Journey 시작 고민
                </p>

                <p className="text-sm font-bold text-emerald-800 break-keep">
                  {currentJourneyStartConcern}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeJourneyRecords.length > 0 && (
        <div className="mb-8 rounded-[2rem] bg-slate-950 text-white p-6 sm:p-8 shadow-lg">
          <p className="text-sm text-slate-400 mb-2">Skin Journey</p>

          <h3 className="text-2xl sm:text-3xl font-black mb-6">
            처음과 지금을 비교했어요
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-400 mb-1">처음 단계</p>

              <p className="text-xl font-bold">
                {firstJourneyLevel ?? "-"}단계
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-400 mb-1">현재 단계</p>

              <p className="text-xl font-bold text-emerald-300">
                {latestJourneyLevel ?? "-"}단계
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-400 mb-1">현재 고민</p>

              <p className="text-sm font-bold break-keep">
                {latestJourneyConcern}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-slate-400 mb-1">체크 횟수</p>

              <p className="text-xl font-bold">{feedbackCount}회</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-400 mb-2">변화 요약</p>

            <p className="text-sm sm:text-base font-semibold leading-relaxed break-keep">
              {journeyLevelChange === 0
                ? "처음과 현재의 수분감 단계가 같아요. 현재 루틴의 밸런스를 조금 더 지켜볼 수 있어요."
                : journeyLevelChange > 0
                  ? `처음보다 ${journeyLevelChange}단계 가벼운 루틴 쪽으로 조정됐어요.`
                  : `처음보다 ${Math.abs(
                      journeyLevelChange,
                    )}단계 촉촉한 루틴 쪽으로 조정됐어요.`}
            </p>
          </div>
        </div>
      )}
      {journeyRoundSummaries.length > 0 && (
        <div className="max-w-4xl mx-auto mb-10">
          <div className="mb-5">
            <p className="text-sm font-bold text-emerald-600 mb-2">변화 기록</p>

            <h3 className="text-2xl font-black text-gray-900">
              회차별로 어떻게 달라졌을까요?
            </h3>

            <p className="mt-2 text-sm text-gray-500 leading-relaxed break-keep">
              각 체크에서 피부 반응과 추천 루틴이 어떻게 바뀌었는지 간단하게
              정리했어요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...journeyRoundSummaries].reverse().map((summary) => (
              <div
                key={summary.id}
                className="rounded-[1.7rem] bg-white border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">
                    {summary.round}차 체크
                  </span>

                  <span className="text-xs font-bold text-gray-400">
                    {summary.direction}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 rounded-2xl bg-gray-50 p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">이전</p>

                    <p className="text-xl font-black text-gray-700">
                      {summary.previousLevel ?? "-"}
                      단계
                    </p>
                  </div>

                  <span className="font-bold text-gray-400">→</span>

                  <div className="flex-1 rounded-2xl bg-emerald-50 p-4 text-center">
                    <p className="text-xs text-emerald-600 mb-1">조정 후</p>

                    <p className="text-xl font-black text-emerald-800">
                      {summary.currentLevel ?? "-"}
                      단계
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-400 mb-1">주요 고민</p>

                    <p className="text-sm font-bold text-gray-800 break-keep">
                      {summary.concernLabel}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-400 mb-1">제품 변화</p>

                    <p className="text-sm font-bold text-gray-800">
                      {summary.changedProductCount}개 변경
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-400 mb-2">핵심 변화 이유</p>

                  <p className="text-sm text-gray-700 leading-relaxed break-keep">
                    {summary.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        {activeJourneyRecords.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-lg font-bold mb-2">아직 피부 기록이 없어요</p>

            <p className="text-sm text-gray-500 leading-relaxed">
              설문을 완료하면 첫 피부 기록이 여기에 저장돼요.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {[...activeJourneyRecords].reverse().map((item, index) => {
              const isSurvey = item.type === "initial_survey";

              const originalIndex = activeJourneyRecords.length - 1 - index;

              const feedbackRound = isSurvey
                ? 0
                : activeJourneyRecords
                    .slice(0, originalIndex + 1)
                    .filter((record) => record.type === "feedback").length;

              const previousFeedbackRecord = !isSurvey
                ? activeJourneyRecords
                    .slice(0, originalIndex)
                    .reverse()
                    .find((record) => record.type === "feedback") || null
                : null;

              const conditionChanges = !isSurvey
                ? compareFeedbackConditions(
                    item.feedbackAnswers || {},
                    previousFeedbackRecord?.feedbackAnswers || null,
                  )
                : [];
              const level = isSurvey
                ? item.result?.hydrationLevel
                : item.nextState?.hydrationLevel;

              const concernId = isSurvey
                ? item.mainConcern
                : item.nextState?.mainConcern;

              const concernLabel =
                skinConcernOptions.find((concern) => concern.id === concernId)
                  ?.label || "기본 관리";

              const routineEntries = Object.entries(item.routine || {});
              const changeReasons =
                item.changeReasons?.length > 0
                  ? item.changeReasons
                  : getJourneyChangeReasons(
                      item.feedbackAnswers || {},
                      item.previousState || {},
                      item.nextState || {},
                    );
              const previousRecord =
                originalIndex > 0
                  ? activeJourneyRecords[originalIndex - 1]
                  : null;

              const previousRoutine = previousRecord?.routine || {};

              const routineChanges = Object.entries(item.routine || {})
                .map(([category, currentProductId]) => {
                  const previousProductId = previousRoutine[category] ?? null;

                  return {
                    category,
                    previousProduct: getProductById(previousProductId),
                    currentProduct: getProductById(currentProductId),
                    changed: previousProductId !== currentProductId,
                  };
                })
                .filter((item) => item.previousProduct || item.currentProduct);

              const changedRoutineCount = routineChanges.filter(
                (item) => item.changed,
              ).length;
              return (
                <div
                  key={item.id || index}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold mb-3 ${
                          isSurvey
                            ? "bg-black text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {isSurvey ? "첫 피부 진단" : `${feedbackRound}차 체크`}
                      </span>

                      <h3 className="text-xl font-black">
                        수분감 {level ?? "-"}단계
                      </h3>
                    </div>

                    <p className="text-xs text-gray-400">
                      {formatSavedAt(item.savedAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-400 mb-1">주요 고민</p>

                      <p className="text-sm font-bold">{concernLabel}</p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-400 mb-1">기록 종류</p>

                      <p className="text-sm font-bold">
                        {isSurvey
                          ? "초기 분석"
                          : `${feedbackRound}차 루틴 재조정`}
                      </p>
                    </div>
                  </div>

                  {routineEntries.length > 0 && (
                    <div>
                      <p className="text-sm font-bold mb-3">추천 루틴</p>

                      <div className="space-y-2">
                        {routineEntries.map(([category, productId]) => {
                          const product = getProductById(productId);

                          if (!product) {
                            return null;
                          }

                          return (
                            <div
                              key={category}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 px-4 py-3"
                            >
                              <span className="text-xs text-gray-400">
                                {getCategoryLabel(category)}
                              </span>

                              <span className="text-sm font-semibold text-right">
                                {product.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isSurvey && (
                    <div className="mt-5 space-y-3">
                      {/* 단계 변화 */}
                      <div className="rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs text-emerald-600 mb-1">
                          단계 변화
                        </p>

                        <p className="text-sm font-bold text-emerald-900">
                          {item.previousState?.hydrationLevel ?? "-"}
                          단계
                          {" → "}
                          {item.nextState?.hydrationLevel ?? "-"}
                          단계
                        </p>
                      </div>

                      {/* 변화 이유 */}
                      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs text-gray-400 mb-3">
                          왜 이렇게 바뀌었나요?
                        </p>

                        <div className="space-y-2">
                          {changeReasons.map((reason) => (
                            <p
                              key={reason}
                              className="text-sm text-gray-700 leading-relaxed break-keep"
                            >
                              · {reason}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* 피부 고민 변화 */}
                      <div className="rounded-2xl bg-white border border-gray-200 p-4">
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-1">
                            피부 반응 변화
                          </p>

                          <p className="text-sm font-bold text-gray-900">
                            이전 체크와 비교했어요
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {conditionChanges.map((condition) => {
                            const statusClass =
                              condition.status === "개선"
                                ? "bg-emerald-100 text-emerald-700"
                                : condition.status === "악화"
                                  ? "bg-rose-100 text-rose-700"
                                  : condition.status === "유지"
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-blue-100 text-blue-700";

                            return (
                              <div
                                key={condition.id}
                                className="rounded-2xl bg-gray-50 p-4"
                              >
                                <div className="flex items-center justify-between gap-3 mb-2">
                                  <p className="text-sm font-bold text-gray-800">
                                    {condition.label}
                                  </p>

                                  <span
                                    className={`text-xs font-bold px-2 py-1 rounded-full ${statusClass}`}
                                  >
                                    {condition.status}
                                  </span>
                                </div>

                                <p className="text-xs text-gray-500">
                                  현재 상태 · {condition.stateLabel}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {!previousFeedbackRecord && (
                          <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                            첫 체크는 비교할 이전 기록이 없어 현재 상태만
                            표시해요.
                          </p>
                        )}
                      </div>
                      {/* 제품 변화 */}
                      {previousRecord && (
                        <div className="rounded-2xl bg-white border border-gray-200 p-4">
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">
                                루틴 변경
                              </p>

                              <p className="text-sm font-bold text-gray-900">
                                이번 체크에서 바뀐 제품
                              </p>
                            </div>

                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                              {changedRoutineCount}개 변경
                            </span>
                          </div>

                          <div className="space-y-3">
                            {routineChanges.map((change) => (
                              <div
                                key={change.category}
                                className="rounded-2xl bg-gray-50 p-4"
                              >
                                <div className="flex items-center justify-between gap-3 mb-2">
                                  <p className="text-xs font-bold text-gray-500">
                                    {getCategoryLabel(change.category)}
                                  </p>

                                  <span
                                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                                      change.changed
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-emerald-100 text-emerald-700"
                                    }`}
                                  >
                                    {change.changed ? "변경" : "유지"}
                                  </span>
                                </div>

                                {change.changed ? (
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-500 line-through">
                                      {change.previousProduct?.name ||
                                        "이전 제품 없음"}
                                    </p>

                                    <p className="text-sm font-bold text-gray-900">
                                      ↓
                                    </p>

                                    <p className="text-sm font-bold text-gray-900">
                                      {change.currentProduct?.name ||
                                        "추천 제품 없음"}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm font-semibold text-gray-700">
                                    {change.currentProduct?.name ||
                                      change.previousProduct?.name ||
                                      "제품 정보 없음"}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setStep("start")}
            className="px-6 py-3 rounded-2xl text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            시작 화면으로 돌아가기
          </button>
        </div>
      </div>
    </section>
  );
}
