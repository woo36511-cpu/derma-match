import { formatSavedAt } from "../utils/formatSavedAt";
import { PrimaryButton } from "../components/PrimaryButton";
import { SeoContentSection } from "../components/SeoContentSection";
import React from "react";

export function StartScreen({
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
}) {
  return (
    <section className="min-h-[75vh] flex flex-col items-center justify-center text-center">
      <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm text-gray-600 mb-6 shadow-sm break-keep">
        피부 상태에 맞춰 시작 방식을 선택하세요
      </div>

      <h2 className="text-4xl sm:text-6xl font-bold leading-tight break-keep mb-5">
        피부를 잘 몰라도
        <br />
        괜찮아요
      </h2>

      <p className="text-sm sm:text-lg text-gray-600 max-w-2xl leading-relaxed break-keep mb-10">
        몇 가지 질문으로 현재 피부 상태를 파악하고,
        <br className="hidden sm:block" />
        맞는 루틴과 사용법을 함께 안내해드릴게요.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl w-full">
        <button
          onClick={() => {
            setActiveJourneyId(null);
            setStep("quickRecommend");
          }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 text-left hover:shadow-lg hover:-translate-y-1 transition active:scale-[0.98]"
        >
          <p className="text-sm text-gray-400 mb-3">이미 알고 있어요</p>
          <h3 className="text-2xl font-bold mb-3 break-keep">
            피부타입 알고 있어요
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep mb-5">
            건성, 수부지, 지성처럼 내 피부타입을 알고 있다면 바로 맞는 루틴을
            추천받을 수 있어요.
          </p>
          <span className="text-sm font-semibold text-black">
            바로 추천받기 →
          </span>
        </button>

        <button
          onClick={() => {
            setActiveJourneyId(null);
            setStep("survey");
          }}
          className="bg-black text-white rounded-3xl shadow-sm p-6 sm:p-8 text-left hover:opacity-90 hover:-translate-y-1 transition active:scale-[0.98]"
        >
          <p className="text-sm text-white/60 mb-3">처음 시작해요</p>
          <h3 className="text-2xl font-bold mb-3 break-keep">
            처음이라 설문으로 시작할래요
          </h3>
          <p className="text-sm sm:text-base text-white/75 leading-relaxed break-keep mb-5">
            피부타입을 몰라도 괜찮아요. 몇 가지 질문에 답하면 현재 상태에 맞는
            루틴과 관리 방향을 추천해드려요.
          </p>
          <span className="text-sm font-semibold text-white">
            설문 시작하기 →
          </span>
        </button>
      </div>
      {isQuickJourney && (
        <div className="mt-6 max-w-4xl w-full bg-white border border-emerald-100 rounded-3xl shadow-sm p-5 sm:p-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-emerald-600 mb-2">
                진행 중인 Skin Journey
              </p>

              <h3 className="text-xl font-black text-gray-900 mb-2 break-keep">
                {quickJourneySkinType} · 수분감{" "}
                {quickJourneyCurrentLevel ?? "-"}단계
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed break-keep">
                빠른 추천으로 시작한 루틴을 계속 추적하고 있어요. 지금까지{" "}
                {feedbackCount}번 체크했어요.
              </p>

              <p className="mt-2 text-xs text-gray-400">
                최근 기록 · {formatSavedAt(latestJourneyRecord?.savedAt)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
              <PrimaryButton onClick={resumeQuickJourneyFeedback}>
                {feedbackCount === 0
                  ? "첫 체크하기"
                  : `${feedbackCount + 1}차 체크하기`}
              </PrimaryButton>

              <button
                onClick={() => setStep("journey")}
                className="px-5 py-3 rounded-2xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition"
              >
                변화 기록 보기
              </button>
            </div>
          </div>
        </div>
      )}
      {hasSavedSurvey && !isQuickJourney && (
        <div className="mt-6 max-w-4xl w-full bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">
                최근 저장된 설문 결과 · {formatSavedAt(savedSurvey?.savedAt)}
              </p>

              <h3 className="text-xl font-bold mb-2 break-keep">
                {savedSurveyResult.skinType} · 수분감{" "}
                {savedSurveyResult.hydrationLevel}단계
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed break-keep">
                이전에 추천받은 루틴을 다시 확인하거나, 2주 사용 후 피부 반응을
                체크할 수 있어요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
              <button
                onClick={openSavedSurveyResult}
                className="px-5 py-3 rounded-2xl text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
              >
                최근 결과 다시 보기
              </button>

              <PrimaryButton onClick={startSavedFeedback}>
                2주 후 체크하기
              </PrimaryButton>
              <button
                onClick={() => setStep("journey")}
                className="px-5 py-3 rounded-2xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition"
              >
                내 피부 변화 보기
              </button>
            </div>
          </div>
        </div>
      )}
      <SeoContentSection />
    </section>
  );
}
