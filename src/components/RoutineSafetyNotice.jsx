import React from "react";

export function RoutineSafetyNotice({ safety, onRecheck }) {
  if (!safety?.blocked) return null;
  return <div className="max-w-3xl mx-auto rounded-3xl border border-amber-200 bg-amber-50 p-6" role="status">
    <h2 className="text-xl font-bold">지금은 새 제품 추천보다 상태 확인이 먼저예요</h2>
    <p className="mt-3 text-sm leading-relaxed">{safety.reason}</p>
    <button onClick={onRecheck} className="mt-4 rounded-2xl border border-amber-300 bg-white px-5 py-3 text-sm font-semibold">현재 증상 다시 확인</button>
  </div>;
}
