import React from "react";
import { symptomSources } from "../utils/symptomAssessment";

// Original explanatory vectors; no third-party clinical photographs or generated diagnostic images.
export function LesionComparison() {
  return (
    <details className="my-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
      <summary className="cursor-pointer font-semibold text-sm">모습 비교 그림과 실제 임상자료 보기</summary>
      <p className="mt-3 text-sm text-slate-600">아래는 사진이 아닌 단순한 모식도예요. 피부색·조명에 따라 실제 모습은 다르며, 그림과 닮았다는 이유만으로 질환을 구별할 수 없어요.</p>
      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        {[
          ["mixed", "막힌 피지와 여러 형태", "검거나 하얗게 막힌 피지와 크기가 다른 돌기가 섞인 모습"],
          ["uniform", "비슷한 작은 돌기", "크기·모양이 비슷한 돌기와 고름이 있는 모습"],
          ["hair", "털구멍 중심 돌기", "털구멍을 중심으로 돌기·고름이 보이는 모습"],
        ].map(([key, title, description]) => (
          <figure key={key} className="rounded-2xl bg-white border border-slate-100 p-3">
            <svg viewBox="0 0 200 110" role="img" aria-label={description} className="w-full h-28">
              <rect width="200" height="110" rx="12" fill="#e6c6ac" />
              {[38, 100, 162].map((x, i) => <g key={x}>
                <circle cx={x} cy={55} r={key === "mixed" ? [6, 16, 11][i] : 13} fill={key === "mixed" && i === 0 ? "#7c5441" : "#a64d45"} opacity=".8" />
                {(key !== "mixed" || i > 0) && <circle cx={x} cy={53} r="4" fill="#fff1cc" />}
                {key === "hair" && <path d={`M ${x} 56 Q ${x + 12} 30 ${x + 5} 17`} stroke="#49352c" strokeWidth="3" fill="none" />}
              </g>)}
            </svg>
            <figcaption className="text-sm font-semibold mt-2">{title}</figcaption>
          </figure>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">같은 모습에도 여러 원인이 있을 수 있어, 그림은 답변을 돕는 용도로만 사용해요.</p>
      <ul className="mt-3 space-y-2 text-xs">
        {symptomSources.slice(0, 3).map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="underline text-blue-700">{source.label} ↗</a></li>)}
      </ul>
    </details>
  );
}
