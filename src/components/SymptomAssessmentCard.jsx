import React from "react";

export function SymptomAssessmentCard({ assessment }) {
  if (!assessment) return null;
  const urgent = ["emergency", "urgent"].includes(assessment.urgency);
  const observations = [...new Set((assessment.candidates ?? []).flatMap(candidate => candidate.reasons ?? []))];
  if (!assessment.blockRoutine && observations.length === 0) return null;
  return <section className={`rounded-3xl border p-5 sm:p-7 text-left ${urgent ? "bg-rose-50 border-rose-300" : "bg-slate-50 border-slate-200"}`} aria-label="증상 확인 결과">
    {assessment.blockRoutine && <>
      <h2 className="text-xl sm:text-2xl font-bold">{assessment.title}</h2>
      <p className="mt-3 text-sm sm:text-base" role={urgent ? "alert" : undefined}>{assessment.nextAction}</p>
    </>}
    {!urgent && observations.length > 0 && <details className="text-sm mt-2">
      <summary className="cursor-pointer font-semibold">답변에서 확인한 피부 특징</summary>
      <ul className="mt-3 list-disc pl-5 space-y-1">{observations.map(reason => <li key={reason}>{reason}</li>)}</ul>
    </details>}
  </section>;
}
