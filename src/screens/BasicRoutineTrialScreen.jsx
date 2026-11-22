import { useState } from "react";
import { CosmeticAddOnSection } from "../components/CosmeticAddOnSection";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { getProductById } from "../utils/productCatalog";
import { buildDynamicRoutine, getRankedProductCandidates } from "../utils/routineRecommendation";
import { getIngredientFamilies } from "../utils/ingredientCompatibility";
import { getReactionIngredientClues } from "../utils/reactionIngredientFit";
import { useScreenHeading } from "../hooks/useScreenHeading";

const slots = { cleanser: "클렌저", toner: "토너", serum: "세럼", cream: "크림" };
const day = 86_400_000;
const dateLabel = time => new Date(time).toLocaleDateString("ko-KR");
const emptyCheck = { used: [], reaction: "", source: "", feel: "", change: "" };
const basicContext = { basicOnly: true, isSensitive: true };

function readTrial(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Number.isFinite(data?.startedAt) && Number.isFinite(data?.level) && data.ids ? data : null;
  } catch {
    return null;
  }
}

export function BasicRoutineTrialScreen({ ownerKey, blocked, currentRoutine, personalProductFeedback, onHome }) {
  const heading = useScreenHeading("basic-routine-trial");
  const key = `dearsince:basic-routine-trial:v1:${ownerKey}`;
  const [trial, setTrial] = useState(() => readTrial(key));
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyCheck);
  const [saveError, setSaveError] = useState(false);
  const excludedIds = trial?.excludedIds ?? [];
  const context = { ...basicContext, personalProductFeedback };
  const avoidedIds = new Set([...excludedIds, ...(currentRoutine?.ownedProductIds ?? [])]);
  const level = trial?.level ?? 5;
  const products = trial
    ? Object.fromEntries(Object.entries(trial.ids).map(([slot, id]) => [slot, getProductById(id)]))
    : buildDynamicRoutine(level, context).products;
  const entries = Object.entries(products).filter(([, product]) => product);
  const latest = trial?.check;
  const irritation = latest?.reaction === "irritation";
  const early = latest?.stage === 7;
  const resultReady = latest?.stage === 14 && latest.used.length > 0 && !irritation;
  const nextLevel = !resultReady ? level : latest.feel === "dry" ? Math.max(1, level - 1)
    : latest.feel === "heavy" ? Math.min(10, level + 1) : level;
  const cream = products.cream;
  const adjustedCream = nextLevel !== level && cream && latest.used.includes("cream")
    ? getRankedProductCandidates("cream", nextLevel, { ...context, ownedProductIds: new Set([...excludedIds, cream.id]),
      observedSkin: { moisturizerUse: latest.feel === "dry" ? "persistent" : "heavy" } })
      .find(candidate => latest.feel === "dry" ? candidate.careProfile.hydrationSupport > cream.careProfile.hydrationSupport
        : candidate.careProfile.lightweightFit > cream.careProfile.lightweightFit)
    : null;
  const usedProducts = entries.filter(([slot]) => latest?.used.includes(slot));
  const reactionProducts = irritation
    ? usedProducts.filter(([slot]) => latest.source === "unknown" || latest.source === slot)
    : [];
  const actives = entries.flatMap(([, product]) => getIngredientFamilies(product));
  const cosmeticContext = {
    profile: { hydrationLevel: level, observationAssessment: { canRecommendBasics: true, canRecommendActives: true, isSensitive: true } },
    routine: { products }, personalProductFeedback,
    currentRoutine: { ...currentRoutine, currentFamilies: [...(currentRoutine?.currentFamilies ?? []), ...actives],
      ownedProductIds: new Set([...avoidedIds, ...entries.map(([, product]) => product.id)]) },
    serumHydrationLevel: products.serum?.hydrationLevel ?? level,
  };

  const save = next => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setTrial(next);
      setEditing(null);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  };
  const start = (nextProducts, nextBand, excluded = excludedIds) => save({
    excludedIds: excluded,
    startedAt: Date.now(), level: nextBand,
    history: trial ? [...(trial.history ?? []), { startedAt: trial.startedAt, ids: trial.ids, check: trial.check }].slice(-12) : [],
    ids: Object.fromEntries(Object.entries(nextProducts).map(([slot, product]) => [slot, product?.id ?? null])),
  });
  const open = stage => {
    setDraft({ ...emptyCheck, used: latest?.used ?? entries.map(([slot]) => slot), reaction: stage === "early" ? "irritation" : "" });
    setEditing(stage);
  };
  const enough = draft.used.length > 0 && (draft.reaction === "irritation" ? Boolean(draft.source)
    : draft.reaction === "comfortable" && (editing !== 14 || Boolean(draft.feel && draft.change)));

  return <div className="space-y-5">
    <section className="care-panel space-y-3">
      <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold text-forest-900">기초 4종으로 시작하기</h1>
      <p>클렌저, 토너, 세럼, 크림을 써보고 피부 반응에 따라 루틴을 조정해요. 토너는 세럼과 크림의 수분감을 가볍게 보완해요.</p>
      {blocked && <p>최근 피부 반응 기록을 먼저 확인해 주세요. 지금은 새 루틴 시작을 보류해요.</p>}
      {trial && <p className="text-sm text-slate-700">사용 시작 {dateLabel(trial.startedAt)} · 7일 확인 {dateLabel(trial.startedAt + day * 7)} · 14일 확인 {dateLabel(trial.startedAt + day * 14)}</p>}
    </section>

    {(!blocked || trial) && <RoutineProductScroller layout="routine" productsByCategory={products}
      optionalSlots={["toner"]} userContext={{ ...context, level }} />}
    {!trial && !blocked && entries.length === 4 && <button type="button" className="care-secondary" onClick={() => start(products, level)}>4종 사용 시작</button>}
    {!trial && !blocked && entries.length < 4 && <p>현재 추천 기준을 충족한 4종 세트가 없어 시작을 보류해요.</p>}

    {trial && !irritation && editing === null && <div className="flex flex-wrap gap-2">
      {!latest && Date.now() >= trial.startedAt + day * 7 && <button type="button" className="care-secondary" onClick={() => open(7)}>7일 사용감 확인</button>}
      {!resultReady && Date.now() >= trial.startedAt + day * 14 && <button type="button" className="care-secondary" onClick={() => open(14)}>14일 피부 변화 확인</button>}
      <button type="button" className="care-secondary" onClick={() => open("early")}>불편한 반응 기록</button>
    </div>}

    {editing !== null && <form className="care-panel space-y-4" onSubmit={event => {
      event.preventDefault();
      if (enough) save({ ...trial, check: { ...draft, stage: editing } });
    }}>
      <fieldset className="space-y-2">
        <legend className="font-bold">실제로 사용한 제품을 고르세요</legend>
        {entries.map(([slot, product]) => <label className="flex gap-2" key={slot}>
          <input type="checkbox" checked={draft.used.includes(slot)} onChange={() => setDraft(previous => ({
            ...previous, source: "", used: previous.used.includes(slot) ? previous.used.filter(item => item !== slot) : [...previous.used, slot],
          }))} />
          {slots[slot]} · {product.name}
        </label>)}
      </fieldset>
      {editing !== "early" && <label className="block font-semibold">
        새로운 따가움·붉어짐이 있었나요?
        <select className="mt-1 block rounded-lg border p-2" value={draft.reaction} onChange={event => setDraft({ ...draft, reaction: event.target.value })}>
          <option value="">선택하세요</option><option value="comfortable">없었어요</option><option value="irritation">있었어요</option>
        </select>
      </label>}
      {draft.reaction === "irritation" && <label className="block font-semibold">
        특정 제품을 바를 때 불편함이 반복됐나요?
        <select className="mt-1 block rounded-lg border p-2" value={draft.source} onChange={event => setDraft({ ...draft, source: event.target.value })}>
          <option value="">선택하세요</option><option value="unknown">여러 제품을 같이 써서 모르겠어요</option>
          {draft.used.map(slot => <option value={slot} key={slot}>{slots[slot]} · {products[slot].name}</option>)}
        </select>
      </label>}
      {editing === 14 && draft.reaction === "comfortable" && <label className="block font-semibold">
        사용 전보다 피부 사용감이 달라졌나요?
        <select className="mt-1 block rounded-lg border p-2" value={draft.change} onChange={event => setDraft({ ...draft, change: event.target.value })}>
          <option value="">선택하세요</option><option value="better">편해졌어요</option><option value="same">비슷해요</option>
          <option value="worse">불편해졌어요</option><option value="unknown">잘 모르겠어요</option>
        </select>
      </label>}
      {editing === 14 && draft.reaction === "comfortable" && <label className="block font-semibold">
        지금 루틴의 보습감은 어떤가요?
        <select className="mt-1 block rounded-lg border p-2" value={draft.feel} onChange={event => setDraft({ ...draft, feel: event.target.value })}>
          <option value="">선택하세요</option><option value="fits">당김도 무거움도 없이 편해요</option>
          <option value="dry">시간이 지나도 볼이나 얼굴이 당겨요</option><option value="heavy">당김은 없고 바른 뒤 무겁거나 번들거려요</option>
          <option value="mixed">볼은 당기고 이마·코는 번들거려요</option><option value="unknown">아직 판단하기 어려워요</option>
        </select>
      </label>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="care-secondary" disabled={!enough}>사용 반응 저장</button>
        <button type="button" className="care-secondary" onClick={() => setEditing(null)}>취소</button>
      </div>
    </form>}

    {irritation && <section className="care-panel space-y-2" aria-label="불편한 제품 확인">
      <h2 className="font-bold">{latest.source === "unknown" ? "새로 시작한 제품을 잠시 중단해요" : `${products[latest.source]?.name ?? "해당 제품"}을 우선 제외해요`}</h2>
      <p>사용 시점과 전성분을 함께 참고해요. 성분표만으로 불편의 원인을 확정하기는 어려워요.</p>
      {reactionProducts.map(([slot, product]) => <details key={slot}><summary className="font-semibold">{product.name} 전성분</summary>
        <p className="mt-1 text-sm">{product.fullIngredients?.join(", ")}</p>
        {getReactionIngredientClues(product.fullIngredients).map(clue => <p key={clue.family} className="text-sm">확인할 성분 · {clue.ingredient}</p>)}
      </details>)}
      {latest.source !== "unknown" && usedProducts.length > 1 && !blocked &&
        <button type="button" className="care-secondary" onClick={() => start(
          Object.fromEntries(usedProducts.filter(([slot]) => slot !== latest.source)),
          level, [...new Set([...excludedIds, ...reactionProducts.map(([, product]) => product.id)])],
        )}>불편함이 가라앉았어요 · 해당 제품 빼고 이어가기</button>}
    </section>}

    {early && !irritation && <p className="care-panel">7일 사용감을 저장했어요. 14일 확인에서 보습감과 남은 고민을 살펴봐요.</p>}
    {resultReady && <section className="care-panel space-y-3">
      <h2 className="font-bold">다음 루틴</h2>
      <p>{adjustedCream ? "써본 제품 중 편했던 단계는 유지하고 크림 한 가지만 비교해요."
        : latest.feel === "fits" ? "사용감이 편했던 제품은 유지해요."
        : latest.feel === "mixed" ? "당기는 볼에 크림을 중심으로 바르고, 번들거리는 이마·코에는 사용량을 줄여 사용감을 비교해요."
        : "현재 답변에 맞는 크림 교체를 보류하고 사용감을 조금 더 확인해요."}</p>
      {adjustedCream && !blocked && <>
        <RoutineProductScroller layout="routine" productsByCategory={{ cream: adjustedCream }} userContext={{ ...context, level: nextLevel }} />
        <button type="button" className="care-secondary" onClick={() => start({ ...products, cream: adjustedCream }, nextLevel)}>이 크림으로 다음 사용 시작</button>
      </>}
    </section>}
    {resultReady && latest.feel === "fits" && latest.change !== "worse" && latest.used.includes("serum") && !blocked &&
      <CosmeticAddOnSection key={trial.startedAt} context={cosmeticContext} initialAnswers={trial.cosmeticAnswers}
        onApply={answers => save({ ...trial, cosmeticAnswers: answers })}
        onUseCandidate={product => start({ ...products, serum: product }, level)} />}
    {trial?.history?.length > 0 && <details className="care-panel">
      <summary className="font-semibold">지난 루틴 사용 기록</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {[...trial.history].reverse().map(round => <li key={round.startedAt}>{dateLabel(round.startedAt)} · {
          Object.values(round.ids).map(id => getProductById(id)?.name).filter(Boolean).join(" · ")
        }</li>)}
      </ul>
    </details>}
    {saveError && <p role="alert">기록을 저장하지 못했어요. 브라우저 저장 공간을 확인한 뒤 다시 시도해 주세요.</p>}
    <button type="button" className="care-secondary" onClick={onHome}>처음으로</button>
  </div>;
}
