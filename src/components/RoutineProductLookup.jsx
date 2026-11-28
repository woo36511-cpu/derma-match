import { ProductPhoto } from "./ProductPhoto";
import { CopyProductName } from "./CopyProductName";
import { BrandDiscoveryRequest } from "./BrandDiscoveryRequest";
import { readOfficialFormula } from "../services/officialCosmetics";
import { useRef, useState } from "react";
import { CurrentRoutineReview, useCurrentRoutine } from "./CurrentRoutineReview";
import { CURRENT_ROUTINE_LIMIT, getReviewedRoutineProduct, makeCurrentRoutineEntry, makeManualRoutineEntry } from "../utils/currentRoutineReview";
import { DetailDisclosure } from "./DetailDisclosure";
import { routineLookupCategories, routineLookupCount, searchRoutineProducts } from "../utils/routineLookup";
import { ProductReviewHistory, ProductReviewRequest } from "./ProductReviewRequest";

export function RoutineProductLookup({ ownerKey = "guest", profile, savedAt, safetyBlocked = false, onStartSurvey, loading = false, currentRoutine, personalProductFeedback, categoryChoices }) {
  if (loading) return <p className="rounded-2xl bg-white p-4 text-sm text-slate-700" role="status">이 기기의 내 루틴을 확인하고 있어요.</p>;
  const props = { ownerKey, profile, savedAt, safetyBlocked, onStartSurvey, personalProductFeedback, categoryChoices };
  return currentRoutine ? <RoutineLookupContent key={ownerKey} {...props} routine={currentRoutine} />
    : <StandaloneRoutineLookup key={ownerKey} {...props} />;
}

function StandaloneRoutineLookup(props) {
  const routine = useCurrentRoutine(props.ownerKey);
  return <RoutineLookupContent {...props} routine={routine} />;
}

