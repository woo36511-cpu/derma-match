import React from "react";
import { SectionTitle } from "../components/SectionTitle";
import { PrimaryButton } from "../components/PrimaryButton";
import { LesionComparison } from "../components/LesionComparison";

export function SymptomCheckScreen({ check }) {
  const question = check.questions[check.index];
  if (!question) return null;
  return <section className="max-w-3xl mx-auto">
    <SectionTitle title="지금 증상부터 확인할게요" desc="여드름·모낭염·면도 자극처럼 비슷한 증상을 비교하고 관리 경로를 정해요. 병명이나 원인균을 확정하는 검사는 아니에요." />
    <p className="text-sm text-slate-500 mb-4">{check.index + 1} / {check.questions.length} · 답변에 따라 질문 수가 달라져요.</p>
    <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-4" aria-live="polite">{question.q}</h2>
      {question.help && <p className="text-sm text-slate-600 mb-4">{question.help}</p>}
      {question.visual && <LesionComparison />}
      <div className="space-y-3" role="group" aria-label={question.q}>
        {question.options.map(option => <button key={option.value} aria-pressed={check.answers[question.id] === option.value} onClick={() => check.answer(question, option.value)} className={`w-full text-left p-4 rounded-2xl border ${check.answers[question.id] === option.value ? "bg-slate-950 text-white border-slate-950" : "bg-white border-slate-200 hover:bg-slate-50"}`}>{option.label}</button>)}
      </div>
    </div>
    <div className="flex justify-between gap-3 mt-6">
      <button onClick={check.previous} className="rounded-2xl border border-slate-300 px-5 py-3">{check.index === 0 ? "시작 화면으로 돌아가기" : "이전"}</button>
      <PrimaryButton onClick={check.next} disabled={!check.answers[question.id]}>{check.index === check.questions.length - 1 ? "관리 경로 확인" : "다음"}</PrimaryButton>
    </div>
  </section>;
}
