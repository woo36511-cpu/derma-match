import { SurveyResultOverview } from "../components/SurveyResultOverview";
import { SkinIssueGuideCard } from "../components/SkinIssueGuideCard";
import { SectionTitle } from "../components/SectionTitle";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function SurveyResultScreen({
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
  return (
    <section className="space-y-10">
      <SurveyResultOverview result={finalSkinProfile} />

      {activeIssueGuide && <SkinIssueGuideCard guide={activeIssueGuide} />}
      <div className="mb-10">
        <SectionTitle
          title="추천 루틴"
          desc="설문 결과에 맞춰 클렌저, 토너, 세럼, 크림을 하나씩 추천합니다."
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
        <div className="bg-amber-50 rounded-3xl p-5 sm:p-6 border border-amber-100">
          <p className="text-sm font-semibold text-amber-800 mb-3">
            피부과 상담이 필요한 경우
          </p>

          <ul className="space-y-1">
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
        </div>
      </div>

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
