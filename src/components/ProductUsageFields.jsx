import React from "react";

const fields = [
  { key: "frequency", label: "사용 빈도", options: [["daily", "하루 1회"], ["twice_daily", "하루 2회 이상"], ["few_weekly", "일주일에 몇 번"], ["rare", "드물게"]] },
  { key: "amount", label: "권장량과 비교한 사용량", options: [["recommended", "권장량 정도"], ["less", "더 적게"], ["more", "더 많이"]] },
  { key: "stoppedEarly", label: "사용 중 쉬거나 중단했나요?", boolean: true, options: [["false", "아니요"], ["true", "네"]] },
  { key: "irritationObserved", label: "사용할 때 따가움·붉어짐이 있었나요?", boolean: true, options: [["false", "없었어요"], ["true", "있었어요"]] },
  { key: "usedAsDirected", label: "안내한 사용법대로 사용했나요?", boolean: true, options: [["true", "네"], ["false", "다르게 사용했어요"]] },
];

export function ProductUsageFields({ productId, usage, onChange }) {
  if (!usage?.status || usage.status === "never_used") return null;
  const change = (key, value) => onChange(productId, { [key]: value });
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="text-sm text-gray-700">
        실제 사용한 날 수
        <input
          type="number" min="1" max="3650" step="1" inputMode="numeric"
          value={usage.durationDays ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            const days = Number(value);
            change("durationDays", value !== "" && Number.isInteger(days) && days >= 1 && days <= 3650 ? days : null);
          }}
          className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
          placeholder="예: 14"
        />
      </label>
      {fields.filter((field) => !(field.key === "stoppedEarly" && usage.status === "stopped")).map((field) => (
        <label key={field.key} className="text-sm text-gray-700">
          {field.label}
          <select
            value={usage[field.key] === null || usage[field.key] === undefined ? "" : String(usage[field.key])}
            onChange={(event) => change(field.key, event.target.value === "" ? null : field.boolean ? event.target.value === "true" : event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">잘 모르겠어요 / 미입력</option>
            {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      ))}
      {(usage.status === "stopped" || usage.stoppedEarly === true) && (
        <label className="text-sm text-gray-700">
          쉬거나 중단한 이유
          <select value={usage.stopReason ?? ""} onChange={(event) => change("stopReason", event.target.value || null)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2">
            <option value="">잘 모르겠어요 / 미입력</option>
            <option value="irritation">따가움·붉어짐 등 불편함</option>
            <option value="no_benefit">변화를 느끼지 못함</option>
            <option value="other">다른 이유</option>
          </select>
        </label>
      )}
    </div>
  );
}
