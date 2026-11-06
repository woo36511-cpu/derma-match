import React from "react";
import { DetailDisclosure } from "./DetailDisclosure";

export function SymptomAssessmentCard({ assessment, hideObservations = false }) {
  if (!assessment) return null;
  const urgent = ["emergency", "urgent"].includes(assessment.urgency);
  const observations = hideObservations ? [] : [...new Set((assessment.candidates ?? []).flatMap(candidate => candidate.reasons ?? []))];
  if (!assessment.blockRoutine && observations.length === 0) return null;
  return <section className={`rounded-3xl border p-5 sm:p-7 text-left ${urgent ? "bg-rose-50 border-rose-300" : "bg-slate-50 border-slate-200"}`} aria-label="증상 확인 결과">
    {assessment.blockRoutine && <>
      <h2 className="text-xl sm:text-2xl font-bold">{assessment.title}</h2>
      <p className="mt-3 text-sm sm:text-base" role={urgent ? "alert" : undefined}>{assessment.nextAction}</p>
    </>}
    {!urgent && observations.length > 0 && <DetailDisclosure title="답변에서 확인한 피부 특징" className={assessment.blockRoutine ? "mt-4" : ""}>
      <ul className="list-disc pl-5 space-y-1">{observations.map(reason => <li key={reason}>{reason}</li>)}</ul>
    </DetailDisclosure>}
  </section>;
}
