import { PrimaryButton } from "../components/PrimaryButton";
import { reviewedSunscreen } from "../data/reviewedSunscreen";
import { RoutineRecheckNotice } from "../components/RoutineRecheckNotice";
import { useState } from "react";
import { dateLabel, day, getTrialProduct, trialSunscreen } from "../utils/basicTrialProducts";
import { useBasicRoutineTrial } from "../hooks/useBasicRoutineTrial";
import { TrialSyncStatus } from "../components/BasicRoutineResume";
import { ProductCard } from "../components/ProductCard";
import { CosmeticAddOnSection } from "../components/CosmeticAddOnSection";
import { GuidedFacePhoto } from "../components/GuidedFacePhoto";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { buildDynamicRoutine, getRankedProductCandidates } from "../utils/routineRecommendation";
import { getIngredientFamilies } from "../utils/ingredientCompatibility";
import { getReactionIngredientClues, getReactionIngredientFit } from "../utils/reactionIngredientFit";
import { useScreenHeading } from "../hooks/useScreenHeading";

const slots = { cleanser: "클렌저", toner: "토너", serum: "세럼", cream: "크림", sunscreen: "선크림" };
const emptyCheck = { used: [], reaction: "", source: "", changed: [], feel: "", fitSlot: "", change: "" };
const basicContext = { basicOnly: true, isSensitive: true };

export function BasicRoutineTrialScreen({ trialStore, ...props }) {
  return trialStore ? <BasicRoutineTrialContent {...props} trialStore={trialStore} />
    : <LocalBasicRoutineTrial {...props} />;
}

function LocalBasicRoutineTrial(props) {
  const trialStore = useBasicRoutineTrial(props.ownerKey);
  return <BasicRoutineTrialContent {...props} trialStore={trialStore} />;
}

