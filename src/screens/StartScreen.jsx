import { formatSavedAt } from "../utils/formatSavedAt";
import { PrimaryButton } from "../components/PrimaryButton";
import { DetailDisclosure } from "../components/DetailDisclosure";
import { SeoContentSection } from "../components/SeoContentSection";
import React from "react";

const examplePlan = [
  { number: "01", title: "먼저 해결할 문제", detail: "뾰루지와 함께 피부가 따갑다면, 자극을 줄이는 관리부터 안내해요." },
  { number: "02", title: "오늘 함께 할 관리", detail: "잘 맞던 세안·보습은 이어가고, 자국에는 자외선 차단을 챙겨요." },
  { number: "03", title: "나중에 추가할 관리", detail: "새 여드름약이나 각질 제품은 따가움이 잦아든 뒤에 살펴봐요." },
];

export function StartScreen({
  startCheckedFlow, startSymptomRecheck, symptomCheck,
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
    <div className="space-y-7">
      <section aria-labelledby="start-title" className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50/60 px-5 py-8 sm:p-10 lg:p-12">
        <div className="grid items-center gap-8 md:grid-cols-[1.15fr_1fr] lg:gap-10">
          <div>
            <p className="mb-4 text-xs font-bold tracking-wide text-emerald-800 sm:text-sm">얼굴 피부 고민별 관리 가이드</p>
            <h1 id="start-title" className="break-keep text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-4xl lg:text-5xl">
              얼굴 피부 고민,<br />무엇부터 해결할까요?
            </h1>
            <p className="mt-4 max-w-lg break-keep text-sm leading-relaxed text-slate-700 sm:text-base">
              여드름, 따가움, 갈색 자국처럼 지금 신경 쓰이는 것부터 골라보세요.
              피부 상태와 이미 쓰는 제품을 살펴, 오늘 시작할 관리와 함께 해도 되는 관리를 알려드려요.
            </p>
            <div className="mt-6">
              <button type="button" onClick={() => {
                setActiveJourneyId(null);
                startCheckedFlow("guidedCare");
              }} className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800 sm:w-auto sm:text-base">
                내 피부 관리 순서 찾기 <span aria-hidden="true">→</span>
              </button>
              <p className="mt-3 text-xs text-slate-600 sm:text-sm">피부타입이나 트러블의 이름을 몰라도 시작할 수 있어요.</p>
            </div>
          </div>
          <aside aria-labelledby="example-plan" className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold text-emerald-800">결과 화면 예시</p>
            <h2 id="example-plan" className="mt-1 break-keep text-lg font-bold text-slate-950 sm:text-xl">뾰루지와 따가움, 자국이 함께 있다면</h2>
            <ol className="mt-4 divide-y divide-slate-100">
              {examplePlan.map(({ number, title, detail }) => (
                <li key={title} className="flex gap-3 py-3 last:pb-0">
                  <span aria-hidden="true" className="h-fit rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-900">{number}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-950">{title}</h3>
                    <p className="mt-1 break-keep text-sm leading-relaxed text-slate-600">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-sm text-slate-700">
        <button type="button" onClick={startSymptomRecheck} className="min-h-10 font-medium underline underline-offset-4">증상 변화·악화 재설문</button>
        {symptomCheck.latestRecord && <button type="button" onClick={symptomCheck.openLatest} className="min-h-10 font-medium underline underline-offset-4">지난 증상 확인 기록</button>}
      </div>

      <DetailDisclosure title="피부타입별 추천·전체 설문 보기">
        <p className="mb-3 text-sm text-slate-600">현재 고민 확인 외에 피부타입이나 기본 화장품 루틴을 살펴볼 수 있어요.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => {
            setActiveJourneyId(null);
            startCheckedFlow("quickRecommend");
          }} className="rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50">
            <span className="block font-bold text-slate-950">피부타입 알고 있어요</span>
            <span className="mt-1 block text-sm text-slate-600">알고 있는 피부타입으로 기본 루틴 살펴보기</span>
          </button>
          <button type="button" onClick={() => {
            setActiveJourneyId(null);
            startCheckedFlow("survey");
          }} className="rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50">
            <span className="block font-bold text-slate-950">처음이라 설문으로 시작할래요</span>
            <span className="mt-1 block text-sm text-slate-600">세안 뒤 당김과 번들거림을 확인해 기본 루틴 찾기</span>
          </button>
        </div>
      </DetailDisclosure>

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
                이전에 추천받은 루틴을 다시 확인하거나, 사용 후 피부 반응을
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
    </div>
  );
}
