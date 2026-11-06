import { SurveyResultOverview } from "../components/SurveyResultOverview";
import { SkinIssueGuideCard } from "../components/SkinIssueGuideCard";
import { SectionTitle } from "../components/SectionTitle";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";
import { RoutineSafetyNotice } from "../components/RoutineSafetyNotice";
import { SymptomCareSummary } from "../components/SelfCarePlan";

export function SurveyResultScreen({
  safety, symptomAssessment, onSymptomRecheck,
  finalSkinProfile,
  activeIssueGuide,
  surveyRoutine,
  surveyUserContext,
  surveyResult,
  setSurveyAnswers,
  setSurveyIndex,
  setStep,
  startSavedFeedback,
}) {
  if (safety?.blocked) return <section className="max-w-3xl mx-auto space-y-6">
    <SymptomCareSummary assessment={symptomAssessment} />
    {activeIssueGuide && !["emergency", "urgent"].includes(symptomAssessment?.urgency) && <SkinIssueGuideCard guide={{ ...activeIssueGuide, pharmacyGuide: null }} />}
    <RoutineSafetyNotice safety={safety} onRecheck={onSymptomRecheck} />
    <button onClick={() => setStep("start")} className="underline text-sm">시작 화면으로</button>
  </section>;
  return (
    <section className="space-y-10">
      <div className="max-w-3xl mx-auto space-y-5"><SymptomCareSummary assessment={symptomAssessment} /></div>
      <SurveyResultOverview result={finalSkinProfile} />

      {activeIssueGuide?.careLevel === "basic_care" && <SkinIssueGuideCard guide={activeIssueGuide} />}
      <div className="mb-10">
        <SectionTitle
          title="추천 루틴"
          desc="필요한 카테고리의 후보를 확인하세요. 기존 제품이 편안하면 바꿀 필요는 없고, 토너·세럼은 필수가 아니에요. 새 제품은 하나씩 확인하세요."
        />

        <RoutineProductScroller
          productsByCategory={surveyRoutine.products}
          userContext={surveyUserContext}
        />
      </div>

      {!activeIssueGuide && (
        <div className="max-w-3xl mx-auto mb-8">
          <SectionTitle
            title="피부 고민 관리 방향"
            desc="선택한 피부 고민에 맞춘 기본 관리 가이드입니다."
          />

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <ul className="space-y-2">
              {surveyResult.solution.map((text) => (
                <li
                  key={text}
                  className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
                >
                  · {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {surveyResult.lifestyleAdvice.length > 0 && (
        <div className="max-w-3xl mx-auto mb-8">
          <SectionTitle
            title="생활습관 체크"
            desc="피부 컨디션에 영향을 줄 수 있는 생활 요소입니다."
          />

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <ul className="space-y-2">
              {surveyResult.lifestyleAdvice.map((text) => (
                <li
                  key={text}
                  className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
                >
                  · {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto mb-8">
        <details className="bg-amber-50 rounded-3xl p-5 sm:p-6 border border-amber-100">
          <summary className="cursor-pointer text-sm font-semibold text-amber-800">
            관리 중 확인할 주의사항
          </summary>

          <ul className="space-y-1 mt-3">
            <li className="text-sm text-amber-800 leading-relaxed break-keep">
              · 붉고 아픈 트러블이 반복될 때
            </li>
            <li className="text-sm text-amber-800 leading-relaxed break-keep">
              · 고름, 결절, 흉터가 생길 때
            </li>
            <li className="text-sm text-amber-800 leading-relaxed break-keep">
              · 따가움, 진물, 심한 각질이 동반될 때
            </li>
            <li className="text-sm text-amber-800 leading-relaxed break-keep">
              · 6~8주 이상 관리해도 변화가 없을 때
            </li>
          </ul>
        </details>
      </div>

      <p className="text-center text-sm text-slate-600">2주 체크는 자극·악화·사용 상태를 확인해요. 악화하면 기다리지 말고 증상을 다시 확인하세요.</p>
      <button onClick={onSymptomRecheck} className="block mx-auto underline text-sm mt-4">증상 변화·악화 재설문</button>
      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => {
            setSurveyAnswers({});
            setSurveyIndex(0);
            setStep("survey");
          }}
          className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          설문 다시 하기
        </button>

        <PrimaryButton onClick={startSavedFeedback}>
          2주 사용 후 피드백 입력
        </PrimaryButton>
      </div>
    </section>
  );
}
