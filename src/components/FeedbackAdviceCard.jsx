import React from "react";

export function FeedbackAdviceCard({ advice }) {
  if (!advice || advice.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="bg-emerald-50 rounded-3xl p-5 sm:p-6 border border-emerald-100">
        <p className="text-sm font-semibold text-emerald-800 mb-3">
          피드백 분석
        </p>

        <ul className="space-y-2">
          {advice.map((item) => (
            <li
              key={item}
              className="text-sm sm:text-base text-emerald-900 leading-relaxed break-keep"
            >
              · {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
