import React from "react";

export function SkinIssueGuideCard({ guide }) {
  if (!guide) return null;

  const theme =
    guide.careLevel === "clinic_priority"
      ? {
          box: "bg-rose-50 border-rose-200",
          badge: "text-rose-700 bg-rose-100",
          title: "text-rose-950",
        }
      : guide.careLevel === "pharmacy_consider"
        ? {
            box: "bg-amber-50 border-amber-200",
            badge: "text-amber-700 bg-amber-100",
            title: "text-amber-950",
          }
        : {
            box: "bg-emerald-50 border-emerald-200",
            badge: "text-emerald-700 bg-emerald-100",
            title: "text-emerald-950",
          };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className={`rounded-[2rem] border p-5 sm:p-7 ${theme.box}`}>
        <span
          className={`inline-flex rounded-full px-3 py-2 text-sm font-bold mb-4 ${theme.badge}`}
        >
          {guide.badge}
        </span>

        <h3
          className={`text-xl sm:text-2xl font-black leading-relaxed break-keep ${theme.title}`}
        >
          {guide.title}
        </h3>

        <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed break-keep">
          {guide.summary}
        </p>

        {guide.reasons.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-gray-700 mb-3">
              이렇게 판단한 이유
            </p>

            <div className="flex flex-wrap gap-2">
              {guide.reasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-white/80 border border-white px-3 py-2 text-xs sm:text-sm text-gray-700"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {guide.pharmacyGuide && (
        <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-5 sm:p-7">
          <p className="text-sm font-bold text-blue-600 mb-2">
            약국에서 알아볼 수 있는 선택지
          </p>

          <h3 className="text-2xl font-black text-gray-900 break-keep">
            {guide.pharmacyGuide.ingredient}
          </h3>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
              {guide.pharmacyGuide.type}
            </span>

            <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-xs font-semibold">
              예: {guide.pharmacyGuide.example}
            </span>
          </div>

          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            {guide.pharmacyGuide.purpose}
          </p>

          <div className="mt-6">
            <p className="text-sm font-bold text-gray-900 mb-3">
              허가사항 기준 사용법
            </p>

            <div className="space-y-2">
              {guide.pharmacyGuide.directions.map((item) => (
                <p
                  key={item}
                  className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
                >
                  · {item}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">
              루틴에 넣는다면
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {guide.pharmacyGuide.routineExample.map((item, index) => (
                <React.Fragment key={item}>
                  <span className="rounded-full bg-white border border-gray-200 px-3 py-2 text-xs sm:text-sm">
                    {item}
                  </span>

                  {index < guide.pharmacyGuide.routineExample.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-100 p-4">
            <p className="text-sm font-bold text-amber-800 mb-3">
              사용 전 꼭 확인
            </p>

            <div className="space-y-2">
              {guide.pharmacyGuide.cautions.map((item) => (
                <p
                  key={item}
                  className="text-sm text-amber-900 leading-relaxed break-keep"
                >
                  · {item}
                </p>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400 leading-relaxed break-keep">
            의약품의 실제 사용은 제품 설명서의 최신 허가사항을 우선해서
            확인해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