function BasicRoutineTrialContent({ trialStore, blocked, currentRoutine, personalProductFeedback, onHome }) {
  const heading = useScreenHeading("basic-routine-trial");
  const { trial } = trialStore;
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyCheck);
  const [saveError, setSaveError] = useState(false);
  const excludedIds = trial?.excludedIds ?? [];
  const reactionIngredientFamilies = trial?.reactionIngredientFamilies ?? [];
  const context = { ...basicContext, personalProductFeedback, reactionIngredientFamilies };
  const isReplacementAllowed = product => !excludedIds.includes(product.id) && (
    !reactionIngredientFamilies.length || (product.evidence?.domesticFormulaVerified &&
      product.evidence?.fullIngredientsVerified && product.fullIngredients?.length &&
      getReactionIngredientFit(product, context) === 0)
  );
  const avoidedIds = new Set([...excludedIds, ...(currentRoutine?.ownedProductIds ?? [])]);
  const level = trial?.level ?? 5;
  const products = trial
    ? Object.fromEntries(Object.entries(trial.ids).map(([slot, id]) => [slot, getTrialProduct(id)]))
    : { ...buildDynamicRoutine(level, context).products, sunscreen: trialSunscreen };
  const entries = Object.entries(products).filter(([, product]) => product);
  const latest = trial?.check;
  const irritation = latest?.reaction === "irritation";
  const early = latest?.stage === 7;
  const resultReady = latest?.stage === 14 && latest.used.length > 0 && !irritation;
  const nextLevel = !resultReady ? level : latest.feel === "dry" ? Math.max(1, level - 1)
    : latest.feel === "heavy" ? Math.min(10, level + 1) : level;
  const fitSlot = latest?.fitSlot || "cream";
  const fitProduct = products[fitSlot];
  const alternateSunscreen = !avoidedIds.has(reviewedSunscreen.id) && !reviewedSunscreen.formulaFamilies.some(family => reactionIngredientFamilies.includes(family))
    ? reviewedSunscreen : null;
  const adjustedBase = nextLevel !== level && fitProduct?.careProfile && latest.used.includes(fitSlot)
    ? getRankedProductCandidates(fitSlot, nextLevel, { ...context,
      ownedProductIds: new Set([...avoidedIds, fitProduct.id]),
      observedSkin: { moisturizerUse: latest.feel === "dry" ? "persistent" : "heavy" } })
      .filter(isReplacementAllowed)
      .find(candidate => latest.feel === "dry" ? candidate.careProfile.hydrationSupport > fitProduct.careProfile.hydrationSupport
        : candidate.careProfile.lightweightFit > fitProduct.careProfile.lightweightFit)
    : null;
  const adjustedProduct = resultReady && fitSlot === "sunscreen" && latest.feel === "heavy" && latest.used.includes(fitSlot) &&
    fitProduct?.id === trialSunscreen.id ? alternateSunscreen : adjustedBase;
  const usedProducts = entries.filter(([slot]) => latest?.used.includes(slot));
  const reactionProducts = irritation
    ? usedProducts.filter(([slot]) => latest.changed?.length ? latest.changed.includes(slot) : latest.source === "unknown" || latest.source === slot)
    : [];
  const comparison = reactionProducts.length === 1 && !blocked ? reactionProducts.flatMap(([slot, original]) => {
    if (slot === "sunscreen") return alternateSunscreen && original.id !== alternateSunscreen.id ? [[slot, alternateSunscreen]] : [];
    const hydration = original.hydrationLevel ?? level;
    const candidate = getRankedProductCandidates(slot, hydration, {
      ...context,
      ownedProductIds: new Set(entries.map(([, product]) => product.id)),
    }).filter(product => product.id !== original.id && product.beginnerFriendly &&
      product.evidence?.domesticFormulaVerified && product.evidence?.fullIngredientsVerified &&
      product.fullIngredients?.length && isReplacementAllowed(product) &&
      Math.abs((product.hydrationLevel ?? level) - hydration) <= 1 &&
      !getReactionIngredientClues(product.fullIngredients).some(clue => clue.family === "fragrance"))
      .sort((a, b) => Math.abs((a.hydrationLevel ?? level) - hydration) -
        Math.abs((b.hydrationLevel ?? level) - hydration))[0];
    return candidate ? [[slot, candidate]] : [];
  }) : [];
  const actives = entries.flatMap(([, product]) => getIngredientFamilies(product));
  const cosmeticContext = {
    profile: { hydrationLevel: level, observationAssessment: { canRecommendBasics: true, canRecommendActives: true, isSensitive: true } },
    routine: { products }, personalProductFeedback,
    currentRoutine: { ...currentRoutine, currentFamilies: [...(currentRoutine?.currentFamilies ?? []), ...actives],
      ownedProductIds: new Set([...avoidedIds, ...entries.map(([, product]) => product.id)]) },
    serumHydrationLevel: products.serum?.hydrationLevel ?? level,
  };

  const save = next => {
    if (trialStore.save(next)) {
      setEditing(null);
      setSaveError(false);
    } else {
      setSaveError(true);
    }
  };
  const start = (nextProducts, nextBand, excluded = excludedIds) => save({
    excludedIds: excluded,
    reactionIngredientFamilies,
    startedAt: Date.now(), level: nextBand,
    history: trial ? [...(trial.history ?? []), { startedAt: trial.startedAt, ids: trial.ids, check: trial.check }].slice(-12) : [],
    ids: Object.fromEntries(Object.entries(nextProducts).map(([slot, product]) => [slot, product?.id ?? null])),
  });
  const saveCheck = () => {
    const changed = draft.changed.filter(slot => draft.used.includes(slot));
    const source = changed.length === 1 ? changed[0] : "unknown";
    const check = { ...draft, stage: editing, source };
    if (check.reaction !== "irritation") {
      save({ ...trial, check });
      return;
    }
    const flagged = entries.filter(([slot]) => check.used.includes(slot) &&
      (changed.length ? changed.includes(slot) : check.source === "unknown" || check.source === slot));
    const clues = flagged.flatMap(([, product]) => getReactionIngredientClues(product.fullIngredients));
    save({
      ...trial, check,
      excludedIds: [...new Set([...excludedIds, ...flagged.map(([, product]) => product.id)])],
      reactionIngredientFamilies: [...new Set([...reactionIngredientFamilies, ...clues.map(clue => clue.family)])],
    });
  };
  const open = stage => {
    setDraft({ ...emptyCheck, used: latest?.used ?? entries.map(([slot]) => slot), reaction: stage === "early" ? "irritation" : "" });
    setEditing(stage);
  };
  const enough = draft.used.length > 0 && (draft.reaction === "irritation" ? true
    : draft.reaction === "comfortable" && (editing !== 14 || Boolean(draft.feel && draft.change)));

  if (!trial && ["loading", "conflict"].includes(trialStore.status)) return <TrialSyncStatus store={trialStore} />;

  return <div className="space-y-5">
    <section className="care-panel space-y-3">
      <h1 ref={heading} tabIndex={-1} className="text-2xl font-bold text-forest-900">모든 게 귀찮은 분들을 위해</h1>
      <p>클렌저, 토너, 세럼, 크림으로 관리하고 아침에는 선크림까지 써봐요. 사용 후 불편했던 단계부터 한 가지씩 조정해요.</p>
      {blocked && <p>최근 피부 반응 기록이 있어요. 자극이 계속되는 동안에는 새 제품 사용을 미뤄요.</p>}
      {!trial && entries.length === 5 && <div className="space-y-2">
        <PrimaryButton onClick={() => start(products, level)}>추천 루틴 기록하기</PrimaryButton>
        <p className="text-sm text-slate-700">추천 제품 5개와 오늘 날짜를 저장해요. 홈의 ‘내 루틴 이어하기’에서 다시 볼 수 있어요.</p>
      </div>}
      {trial && <p className="text-sm text-slate-700">사용 시작 {dateLabel(trial.startedAt)} · 7일 확인 {dateLabel(trial.startedAt + day * 7)} · 재검사 예정 {dateLabel(trial.startedAt + day * 14)}</p>}
    </section>

    <TrialSyncStatus store={trialStore} />
    <RoutineProductScroller layout="routine" productsByCategory={Object.fromEntries(entries.filter(([slot]) =>
      slot !== "sunscreen" && (!irritation || (latest.used.includes(slot) && !reactionProducts.some(([flaggedSlot]) => flaggedSlot === slot))),
    ))}
      optionalSlots={["toner"]} userContext={{ ...context, level }} />
    {products.sunscreen && (!irritation || (latest.used.includes("sunscreen") && !reactionProducts.some(([slot]) => slot === "sunscreen"))) &&
      <ProductCard categoryKey="sunscreen" product={products.sunscreen} step={5} />}
    {!trial && entries.length === 5 && !blocked && <RoutineRecheckNotice />}
    {!trial && entries.length < 5 && <p>현재 추천 기준을 충족한 5단계 세트가 없어 시작을 보류해요.</p>}

    {trial && !irritation && editing === null && <div className="flex flex-wrap gap-2">
      {!latest && Date.now() >= trial.startedAt + day * 7 && <button type="button" className="care-secondary" onClick={() => open(7)}>7일 사용감 확인</button>}
      {!resultReady && Date.now() >= trial.startedAt + day * 14 && <button type="button" className="care-secondary" onClick={() => open(14)}>14일 재검사</button>}
      <button type="button" className="care-secondary" onClick={() => open("early")}>불편한 반응 기록</button>
    </div>}

    {editing !== null && <form className="care-panel space-y-4" onSubmit={event => {
      event.preventDefault();
      if (enough) saveCheck();
    }}>
      <fieldset className="space-y-2">
        <legend className="font-bold">실제로 사용한 제품을 고르세요</legend>
        {entries.map(([slot, product]) => <label className="flex gap-2" key={slot}>
          <input type="checkbox" checked={draft.used.includes(slot)} onChange={() => setDraft(previous => ({
            ...previous, fitSlot: previous.fitSlot === slot ? "" : previous.fitSlot, changed: previous.changed.filter(item => item !== slot), used: previous.used.includes(slot) ? previous.used.filter(item => item !== slot) : [...previous.used, slot],
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
      {draft.reaction === "irritation" && <>
        <fieldset className="space-y-2">
          <legend className="font-semibold">불편해지기 전에 새로 쓰거나 사용량을 늘린 제품이 있나요?</legend>
          <p className="text-sm">기억나는 제품만 체크해요. 잘 모르겠으면 체크 없이 저장할 수 있어요.</p>
          {draft.used.map(slot => <label key={slot} className="flex gap-2">
            <input type="checkbox" checked={draft.changed.includes(slot)} onChange={() => setDraft(previous => ({
              ...previous, changed: previous.changed.includes(slot)
                ? previous.changed.filter(item => item !== slot) : [...previous.changed, slot],
            }))} />
            {products[slot].name}
          </label>)}
        </fieldset>
        <GuidedFacePhoto />
      </>}
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
      {editing === 14 && draft.reaction === "comfortable" && ["dry", "heavy"].includes(draft.feel) &&
        <label className="block font-semibold">
          어느 단계부터 비교해볼까요?
          <select className="mt-1 block rounded-lg border p-2" value={draft.fitSlot} onChange={event => setDraft({ ...draft, fitSlot: event.target.value })}>
            <option value="">잘 모르겠어요 · 크림부터 확인</option>
            {draft.used.map(slot => <option key={slot} value={slot}>{slots[slot]}</option>)}
          </select>
        </label>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="care-secondary" disabled={!enough}>사용 반응 저장</button>
        <button type="button" className="care-secondary" onClick={() => setEditing(null)}>취소</button>
      </div>
    </form>}

    {irritation && <section className="care-panel space-y-2" aria-label="불편한 제품 확인">
      <h2 className="font-bold">{latest.source === "unknown" ? "새로 시작한 제품을 잠시 중단해요" : `${products[latest.source]?.name ?? "해당 제품"}을 우선 제외해요`}</h2>
      <p>불편했던 제품은 추천에서 잠시 제외해요. 아래 성분은 확인할 후보이며, 이 기록만으로 알레르기 원인을 확정하기는 어려워요.</p>
      {latest.changed?.length > 0 && <p>불편해지기 전에 새로 쓰거나 사용량을 늘린 제품을 먼저 제외했어요.</p>}
      {reactionProducts.map(([slot, product]) => <details key={slot}><summary className="font-semibold">{product.name} 전성분</summary>
        <p className="mt-1 text-sm">{product.fullIngredients?.length ? product.fullIngredients.join(", ") : "비교에 사용할 전성분 정보가 등록되어 있지 않아요."}</p>
        {getReactionIngredientClues(product.fullIngredients).map(clue => <p key={clue.family} className="text-sm">확인할 성분 · {clue.ingredient}</p>)}
      </details>)}
      {comparison.length > 0 && <div className="space-y-3">
        <h3 className="font-semibold">피부가 편해진 뒤 비교할 대체품</h3>
        {comparison[0][0] === "sunscreen"
          ? <p>다른 선크림이에요. 제품마다 사용 반응은 다를 수 있어요. <a className="underline" href={reviewedSunscreen.ingredientDisclosure} target="_blank" rel="noreferrer">국내 판매처 전성분 고시</a></p>
          : <p>같은 단계에서 보습감이 비슷하고, 확인 가능한 전성분에 향료와 이번에 표시한 성분 계열이 없는 후보예요.</p>}
        <RoutineProductScroller layout="routine" productsByCategory={Object.fromEntries(comparison)} userContext={context} />
        <button type="button" className="care-secondary" onClick={() => start(
          Object.fromEntries(usedProducts.map(([slot, product]) => [slot, slot === comparison[0][0] ? comparison[0][1] : product])),
          level,
        )}>불편함이 가라앉았어요 · 대체품으로 이어가기</button>
      </div>}
      {reactionProducts.length === 1 && !comparison.length && <p>보습감과 전성분 기준을 모두 충족한 대체품을 찾지 못했어요.</p>}
      {latest.source !== "unknown" && usedProducts.length > 1 && !blocked &&
        <button type="button" className="care-secondary" onClick={() => start(
          Object.fromEntries(usedProducts.filter(([slot]) => slot !== latest.source)),
          level, [...new Set([...excludedIds, ...reactionProducts.map(([, product]) => product.id)])],
        )}>불편함이 가라앉았어요 · 해당 제품 빼고 이어가기</button>}
    </section>}

    {early && !irritation && <p className="care-panel">7일 사용감을 저장했어요. 14일 확인에서 보습감과 남은 고민을 살펴봐요.</p>}
    {resultReady && <section className="care-panel space-y-3">
      <h2 className="font-bold">다음 루틴</h2>
      {!blocked && <p className="text-sm text-slate-700">다음 루틴 사용을 시작하면 14일 뒤에 재검사해요.</p>}
      <p>{adjustedProduct?.id === reviewedSunscreen.id ? "브랜드가 촉촉하고 끈적임이 적다고 안내한 다른 선크림을 비교해요." : adjustedProduct ? (latest.feel === "dry" ? `지금보다 보습감이 높은 ${slots[fitSlot]}을 비교해요.`
        : `지금보다 가벼운 ${slots[fitSlot]}을 비교해요.`)
        : latest.feel === "fits" ? "사용감이 편했던 제품은 유지해요."
        : latest.feel === "mixed" ? "당기는 볼에 크림을 중심으로 바르고, 번들거리는 이마·코에는 사용량을 줄여 사용감을 비교해요."
        : `현재 답변에 맞는 ${slots[fitSlot]} 후보를 찾지 못했어요. 사용감을 조금 더 확인해요.`}</p>
      {adjustedProduct && !blocked && <>
        <RoutineProductScroller layout="routine" productsByCategory={{ [fitSlot]: adjustedProduct }} userContext={{ ...context, level: nextLevel }} />
        <button type="button" className="care-secondary" onClick={() => start({ ...products, [fitSlot]: adjustedProduct }, fitSlot === "sunscreen" ? level : nextLevel)}>이 제품으로 다음 사용 시작</button>
      </>}
      {!adjustedProduct && !blocked && <button type="button" className="care-secondary" onClick={() => start(products, level)}>
        같은 루틴으로 한 번 더 기록하기
      </button>}
    </section>}
    {resultReady && latest.feel === "fits" && latest.change !== "worse" && latest.used.includes("serum") && !blocked &&
      <CosmeticAddOnSection key={trial.startedAt} context={{ ...cosmeticContext, allowProduct: isReplacementAllowed }} initialAnswers={trial.cosmeticAnswers}
        onApply={answers => save({ ...trial, cosmeticAnswers: answers })}
        onUseCandidate={product => start({ ...products, serum: product }, level)} />}
    {trial?.history?.length > 0 && <details className="care-panel">
      <summary className="font-semibold">지난 루틴 사용 기록</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {[...trial.history].reverse().map(round => <li key={round.startedAt}>{dateLabel(round.startedAt)} · {
          Object.values(round.ids).map(id => getTrialProduct(id)?.name).filter(Boolean).join(" · ")
        }</li>)}
      </ul>
    </details>}
    {saveError && <p role="alert">기록을 저장하지 못했어요. 계정 기록 동기화를 확인한 뒤 다시 시도해 주세요.</p>}
    <button type="button" className="care-secondary" onClick={onHome}>처음으로</button>
  </div>;
}
