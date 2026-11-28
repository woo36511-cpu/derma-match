import { BasicRoutineResume } from "../components/BasicRoutineResume";
import { formatSavedAt } from "../utils/formatSavedAt";
import { PrimaryButton } from "../components/PrimaryButton";
import { HomeQuickBrowse } from "../components/HomeQuickBrowse";
import { SeoContentSection } from "../components/SeoContentSection";
import React from "react";

function CareIllustration() {
  return (
    <div aria-hidden="true" className="relative hidden min-h-80 overflow-hidden rounded-2xl bg-forest-100 md:block">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 368" fill="none" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="care-art-ground" x1="350" x2="46" y1="20" y2="305" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EEF0E5" /><stop offset="1" stopColor="#B4C8B4" />
          </linearGradient>
          <linearGradient id="care-art-drop" x1="136" x2="245" y1="64" y2="233" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FAF8F3" stopOpacity=".97" /><stop offset=".51" stopColor="#DEEADB" stopOpacity=".5" />
            <stop offset="1" stopColor="#6F997E" stopOpacity=".9" />
          </linearGradient>
        </defs>
        <path fill="url(#care-art-ground)" d="M0 0h400v368H0z" />
        <ellipse cx="200" cy="242" rx="155" ry="43" stroke="#285A46" strokeOpacity=".25" />
        <ellipse cx="200" cy="242" rx="125" ry="33" stroke="#285A46" strokeOpacity=".35" />
        <ellipse cx="200" cy="242" rx="93" ry="23" stroke="#285A46" strokeOpacity=".48" />
        <ellipse cx="200" cy="242" rx="57" ry="13" stroke="#285A46" strokeOpacity=".6" />
        <circle cx="200" cy="146" r="112" stroke="#FAF8F3" strokeOpacity=".75" />
        <circle cx="200" cy="146" r="132" stroke="#FAF8F3" strokeOpacity=".55" strokeDasharray="1 5" />
        <path d="M200 57c-20 35-66 88-66 122a66 66 0 1 0 132 0c0-34-46-87-66-122Z" fill="url(#care-art-drop)" stroke="#FAF8F3" strokeWidth="1.5" />
        <path d="M198 79c-20 34-51 74-51 99 0 19 8 30 14 35" stroke="#FAF8F3" strokeOpacity=".9" strokeWidth="2" strokeLinecap="round" />
        <path d="M296 67v18m-9-9h18M105 224v12m-6-6h12" stroke="#285A46" strokeOpacity=".7" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-x-5 bottom-4 flex items-end justify-between border-t border-forest-700/25 pt-2 text-forest-900">
        <span className="font-serif text-lg tracking-tight">The Daily Ritual</span>
        <span className="text-[10px] font-bold tracking-[0.18em]">DEARSINCE · 01</span>
      </div>
    </div>
  );
}

export function StartScreen({
  startSimpleSkinCare, startCheckedFlow, startSymptomRecheck, symptomCheck,
  setQuickLevel,
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
  onQuickConcernCheck,
  onMoisturizerCheck,
  routineReview,
  basicTrial,
}) {
  return (
    <div className="space-y-7">
      {basicTrial && <BasicRoutineResume store={basicTrial} onOpen={() => setStep("basicRoutineTrial")} />}
      {hasSavedSurvey && !isQuickJourney && (
        <section aria-label="최근 저장된 설문 결과" className="care-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="care-kicker mb-2">
                설문 루틴 이어하기 · {formatSavedAt(savedSurvey?.savedAt)}
              </p>

              <h2 className="text-xl font-bold mb-2 break-keep">
                {savedSurveyResult.skinType} · 수분감{" "}
                {savedSurveyResult.hydrationLevel == null ? "성향 확인 전" : `${savedSurveyResult.hydrationLevel}단계`}
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed break-keep">
                이전에 추천받은 루틴을 다시 확인하거나, 사용 후 피부 반응을
                체크할 수 있어요.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:shrink-0">
              <button
                onClick={openSavedSurveyResult}
                className="care-secondary px-2 sm:px-5"
              >
                최근 결과 다시 보기
              </button>

              <PrimaryButton onClick={startSavedFeedback}>
                재검사
              </PrimaryButton>
              {onQuickConcernCheck && <button type="button" onClick={onQuickConcernCheck}
                className="care-secondary px-2 sm:px-5">
                고민만 빠르게 체크하기
              </button>}
              <button
                onClick={() => setStep("journey")}
                className="care-secondary px-2 sm:px-5"
              >
                내 피부 변화 보기
              </button>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="start-title" className="rounded-[1.75rem] border border-line bg-[#F4F0E6] p-6 sm:p-8 lg:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1.12fr_1fr] lg:gap-10">
          <div>
            <p className="care-kicker mb-4 flex items-center gap-2"><span aria-hidden="true" className="h-px w-5 bg-forest-700" /> 내 피부에 맞는 관리</p>
            <h1 id="start-title" className="text-[clamp(1.85rem,6vw,3rem)] font-bold leading-[1.22] tracking-[-0.045em] text-forest-900 md:text-[clamp(2rem,4.4vw,3.25rem)]">
              내 피부에 맞는 제품 찾기
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-700 sm:text-base">
              지금 쓰는 화장품과 피부 상태를 보고, 그대로 쓸 제품과 오늘 먼저 할 관리를 알려드려요.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => {
                setActiveJourneyId(null);
                startSimpleSkinCare();
              }} className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-forest-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest-700 sm:w-auto sm:text-base">
                설문조사로 시작 <span aria-hidden="true">→</span>
              </button>
              <button type="button" onClick={() => setStep("basicRoutineTrial")} className="care-secondary w-full sm:w-auto">
                모든 게 귀찮은 분들을 위해
              </button>
            </div>
          </div>
          <CareIllustration />
        </div>
      </section>

      <HomeQuickBrowse routineReview={routineReview} onStartSurvey={startSimpleSkinCare} onStartRoutine={level => {
        setQuickLevel(level); setActiveJourneyId(null); startCheckedFlow("quickRecommend");
      }} />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-sm text-slate-700">
        <button type="button" onClick={() => { setActiveJourneyId(null); startCheckedFlow("guidedCare"); }} className="min-h-10 font-medium underline underline-offset-4">증상부터 자세히 확인하기</button>
        <button type="button" onClick={startSymptomRecheck} className="min-h-10 font-medium underline underline-offset-4">증상 변화·악화 재설문</button>
        {symptomCheck.latestRecord && <button type="button" onClick={symptomCheck.openLatest} className="min-h-10 font-medium underline underline-offset-4">지난 증상 확인 기록</button>}
        {onQuickConcernCheck && !isQuickJourney && <button type="button" onClick={onQuickConcernCheck} className="min-h-10 font-medium underline underline-offset-4">고민 변화 바로 기록</button>}
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
      {onMoisturizerCheck && <div className="text-sm text-slate-700">
        <button type="button" onClick={onMoisturizerCheck} className="font-semibold text-emerald-900 underline underline-offset-4">다음 화장품 고르기</button>
        <p className="mt-1">지금 쓰는 제품이 어땠는지 남기거나, 피부에 맞는 제품을 다시 찾아요.</p>
      </div>}
      <SeoContentSection />
    </div>
  );
}
