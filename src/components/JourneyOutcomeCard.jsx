import React from "react";
import { SKIN_STATE_AXES, getRecordSkinComparison } from "../utils/skinStateMeasurement";
import { buildUsageReliability } from "../utils/usageReliability";

const levelLabels = { high: "기록 충분", medium: "일부 정보 부족", low: "판단 근거 부족" };
const reasonLabels = {
  missing_context: "사용·생활 변화 질문에 빠진 답변이 있어요.",
  incomplete_comparison: "같은 기준의 Before/After 8축 비교가 부족해요.",
  confounding_changes: "생활습관이나 다른 제품의 변화가 함께 있었어요.",
  missing_product_usage: "제품별 사용 기간·빈도 등 빠진 정보가 있어요.",
  multiple_products: "여러 제품을 사용해 개별 제품의 영향을 나누기 어려워요.",
  inconsistent_usage: "사용 상태와 중단 여부 답변을 다시 확인해야 해요.",
  stopped_early: "사용 중 쉬거나 중단한 제품이 있어요.",
};
const statusLabels = { consistent: "꾸준히 사용", occasional: "가끔 사용", stopped: "사용 후 중단", never_used: "사용하지 않음", unknown: "사용 여부 미확인" };
const contextLabels = {
  otherSkincareChange: "다른 화장품", sleepStressChange: "수면·스트레스",
  dietChange: "식생활", medicationSupplementChange: "약·영양제", environmentChange: "환경",
};

export function JourneyOutcomeCard({ record, previousRecord = null }) {
  if (!record || record.type !== "feedback") return null;
  const comparison = getRecordSkinComparison(record, previousRecord);
  const reliability = record.dataReliability || buildUsageReliability({
    feedbackAnswers: record.feedbackAnswers,
    actualProductUsage: record.actualProductUsage,
    skinComparison: comparison,
  });
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold">Before / After · 피부 상태 8축</h3>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          설문 응답을 0~10으로 정리한 값이에요. 숫자가 클수록 해당 불편 신호가 많아요.
          수분감 루틴 단계와는 별도로 비교해요.
        </p>
        {comparison.comparisonStatus === "version_mismatch" && <p className="mt-2 text-sm text-amber-800">측정 기준이 달라 변화량을 계산하지 않았어요.</p>}
        {comparison.comparableAxisCount === 0 && comparison.comparisonStatus !== "version_mismatch" && <p className="mt-2 text-sm text-gray-600">비교할 이전 8축 측정이 없어요. 이번 측정을 다음 체크의 기준으로 저장했어요.</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <caption className="sr-only">피부 상태 8축의 이전·현재 점수와 변화량</caption>
          <thead><tr className="border-b border-gray-200 text-gray-500">
            <th scope="col" className="py-2">항목</th><th scope="col">이전</th><th scope="col">현재</th><th scope="col">변화</th>
          </tr></thead>
          <tbody>{SKIN_STATE_AXES.map(({ key, label }) => {
            const delta = comparison.delta[key];
            return <tr key={key} className="border-b border-gray-100">
              <th scope="row" className="py-3 font-medium text-gray-700">{label}</th>
              <td>{comparison.before?.values?.[key] ?? "미측정"}</td>
              <td>{comparison.after?.values?.[key] ?? "미측정"}</td>
              <td className={delta === null ? "text-gray-400" : delta < 0 ? "text-emerald-700" : delta > 0 ? "text-amber-800" : "text-gray-600"}>
                {delta === null ? "비교 불가" : delta === 0 ? "유지" : `${delta > 0 ? "+" : ""}${delta} ${delta < 0 ? "감소" : "증가"}`}
              </td>
            </tr>;
          })}</tbody>
        </table>
      </div>
      <div className="rounded-2xl bg-gray-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-gray-900">실사용 기록 신뢰도</h3>
          <span className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold">{levelLabels[reliability.level]}</span>
        </div>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">사용 정보의 충분함과 함께 바뀐 변수를 확인한 결과예요. 제품 효과의 확률을 뜻하지 않아요.</p>
        {reliability.reasons.length > 0 && <ul className="mt-3 space-y-2 text-sm text-gray-600">{reliability.reasons.map((reason) => <li key={reason}>{reasonLabels[reason]}</li>)}</ul>}
        <p className="mt-3 text-sm text-gray-700">{reliability.productAttributionReady ? "단일 제품 사용과 피부 변화의 연관성을 검토할 수 있는 기록이에요." : "이번 변화는 사용한 루틴 전체의 관찰 기록으로 보관해요."}</p>
        <p className="mt-2 text-xs text-gray-500">기록만으로 개별 제품 효과를 확정하거나 추천 점수를 자동 변경하지 않아요.</p>
      </div>
      {(record.actualProductUsage || []).length > 0 && <div>
        <h4 className="text-sm font-bold mb-3">이번에 실제로 사용한 제품</h4>
        <div className="space-y-3">{record.actualProductUsage.map((item) => {
          const usage = item.actualUsage || {};
          const productQuality = reliability.productReliability.find((product) => product.productId === item.productId);
          return <div key={`${item.category}-${item.productId}`} className="rounded-2xl border border-gray-100 p-3">
            <p className="text-sm font-semibold">{item.productNameSnapshot || "제품 정보 없음"}</p>
            <p className="mt-1 text-xs text-gray-500">{statusLabels[usage.status ?? item.usageStatus] || statusLabels.unknown}
              {usage.status !== "never_used" && ` · ${usage.durationDays ? `${usage.durationDays}일 사용` : "기간 미입력"}`}
              {usage.status !== "never_used" && ` · ${levelLabels[productQuality?.level || "low"]}`}
            </p>
            {usage.irritationObserved === true && <p className="mt-2 text-xs text-amber-800">사용 중 따가움·붉어짐을 기록했어요.</p>}
          </div>;
        })}</div>
      </div>}
      <div>
        <h4 className="text-sm font-bold mb-3">함께 확인한 생활·환경 변화</h4>
        <ul className="space-y-2 text-sm text-gray-600">{Object.entries(contextLabels).map(([key, label]) => <li key={key}>{label} · {record.feedbackAnswers?.[key]?.label || "미입력"}</li>)}</ul>
      </div>
    </div>
  );
}