function RoutineLookupContent({ ownerKey, profile, savedAt, safetyBlocked, onStartSurvey, routine, personalProductFeedback, categoryChoices }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [allInOneOnly, setAllInOneOnly] = useState(false);
  const [manualCategory, setManualCategory] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const categoryKeys = categoryChoices && Object.keys(categoryChoices);
  const selectedCategory = categoryKeys?.includes(searchCategory) ? searchCategory : "";
  const reviewRef = useRef(null);
  const isFull = routine.entries.length >= CURRENT_ROUTINE_LIMIT;
  const chosenManualCategory = selectedCategory || (categoryKeys && !categoryKeys.includes(manualCategory) ? "" : manualCategory);
  const manual = makeManualRoutineEntry(query, chosenManualCategory);
  const { matches, total } = searchRoutineProducts(query, visibleCount, allInOneOnly, selectedCategory ? [selectedCategory] : categoryKeys);
  const started = query.normalize("NFKC").replace(/[^\p{L}\p{N}]/gu, "").length >= 2;
  const hasFilters = Boolean(selectedCategory || allInOneOnly);
  const unfilteredTotal = started && total === 0 ? searchRoutineProducts(query, 1, false, categoryKeys).total : 0;
  const brandDiscoveryAvailable = started && total === 0 && !searchRoutineProducts(query, 1).total;
  const clearFilters = () => { setSearchCategory(""); setAllInOneOnly(false); setVisibleCount(12); };
  const signedIn = ownerKey.startsWith("account:");
  const exactReviewed = manual && getReviewedRoutineProduct(manual);
  const manualAdded = manual && routine.entries.some(entry => entry.id === manual.id);
  const manualForm = <>
      <p>{selectedCategory ? `입력한 제품의 종류는 ${categoryChoices[selectedCategory]}예요.` : "입력한 제품명으로 담으려면 종류만 골라주세요."}</p>
      {!selectedCategory && <label className="mt-2 block font-semibold">제품 종류
        <select value={chosenManualCategory} onChange={event => setManualCategory(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white p-2">
          <option value="">고르기</option>
          {Object.entries(categoryChoices ?? routineLookupCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>}
      <button type="button" disabled={!manual || isFull || manualAdded} onClick={() => manual && routine.add(manual)}
        className="mt-2 rounded-lg border border-emerald-700 px-3 py-2 font-semibold text-emerald-800 disabled:border-slate-200 disabled:text-slate-500">
        {manualAdded ? "내 루틴에 담음" : "입력한 제품 담기"}
      </button>
      {exactReviewed ? <p className="mt-2 text-sm">이미 검수된 제품이에요 · {exactReviewed.label}</p>
        : signedIn ? <ProductReviewRequest key={manual?.id ?? "manual"} product={manual} />
          : <p className="mt-2 text-xs text-slate-600">로그인하면 국내 전성분과 보습감 검수를 요청할 수 있어요.</p>}
    </>;
  return <section aria-labelledby="routine-lookup-title" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
    <div>
      <h3 id="routine-lookup-title" className="text-lg font-bold">지금 쓰는 화장품 찾기</h3>
      <p className="mt-1 text-sm text-slate-600">등록된 {routineLookupCount}개 중 제품을 찾아 담고, 실제 사용 반응을 기준으로 유지할 것과 점검할 것을 나눠봐요.</p>
      <p className="mt-1 text-xs text-slate-600">국내 공식 전성분이 제품명과 용량에 정확히 일치하면 설문에 함께 반영해요.</p>
    </div>
    <div ref={reviewRef}><CurrentRoutineReview {...{ routine, profile, savedAt, safetyBlocked, onStartSurvey, personalProductFeedback }} /></div>
    {isFull && <p className="text-sm text-slate-600">최대 {CURRENT_ROUTINE_LIMIT}개까지 담을 수 있어요. 더 담으려면 지금 쓰지 않는 제품을 빼주세요.</p>}
    {categoryChoices && <div role="group" aria-label="찾을 제품 종류" className="flex flex-wrap gap-2">
      {[["", "전체"], ...Object.entries(categoryChoices)].map(([value, label]) => (
        <button key={value} type="button" aria-pressed={selectedCategory === value}
          onClick={() => { setSearchCategory(value); setAllInOneOnly(false); setManualCategory(""); setVisibleCount(12); }}
          className={`care-secondary ${selectedCategory === value ? "border-forest-700 bg-forest-50" : ""}`}>{label}</button>
      ))}
    </div>}
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="routine-lookup-input" className="text-sm font-semibold">브랜드나 제품명</label>
        {routine.entries.length > 0 && <button type="button" onClick={() => reviewRef.current?.scrollIntoView?.({ block: "start" })}
          className="text-xs font-semibold text-emerald-800 underline underline-offset-2">담은 제품 보기 ({routine.entries.length}개)</button>}
      </div>
      <input id="routine-lookup-input" type="search" maxLength={100} value={query} onChange={event => { setQuery(event.target.value); setVisibleCount(12); }}
        placeholder={selectedCategory ? `브랜드나 ${categoryChoices[selectedCategory]} 이름` : "예: 독도 클렌징 밀크"} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700" />
    </div>
    <button type="button" aria-pressed={allInOneOnly} onClick={() => { setAllInOneOnly(value => !value); setVisibleCount(12); }} className={`care-secondary ${allInOneOnly ? "border-forest-700 bg-forest-50" : ""}`}>올인원</button>
    <p role="status" className="text-sm text-slate-600">
      {!started && !allInOneOnly ? "두 글자 이상 입력해요." : total === 0
        ? "일치하는 제품이 없어요. 이름을 직접 담거나 공식 자료를 찾아 검수를 요청할 수 있어요."
        : `${total}개 찾았어요.${total > matches.length ? ` ${matches.length}개 표시 중이에요.` : ""}`}
    </p>
    {hasFilters && unfilteredTotal > 0 && <button type="button" className="care-secondary" onClick={clearFilters}>필터 해제하고 {unfilteredTotal}개 보기</button>}
    {!!matches.length && <ul className="grid gap-3 sm:grid-cols-2">
      {matches.map(product => {
        const added = routine.entries.some(entry => entry.id === product.id);
        const reviewed = getReviewedRoutineProduct(product);
        const actionName = product.listingOnly && product.volume ? `${product.name} ${product.volume}` : product.name;
        return <li key={product.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3">
        <ProductPhoto product={product} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-xl bg-slate-50 object-contain" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-600">{routineLookupCategories[product.category]}{product.allInOne && " · 올인원"}{product.volume && ` · ${product.volume}`}</p>
          <p className="mt-1 break-keep text-sm font-semibold text-slate-950">{product.name}</p>
          <p className="mt-1 text-xs text-slate-600">{(product.formulaVerified || readOfficialFormula(null, product)) ? "국내 전성분 확인됨" : product.listingOnly ? (product.sourceMarket === "US" ? "미국 공식 목록 확인 · 전성분 검수 전" : "국내 공식 목록 확인 · 전성분 검수 전") : "전성분 검수 전"}</p>
          {reviewed && <p className="mt-1 text-xs text-slate-700">{reviewed.label}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" disabled={added || isFull} aria-label={`${actionName} ${added ? "내 루틴에 담음" : "내 루틴에 담기"}`}
              onClick={() => routine.add(makeCurrentRoutineEntry(product))}
              className="rounded-lg bg-emerald-900 px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-100 disabled:text-slate-600">
              {added ? "내 루틴에 담음" : "내 루틴에 담기"}
            </button>
            <CopyProductName name={product.name} />
            {product.officialUrl && <a href={product.officialUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-800 underline underline-offset-2">공식 제품 정보</a>}
          </div>
          {signedIn && !reviewed && <DetailDisclosure title="이 제품 검수 요청" className="mt-2">
            <ProductReviewRequest product={product} source={product.officialUrl ?? ""} />
          </DetailDisclosure>}
        </div>
      </li>;
      })}
    </ul>}
    {total > matches.length && <button type="button" className="care-secondary" onClick={() => setVisibleCount(count => count + 12)}>제품 더 보기</button>}
    {started && (total === 0
      ? <section className="space-y-2 rounded-2xl border border-emerald-700 p-4 text-sm" aria-label="목록에 없는 제품 직접 추가">
        <h4 className="font-semibold">목록에 없는 제품 직접 추가</h4>
        {manualForm}
      </section>
      : <DetailDisclosure title="목록에 없는 제품 직접 추가">{manualForm}</DetailDisclosure>)}
    {brandDiscoveryAvailable && <BrandDiscoveryRequest key={query.trim()} query={query.trim()} />}
    {signedIn && <ProductReviewHistory />}
  </section>;
}
