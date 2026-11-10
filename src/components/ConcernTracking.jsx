import React from "react";
import { DetailDisclosure } from "./DetailDisclosure";
import {
  getTrackingAreaLabel,
  getTrackingIntervalWeeks,
  getTrackingShapeLabel,
  getTrackingValueLabel,
  canCompareTrackingTrend,
  getTrackingTrendLabel,
  trackingTrendOptions,
} from "../utils/concernTracking";

function getPreviousLabel(shape, previous) {
  const value = getTrackingValueLabel(shape, previous?.value);
  if (!value) return null;
  const date = new Date(previous.savedAt ?? NaN);
  const when = Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(date)
    : null;
  return `이전 기록${when ? ` (${when})` : ""} · ${value}`;
}

function getConcernLabel(shape, area) {
  return [getTrackingShapeLabel(shape), getTrackingAreaLabel(area)].filter(Boolean).join(" · ");
}

function TrackingQuestion({ item, answers, onAnswer, first = false }) {
  const { id, trendId, shape, area, question, intervalWeeks, options, previous, metric } = item;
  const answer = answers[id];
  const showTrend = metric === "new_bumps_7d" && canCompareTrackingTrend(answer?.value, previous);
  const prior = getPreviousLabel(shape, previous);
  return (
    <fieldset className="min-w-0 rounded-2xl border border-gray-200 px-4 pb-4">
      <legend className="px-1 text-sm font-semibold">
        {first && <span className="mr-2 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-900">먼저 확인</span>}
        {getConcernLabel(shape, area)}
      </legend>
      <p className="mt-1 text-sm font-medium break-keep">{question}</p>
      <p className="mt-1 text-xs text-gray-600 break-keep">
        {intervalWeeks === 4
          ? "약 4주 간격으로 같은 부위를 같은 조명에서 비교해요."
          : "약 2주 간격으로 같은 부위를 다시 살펴봐요."}
      </p>
      {prior ? <p className="mt-1 text-xs text-gray-600">{prior}</p>
        : metric === "new_bumps_7d" && (
          <p className="mt-1 text-xs text-gray-600">아는 경우 이번 개수를 다음 체크의 기준으로 남겨요.</p>
        )}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map(option => {
          const selected = answer?.value === option.value;
          return <button key={option.value} type="button" aria-pressed={selected}
            onClick={() => {
              const next = selected ? undefined : option;
              onAnswer(id, next);
              if (!canCompareTrackingTrend(next?.value, previous) && answers[trendId]) onAnswer(trendId, undefined);
            }}
            className={`rounded-xl border px-3 py-2 text-sm ${selected ? "border-black bg-black text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}>
            {option.label}
          </button>;
        })}
      </div>
      {showTrend && <fieldset className="mt-4 min-w-0 border-t border-gray-200 pt-3">
        <legend className="pr-2 text-sm font-medium">지난 기록과 비교해 새로 난 돌기가 어때요? (선택)</legend>
        <div className="flex flex-wrap gap-2">
          {trackingTrendOptions.map(option => {
            const selected = answers[trendId]?.value === option.value;
            return <button key={option.value} type="button" aria-pressed={selected}
              onClick={() => onAnswer(trendId, selected ? undefined : option)}
              className={`rounded-xl border px-3 py-2 text-sm ${selected ? "border-black bg-black text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}>
              {option.label}
            </button>;
          })}
        </div>
      </fieldset>}
    </fieldset>
  );
}

export function ConcernTrackingFields({ questions, answers, onAnswer }) {
  if (!questions?.length) return null;
  const [first, ...others] = questions;

  return (
    <section aria-labelledby="concern-tracking-title" className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6">
      <h2 id="concern-tracking-title" className="text-lg font-bold">고민별 변화 기록</h2>
      <p className="mt-2 text-sm text-gray-600 break-keep">
        가장 먼저 관리하기로 한 고민부터 봐요. 확인할 수 있는 것만 답해도 돼요.
      </p>
      <div className="mt-4 space-y-3">
        <TrackingQuestion item={first} answers={answers} onAnswer={onAnswer} first />
        {others.length > 0 && (
          <DetailDisclosure title={`다른 고민도 확인하기 (${others.length}개)`}>
            <div className="space-y-3">
              {others.map(item => <TrackingQuestion key={item.id} item={item} answers={answers} onAnswer={onAnswer} />)}
            </div>
          </DetailDisclosure>
        )}
      </div>
    </section>
  );
}

const nextCheckGuides = {
  new_bumps_7d: "같은 부위의 최근 7일 새 돌기를 확인해요. 세기 어려우면 느낀 변화를 남겨요.",
  visible_change: "같은 부위의 개수를 관리 시작 때와 비교해요.",
  pain_change: "같은 부위의 통증을 관리 시작 때와 비교해요.",
  color_change: "같은 조명에서 자국의 색을 관리 시작 때와 비교해요.",
  texture_change: "같은 조명에서 피부 표면을 관리 시작 때와 비교해요.",
};

export function ConcernTrackingRecord({ tracking, showNext = false }) {
  const entries = tracking?.entries?.filter(({ shape, value }) => getTrackingValueLabel(shape, value));
  if (!entries?.length) return null;
  const next = entries.reduce((first, entry) =>
    getTrackingIntervalWeeks(entry.shape) < getTrackingIntervalWeeks(first.shape) ? entry : first,
  );

  return (
    <section aria-label="고민별 변화 기록" className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-bold">고민별 변화 기록</h3>
      {showNext && <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
        <p className="font-semibold">다음에 먼저 볼 것 · {getConcernLabel(next.shape, next.area)}</p>
        <p className="mt-1 break-keep">약 {getTrackingIntervalWeeks(next.shape)}주 뒤, {nextCheckGuides[next.metric]}</p>
      </div>}
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {entries.map(({ shape, area, metric, value, previous, trend }) => {
          const prior = getPreviousLabel(shape, previous);
          return (
            <div key={`${shape}:${area ?? "unspecified"}`} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm break-keep">
              <dt className="font-semibold">{getConcernLabel(shape, area)}</dt>
              <dd className="mt-1 text-gray-700">
                {metric === "new_bumps_7d" ? "최근 7일 새 돌기" : "관리 시작 때와 비교"} · {getTrackingValueLabel(shape, value)}
              </dd>
              {getTrackingTrendLabel(trend) && <dd className="mt-1 text-xs text-gray-700">느낀 변화 · {getTrackingTrendLabel(trend)}</dd>}
              {prior && <dd className="mt-1 text-xs text-gray-600">{prior}</dd>}
              <dd className="mt-1 text-xs text-gray-600">약 {getTrackingIntervalWeeks(shape)}주 간격으로 확인</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
