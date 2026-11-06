import { SurveyResultOverview } from "../components/SurveyResultOverview";
import { SkinIssueGuideCard } from "../components/SkinIssueGuideCard";
import { SectionTitle } from "../components/SectionTitle";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";
import { DetailDisclosure } from "../components/DetailDisclosure";
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

      <div className="max-w-3xl mx-auto space-y-3">
        {!activeIssueGuide && surveyResult.solution.length > 0 && (
          <DetailDisclosure title="피부 고민별 관리 설명">
            <ul className="list-disc pl-5 space-y-2">
              {surveyResult.solution.map(text => <li key={text}>{text}</li>)}
            </ul>
          </DetailDisclosure>
        )}
        {surveyResult.lifestyleAdvice.length > 0 && (
          <DetailDisclosure title="내 답변에 맞춘 생활습관 참고">
            <ul className="list-disc pl-5 space-y-2">
              {surveyResult.lifestyleAdvice.map(text => <li key={text}>{text}</li>)}
            </ul>
          </DetailDisclosure>
        )}
        <DetailDisclosure title="관리 중 확인할 주의사항">
          <ul className="list-disc pl-5 space-y-1 text-amber-800">
            <li>붉고 아픈 트러블이 반복될 때</li>
            <li>고름, 결절, 흉터가 생길 때</li>
            <li>따가움, 진물, 심한 각질이 동반될 때</li>
            <li>6~8주 이상 관리해도 변화가 없을 때</li>
          </ul>
        </DetailDisclosure>
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
