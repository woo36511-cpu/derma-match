import { RoutineProductScroller } from "./RoutineProductScroller";
import { GuidedFacePhoto } from "./GuidedFacePhoto";
import { getRankedProductCandidates } from "../utils/routineRecommendation";
import { getReactionIngredientClues } from "../utils/reactionIngredientFit";
import { useEffect, useRef, useState } from "react";
import {
  CURRENT_ROUTINE_LIMIT, getCurrentRoutineProduct, getRoutineConclusion, getRoutineReactionOptions,
  getRoutineReplacement, getSurveyRoutineReaction, readCurrentRoutine, writeCurrentRoutine,
  getReviewedRoutineProduct, getExactCatalogProduct,
} from "../utils/currentRoutineReview";
import { routineLookupCategories } from "../utils/routineLookup";
import { DetailDisclosure } from "./DetailDisclosure";
import { checkOfficialFormula, readOfficialFormula, supportsOfficialFormula } from "../services/officialCosmetics";
import { getIngredientFamilies } from "../utils/ingredientCompatibility";

export function useCurrentRoutine(ownerKey) {
  const load = key => {
    try { return { ownerKey: key, entries: readCurrentRoutine(window.localStorage, key), storageFailed: false }; }
    catch { return { ownerKey: key, entries: [], storageFailed: true }; }
  };
  const [state, setState] = useState(() => load(ownerKey));
  const ledger = useRef({ ...state, pending: new Map(), checked: new Set() });
  const [checkingCount, setCheckingCount] = useState(0);
  useEffect(() => {
    if (ledger.current.ownerKey !== ownerKey) ledger.current = { ...load(ownerKey), pending: new Map(), checked: new Set() };
    const scope = ledger.current;
    setState({ ownerKey, entries: scope.entries, storageFailed: scope.storageFailed });
    setCheckingCount(scope.pending.size);
  }, [ownerKey]);
  const { entries, storageFailed } = state.ownerKey === ownerKey ? state : { entries: [], storageFailed: false };
  function update(scope, next) {
    if (ledger.current !== scope || scope.ownerKey !== ownerKey) return;
    scope.entries = next;
    try { writeCurrentRoutine(window.localStorage, ownerKey, next); scope.storageFailed = false; }
    catch { scope.storageFailed = true; }
    setState({ ownerKey, entries: next, storageFailed: scope.storageFailed });
  }
  function check(scope, entry) {
    const product = getCurrentRoutineProduct(entry);
    if (!supportsOfficialFormula(product) || product.formulaVerified || getReviewedRoutineProduct(product) ||
        readOfficialFormula(entry.officialFormula, product) || scope.checked.has(entry.id) || scope.pending.size >= 4) return;
    scope.checked.add(entry.id);
    const req = checkOfficialFormula(product).then(officialFormula => {
      if (officialFormula && scope.entries.some(row => row.id === entry.id)) {
        update(scope, scope.entries.map(row => row.id === entry.id ? { ...row, officialFormula } : row));
      }
    }).finally(() => {
      scope.pending.delete(entry.id);
      if (ledger.current === scope) setCheckingCount(scope.pending.size);
    });
    scope.pending.set(entry.id, req);
    setCheckingCount(scope.pending.size);
  }
  return {
    entries, storageFailed, checking: state.ownerKey === ownerKey && checkingCount > 0,
    checkExisting: () => {
      const scope = ledger.current;
      if (scope.ownerKey === ownerKey) scope.entries.forEach(entry => check(scope, entry));
    },
    entriesAfterChecks: async () => {
      const scope = ledger.current;
      await Promise.allSettled([...scope.pending.values()]);
      return ledger.current === scope && scope.ownerKey === ownerKey ? scope.entries : [];
    },
    add: entry => {
      const scope = ledger.current;
      if (scope.ownerKey !== ownerKey || scope.entries.length >= CURRENT_ROUTINE_LIMIT || scope.entries.some(item => item.id === entry.id)) return false;
      update(scope, [...scope.entries, entry]);
      check(scope, entry);
      return true;
    },
    react: (id, reaction) => update(ledger.current, ledger.current.entries.map(entry => entry.id === id ? { ...entry, reaction } : entry)),
    remove: id => update(ledger.current, ledger.current.entries.filter(entry => entry.id !== id)),
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

function RoutineReactionComparison({ rows, safetyBlocked }) {
  const [changed, setChanged] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const suspects = rows.filter(({ entry }) => changed.includes(entry.id));
  const original = suspects.length === 1 ? getExactCatalogProduct(suspects[0].product) : null;
  const formula = suspects.length === 1
    ? readOfficialFormula(suspects[0].entry.officialFormula, suspects[0].product)?.ingredients : null;
  const exactIngredients = original?.evidence?.domesticFormulaVerified && original.evidence.fullIngredientsVerified
    ? original.fullIngredients : formula;
  const avoid = new Set(getReactionIngredientClues(exactIngredients ?? []).map(clue => clue.family));
  avoid.add("fragrance");
  const level = original?.hydrationLevel;
  const candidate = submitted && !safetyBlocked && exactIngredients?.length && Number.isFinite(level)
    ? getRankedProductCandidates(original.category, level, { basicOnly: true, isSensitive: true,
      ownedProductIds: new Set(rows.flatMap(({ product }) => [product.id, getExactCatalogProduct(product)?.id])),
    }).filter(product => product.category === original.category && product.id !== original.id &&
      product.beginnerFriendly && product.evidence?.domesticFormulaVerified && product.evidence.fullIngredientsVerified &&
      product.fullIngredients?.length && Number.isFinite(product.hydrationLevel) &&
      Math.abs(product.hydrationLevel - level) <= 1 &&
      !getReactionIngredientClues(product.fullIngredients).some(clue => avoid.has(clue.family)))
      .sort((a, b) => Math.abs(a.hydrationLevel - level) - Math.abs(b.hydrationLevel - level))[0]
    : null;
  return <DetailDisclosure title="피부가 불편했을 때 제품 비교">
    <div className="space-y-3">
      <GuidedFacePhoto />
      <fieldset className="space-y-2">
        <legend className="font-semibold">불편해지기 전에 새로 쓰거나 사용량을 늘린 제품</legend>
        {rows.map(({ entry, product }) => <label key={entry.id} className="flex gap-2">
          <input type="checkbox" checked={changed.includes(entry.id)} onChange={() => {
            setSubmitted(false);
            setChanged(previous => previous.includes(entry.id)
              ? previous.filter(id => id !== entry.id) : [...previous, entry.id]);
          }} />{product.name}
        </label>)}
      </fieldset>
      <button type="button" className="care-secondary" onClick={() => setSubmitted(true)}>먼저 쉬어볼 제품과 대체품 확인</button>
      {submitted && <div role="status" className="space-y-2">
        {suspects.length ? <p>먼저 쉬어볼 제품 · {suspects.map(({ product }) => product.name).join(", ")}</p>
          : <p>바뀐 제품을 확인하기 어려워요. 불편해지기 전에 새로 시작한 제품이 있다면 잠시 쉬어요.</p>}
        {candidate ? <>
          <p>피부가 편해진 뒤 비교할 제품이에요. 보습감이 비슷하고, 확인한 전성분에서 향료와 이번에 확인한 성분 계열이 제외됐어요.</p>
          <RoutineProductScroller layout="routine" productsByCategory={{ [candidate.category]: candidate }} />
        </>
          : <p>지금 조건에서 비교할 대체품을 확인하지 못했어요.</p>}
      </div>}
    </div>
  </DetailDisclosure>;
}

export function CurrentRoutineReview({ routine, profile, savedAt, safetyBlocked, onStartSurvey, personalProductFeedback }) {
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
      <RoutineReactionComparison rows={rows} safetyBlocked={safetyBlocked} />
      <ul className="mt-3 space-y-3">
        {rows.map(({ entry, product, conclusion }) => {
          const options = getRoutineReactionOptions(product.category);
          const previous = rows.filter(row => row.product.category === product.category).length === 1
            ? options.find(option => option.value === getSurveyRoutineReaction(product.category, profile)) : null;
          const reviewed = getReviewedRoutineProduct(product);
          const official = reviewed ? null : readOfficialFormula(entry.officialFormula, product);
          const families = official ? getIngredientFamilies({ name: product.name, fullIngredients: official.ingredients,
            evidence: { domesticFormulaVerified: true, fullIngredientsVerified: true } }) : [];
          const familyLabels = { niacinamide: "나이아신아마이드", vitaminC: "비타민 C 계열", retinoid: "레티노이드", pdrn: "PDRN", peptide: "펩타이드", acid: "각질 관리 성분군", benzoyl: "벤조일퍼옥사이드" };
          return <li key={entry.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-bold text-slate-950">{product.name}</p>
              <button type="button" aria-label={`${product.name} 내 루틴에서 빼기`} onClick={() => routine.remove(entry.id)} className="text-xs text-slate-600 underline underline-offset-2">빼기</button>
            </div>
            <p className="text-xs text-slate-600">{routineLookupCategories[product.category]} · {reviewed ? "국내 전성분·보습감 검수 완료" : official ? "국내 공식 전성분 확인됨" : product.manual ? "직접 입력한 제품 · 보습감 미확인" : product.formulaVerified ? "국내 전성분 확인됨" : "전성분 검수 전"}</p>
            {reviewed && <p className="text-xs text-slate-600">{reviewed.label}{reviewed.officialUrl && <> · <a href={reviewed.officialUrl} className="underline" target="_blank" rel="noreferrer">공식 제품 근거</a></>}</p>}
            {official && <DetailDisclosure title="공식 전성분과 확인한 성분군">
              <p>{official.ingredients.join(", ")}</p>
              {families.length > 0 && <p className="mt-2">루틴에서 함께 확인할 성분군: {families.map(family => familyLabels[family]).filter(Boolean).join(" · ")}</p>}
              <p className="mt-2">성분의 유무를 확인했어요. 공개 자료만으로 보습 지속 시간이나 자극 여부를 정하지 않아요.</p>
              <a href={official.sourceUrl} className="mt-2 inline-block underline" target="_blank" rel="noreferrer">브랜드 공식 제품 정보</a>
            </DetailDisclosure>}
            {reviewed?.catalog.description && <p className="text-xs text-slate-600">{reviewed.catalog.description}</p>}
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
            {conclusion.alternative && <RoutineReplacementDisclosure entry={entry} product={product} routine={routine} profile={profile} safetyBlocked={safetyBlocked} onStartSurvey={onStartSurvey} personalProductFeedback={personalProductFeedback} />}
          </li>;
        })}
      </ul>
    </>}
  </section>;
}

function RoutineReplacementDisclosure({ entry, product, routine, profile, safetyBlocked, onStartSurvey, personalProductFeedback }) {
  return <DetailDisclosure title="대체 후보 보기">
    <Replacement result={getRoutineReplacement({ entry, product, entries: routine.entries, profile, safetyBlocked, personalProductFeedback })} onStartSurvey={onStartSurvey} />
  </DetailDisclosure>;
}
