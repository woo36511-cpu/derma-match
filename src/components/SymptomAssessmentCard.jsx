import React from "react";
import { symptomSources } from "../utils/symptomAssessment";

export function SymptomAssessmentCard({ assessment }) {
  if (!assessment) return null;
  const urgent = ["emergency", "urgent"].includes(assessment.urgency);
  return <section className={`rounded-3xl border p-5 sm:p-7 text-left ${urgent ? "bg-rose-50 border-rose-300" : "bg-slate-50 border-slate-200"}`} aria-label="증상 확인 결과">
    <p className="text-xs font-semibold text-slate-500 mb-2">증상 기반 관리 경로 · 확진 결과가 아니에요</p>
    <h2 className="text-xl sm:text-2xl font-bold">{assessment.title}</h2>
    <p className="mt-4 text-base font-semibold" role={urgent ? "alert" : undefined}>{assessment.nextAction}</p>
    {!urgent && <>
      {assessment.candidates.length > 0 && <div className="space-y-4 mt-6">
        <h3 className="font-bold">함께 확인할 가능성과 답변 근거</h3>
        <p className="text-sm text-slate-600">아래 순서는 확률 순위가 아니에요. 여러 원인이 함께 있을 수 있어요.</p>
        {assessment.candidates.map(candidate => <div key={candidate.key} className="rounded-2xl bg-white border border-slate-200 p-4">
          <h4 className="font-bold">{candidate.label}</h4>
          <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">{candidate.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
          <p className="mt-3 text-sm text-slate-500">{candidate.limitation}</p>
        </div>)}
      </div>}
      <p className="mt-5 text-sm text-slate-700">{assessment.reviewTiming}</p>
      <p className="mt-3 text-sm text-slate-600">약국에서는 이 답변과 함께 사용 중인 약의 이름·기간·반응을 보여주세요. 나이, 임신·수유 여부, 알레르기와 다른 치료를 확인한 뒤 일반의약품 적합성을 상담하세요.</p>
      <p className="mt-3 text-xs text-slate-500">효과가 없거나 좋아졌다는 사실만으로 원인균을 판단하지 않아요. 이 설문 규칙의 진단 정확도는 임상적으로 검증되지 않았어요.</p>
      <p className="mt-3 text-sm text-slate-600">정확한 구별은 피부과 진찰로 확인하는 것이 가장 확실한 출발점이에요. 의료진이 필요할 때 현미경·배양·조직검사를 선택하며, 모든 경우에 조직검사가 필요한 것은 아니에요.</p>
      <details className="mt-4 text-sm"><summary className="cursor-pointer">판단에 참고한 의료자료</summary><ul className="mt-3 space-y-2">{symptomSources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">{source.label} ↗</a></li>)}</ul></details>
    </>}
  </section>;
}
