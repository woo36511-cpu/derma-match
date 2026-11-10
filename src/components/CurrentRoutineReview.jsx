import { useState } from "react";
import {
  CURRENT_ROUTINE_LIMIT, getCurrentRoutineProduct, getRoutineConclusion, getRoutineReactionOptions,
  getRoutineReplacement, getSurveyRoutineReaction, readCurrentRoutine, writeCurrentRoutine,
} from "../utils/currentRoutineReview";
import { routineLookupCategories } from "../utils/routineLookup";
import { getProductById } from "../utils/productCatalog";
import { DetailDisclosure } from "./DetailDisclosure";

export function useCurrentRoutine(ownerKey) {
  const [initial] = useState(() => {
    try { return { entries: readCurrentRoutine(window.localStorage, ownerKey), failed: false }; }
    catch { return { entries: [], failed: true }; }
  });
  const [entries, setEntries] = useState(initial.entries);
  const [storageFailed, setStorageFailed] = useState(initial.failed);
  function update(next) {
    setEntries(next);
    try { writeCurrentRoutine(window.localStorage, ownerKey, next); setStorageFailed(false); }
    catch { setStorageFailed(true); }
  }
  return {
    entries, storageFailed,
    add: entry => {
      if (entries.length >= CURRENT_ROUTINE_LIMIT || entries.some(item => item.id === entry.id)) return false;
      update([...entries, entry]);
      return true;
    },
    react: (id, reaction) => update(entries.map(entry => entry.id === id ? { ...entry, reaction } : entry)),
    remove: id => update(entries.filter(entry => entry.id !== id)),
  };
}

const replacementText = {
  blocked: "지금은 자극이나 최근 증상부터 확인해요. 새 제품 후보는 잠시 보류할게요.",
  unsupported: "지금은 일반 세안제와 기본 보습제만 대체 후보를 골라드려요. 이 제품은 사용 반응부터 확인해요.",
  no_candidate: "같은 단계에서 현재 조건과 검수 기준을 충족한 다른 제품이 없어요.",
};

function Replacement({ result, onStartSurvey }) {
  if (!result) return null;
  if (result.status === "candidate" && result.product) return <div className="space-y-1">
    <p className="font-bold">{result.product.name}</p>
    {result.description && <p>{result.description}</p>}
    <p>지난 설문과 이번 사용 반응에 맞춰 고른 같은 단계 후보예요. 다른 제품까지 같이 바꿀 필요는 없어요.</p>
    {result.product.officialUrl && <a href={result.product.officialUrl} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-2">공식 제품 정보</a>}
  </div>;
  if (result.status === "needs_profile") return <div>
    <p>현재 피부 상태를 확인한 설문이 있어야 대체 후보를 고를 수 있어요. 담아둔 제품은 이 기기에 남아요.</p>
    {onStartSurvey && <button type="button" onClick={onStartSurvey} className="mt-2 font-semibold text-emerald-800 underline underline-offset-2">피부 성향 확인하고 돌아오기</button>}
  </div>;
  return <p>{replacementText[result.status] ?? replacementText.no_candidate}</p>;
}

export function CurrentRoutineReview({ routine, profile, savedAt, safetyBlocked, onStartSurvey }) {
  const rows = routine.entries.map(entry => ({ entry, product: getCurrentRoutineProduct(entry), conclusion: getRoutineConclusion(entry.reaction) }))
    .filter(row => row.product).sort((a, b) => a.conclusion.rank - b.conclusion.rank);
  const first = rows.find(row => row.conclusion.rank < 3);
  const savedDate = savedAt && new Date(savedAt);
  const dateLabel = savedDate && Number.isFinite(savedDate.getTime()) ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" }).format(savedDate) : "";
  return <section aria-labelledby="current-routine-title" className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5">
    <h4 id="current-routine-title" className="font-bold">내 루틴 점검</h4>
    <p className="mt-1 text-xs text-slate-600">담은 제품과 응답은 이 기기에 저장돼요.</p>
    {profile && <p className="mt-2 text-sm text-slate-700">지난 피부 설문{dateLabel && ` (${dateLabel})`} · {profile.skinType}</p>}
    {routine.storageFailed && <p role="alert" className="mt-2 text-sm text-amber-900">이 기기에 저장할 수 없어요. 지금 화면을 나가면 변경 내용이 사라질 수 있어요.</p>}
    {!rows.length ? <p className="mt-3 text-sm text-slate-700">아래에서 지금 쓰는 제품을 찾아 담아보세요. 잘 맞는 제품은 유지하는 것부터 시작해요.</p> : <>
      <div aria-live="polite" className="mt-3 rounded-xl bg-emerald-100 px-4 py-3 text-sm text-emerald-950">
        <p className="font-semibold">{first ? `먼저 확인 · ${first.product.name}` : "편안하게 쓰는 제품은 그대로 유지해요."}</p>
        {first && <p className="mt-1">{first.conclusion.text}</p>}
      </div>
      <ul className="mt-3 space-y-3">
        {rows.map(({ entry, product, conclusion }) => {
          const options = getRoutineReactionOptions(product.category);
          const previous = rows.filter(row => row.product.category === product.category).length === 1
            ? options.find(option => option.value === getSurveyRoutineReaction(product.category, profile)) : null;
          const description = product.formulaVerified ? getProductById(product.id)?.description : null;
          return <li key={entry.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-bold text-slate-950">{product.name}</p>
              <button type="button" aria-label={`${product.name} 내 루틴에서 빼기`} onClick={() => routine.remove(entry.id)} className="text-xs text-slate-600 underline underline-offset-2">빼기</button>
            </div>
            <p className="text-xs text-slate-600">{routineLookupCategories[product.category]} · {product.manual ? "직접 입력한 제품" : product.formulaVerified ? "국내 전성분 확인됨" : "전성분 검수 전"}</p>
            {description && <p className="text-xs text-slate-600">{description}</p>}
            <label className="block text-sm">
              <span className="font-semibold">이 제품을 쓸 때 느낌</span>
              <select aria-label={`${product.name} 사용 반응`} value={entry.reaction ?? ""} onChange={event => routine.react(entry.id, event.target.value || null)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2 text-base">
                <option value="">선택 안 함</option>
                {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            {!entry.reaction && previous && <button type="button" onClick={() => routine.react(entry.id, previous.value)} className="text-left text-xs font-semibold text-emerald-800 underline underline-offset-2">
              같은 제품이라면 지난 설문 답변 적용 · {previous.label}
            </button>}
            {entry.reaction && <p className="text-sm text-slate-700"><strong>{conclusion.label}</strong> · {conclusion.text}</p>}
            {conclusion.alternative && <RoutineReplacementDisclosure entry={entry} product={product} routine={routine} profile={profile} safetyBlocked={safetyBlocked} onStartSurvey={onStartSurvey} />}
          </li>;
        })}
      </ul>
    </>}
  </section>;
}

function RoutineReplacementDisclosure({ entry, product, routine, profile, safetyBlocked, onStartSurvey }) {
  return <DetailDisclosure title="대체 후보 보기">
    <Replacement result={getRoutineReplacement({ entry, product, entries: routine.entries, profile, safetyBlocked })} onStartSurvey={onStartSurvey} />
  </DetailDisclosure>;
}
