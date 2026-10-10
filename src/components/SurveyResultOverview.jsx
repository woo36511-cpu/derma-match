import {
  getLevelDescription,
  getCareDirections,
  getResultCautions,
} from "../utils/skinIssueGuides";
import React from "react";

export function SurveyResultOverview({ result }) {
  if (!result) return null;

  const levelInfo = getLevelDescription(result.hydrationLevel);
  const directions = getCareDirections(result);
  const cautions = getResultCautions(result);
  const reasons = result.issueGuide?.reasons?.length
    ? result.issueGuide.reasons.slice(0, 6)
    : Array.isArray(result.reasons)
      ? result.reasons.slice(0, 6)
      : [];

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] bg-slate-950 text-white p-6 sm:p-7 shadow-lg">
        <p className="text-sm text-slate-300 mb-2">설문 분석 결과</p>
        <h2 className="text-2xl sm:text-3xl font-black leading-tight">
          지금 피부는{" "}
          <span className="text-emerald-300">{result.skinType}</span> 쪽에
          가까워요
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          답변을 기준으로 피부타입, 수분감 단계, 주요 고민을 함께 봤어요. 아래
          루틴은 처음 시작해도 부담이 적은 방향으로 구성했어요.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">피부 상태</p>
            <p className="mt-1 font-bold">{result.skinType}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">수분감 단계</p>
            <p className="mt-1 font-bold">{result.hydrationLevel}단계</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">주요 고민</p>
            <p className="mt-1 font-bold">{result.issueLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-[1.7rem] bg-white p-5 sm:p-6 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 mb-2">
            현재 단계 해석
          </p>
          <h3 className="text-xl font-black text-slate-900">
            {levelInfo.title}
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {levelInfo.desc}
          </p>
        </div>

        <div className="rounded-[1.7rem] bg-white p-5 sm:p-6 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 mb-2">
            추천 사용 순서
          </p>
          <h3 className="text-xl font-black text-slate-900">
            클렌저 → 토너 → 세럼 → 크림
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            처음에는 양을 적게 시작하고, 피부가 편안하면 2~3일 간격으로 사용량을
            조금씩 맞춰보세요.
          </p>
        </div>
      </div>

      <div className="rounded-[1.7rem] bg-white p-5 sm:p-6 border border-slate-100 shadow-sm">
        <p className="text-xs font-bold text-emerald-600 mb-2">
          왜 이렇게 판단했나요?
        </p>
        <h3 className="text-xl font-black text-slate-900 mb-4">
          선택한 답변에서 이런 신호가 보였어요
        </h3>

        {reasons.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason, index) => (
              <span
                key={`${index}-${reason}`}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700"
              >
                {reason}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            선택한 답변이 충분하지 않아 기본 루틴 중심으로 추천했어요.
          </p>
        )}
      </div>

      <div className="rounded-[1.7rem] bg-emerald-50 p-5 sm:p-6 border border-emerald-100">
        <p className="text-xs font-bold text-emerald-700 mb-2">관리 방향</p>
        <h3 className="text-xl font-black text-slate-900 mb-4">
          앞으로는 이렇게 관리해보세요
        </h3>

        <div className="space-y-3">
          {directions.map((item) => (
            <div key={item} className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.7rem] bg-amber-50 p-5 sm:p-6 border border-amber-100">
        <p className="text-xs font-bold text-amber-700 mb-2">주의할 점</p>
        <h3 className="text-xl font-black text-slate-900 mb-4">
          처음 2주는 피부 반응을 꼭 확인하세요
        </h3>

        <div className="space-y-3">
          {cautions.map((item) => (
            <div key={item} className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
