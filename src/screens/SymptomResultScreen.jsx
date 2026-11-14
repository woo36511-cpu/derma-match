import React, { useLayoutEffect } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { BreakoutPatternGuide } from "../components/BreakoutPatternGuide";
import { hasBreakoutDetails } from "../data/symptomQuestions";
import { ProductReactionCheck } from "../components/ProductReactionCheck";
import { CarePrioritySummary } from "../components/CarePrioritySummary";
import { buildCarePriorities } from "../utils/carePriorities";
import { RecentProductCheck } from "../components/RecentProductCheck";
import { FirstVisitCarePlan } from "../components/FirstVisitCarePlan";
import { SymptomAssessmentCard } from "../components/SymptomAssessmentCard";
import { SYMPTOM_RULE_VERSION } from "../utils/symptomAssessment";
import { buildFirstVisitPlan } from "../utils/firstVisitCare";
import { SymptomCareSummary } from "../components/SelfCarePlan";

export function SymptomResultScreen({ check, setStep, onRecordConcern, currentRoutine, personalProductFeedback }) {
  const assessment = check.assessment;
  const guided = assessment?.guidedCare === true;
  useLayoutEffect(() => {
    if (guided) window.scrollTo(0, 0);
  }, [guided]);
  if (!assessment) return null;
  const plan = !check.historical || assessment.ruleVersion === SYMPTOM_RULE_VERSION ? buildFirstVisitPlan(assessment, currentRoutine, personalProductFeedback) : null;
  const showBreakoutGuide = guided && assessment.complete &&
    !["emergency", "urgent"].includes(assessment.urgency) && hasBreakoutDetails(assessment.answers);
  return <section className="max-w-3xl mx-auto space-y-6">
    {check.historical && <p className="rounded-2xl bg-amber-50 p-4 text-sm">지난번에 저장한 확인 결과예요. 지금 상태를 반영하려면 새로 재설문해주세요.</p>}
    {plan ? <>
      <FirstVisitCarePlan plan={plan} onEditAnswer={check.editGuidedAnswer} />
      <SymptomAssessmentCard assessment={assessment} hideObservations={showBreakoutGuide} />
    </> : assessment.guidedCare ? <SymptomAssessmentCard assessment={assessment} hideObservations={showBreakoutGuide} /> : <SymptomCareSummary assessment={assessment} />}
    {guided && !["emergency", "urgent", "clinic"].includes(assessment.urgency) && <RecentProductCheck answers={assessment.answers} />}
    {(!check.historical || assessment.ruleVersion === SYMPTOM_RULE_VERSION) && <CarePrioritySummary priorities={buildCarePriorities(assessment, plan)} />}
    {showBreakoutGuide && <BreakoutPatternGuide assessment={assessment} />}
    {plan?.pharmacy && <ProductReactionCheck key={plan.pharmacy.name} productName={plan.pharmacy.name} onRecheck={reaction =>
      check.begin("guidedCare", { concern: assessment.answers.concern, secondaryConcerns: assessment.answers.secondaryConcerns, product: plan.pharmacy.name, reaction })
    } />}
    <p className="text-sm text-slate-500">{check.saved ? "확인 기록을 저장했어요. 서버 저장 여부는 상단 저장·계정에서 확인하세요." : "현재 결과를 저장하지 못했어요. 화면의 안내는 그대로 확인할 수 있어요."}</p>
    {!check.saved && <button onClick={check.retrySave} className="underline text-sm">확인 기록 다시 저장</button>}
    <div className="flex flex-wrap gap-3">
      {!check.historical && !assessment.blockRoutine && !assessment.guidedCare && !check.returningToConcernCheck && <PrimaryButton onClick={check.continueFlow}>피부 관리 설문·기록 이어가기</PrimaryButton>}
      {!check.historical && onRecordConcern && !["emergency", "urgent"].includes(assessment.urgency) &&
        (check.returningToConcernCheck || (check.detailedRoutineFollowUp && assessment.blockRoutine)) &&
        <button type="button" onClick={onRecordConcern} className="rounded-2xl border border-slate-300 px-5 py-3">
          {check.returningToConcernCheck ? "고민 변화 기록으로 돌아가기" : "고민 변화만 기록하기"}
        </button>}
      <button onClick={() => check.begin(assessment.guidedCare ? "guidedCare" : "survey")} className="rounded-2xl border border-slate-300 px-5 py-3">현재 증상 새로 확인</button>
      <button onClick={() => setStep("start")} className="rounded-2xl border border-slate-300 px-5 py-3">시작 화면으로</button>
    </div>
  </section>;
}
