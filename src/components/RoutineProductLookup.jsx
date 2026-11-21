import { readOfficialFormula } from "../services/officialCosmetics";
import { useRef, useState } from "react";
import { CurrentRoutineReview, useCurrentRoutine } from "./CurrentRoutineReview";
import { CURRENT_ROUTINE_LIMIT, getReviewedRoutineProduct, makeCurrentRoutineEntry, makeManualRoutineEntry } from "../utils/currentRoutineReview";
import { DetailDisclosure } from "./DetailDisclosure";
import { routineLookupCategories, routineLookupCount, searchRoutineProducts } from "../utils/routineLookup";
import { ProductReviewHistory, ProductReviewRequest } from "./ProductReviewRequest";
import { getOfficialIngredientSearchUrl } from "../services/productReviewRequests";

function LookupImage({ src }) {
  const [failed, setFailed] = useState(false);
  return src && !failed
    ? <img src={src} alt="" width="64" height="64" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-16 w-16 shrink-0 rounded-xl bg-white object-contain" />
    : <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">사진 없음</span>;
}

export function RoutineProductLookup({ ownerKey = "guest", profile, savedAt, safetyBlocked = false, onStartSurvey, loading = false, currentRoutine, personalProductFeedback }) {
  if (loading) return <p className="rounded-2xl bg-white p-4 text-sm text-slate-700" role="status">이 기기의 내 루틴을 확인하고 있어요.</p>;
  const props = { ownerKey, profile, savedAt, safetyBlocked, onStartSurvey, personalProductFeedback };
  return currentRoutine ? <RoutineLookupContent key={ownerKey} {...props} routine={currentRoutine} />
    : <StandaloneRoutineLookup key={ownerKey} {...props} />;
}

function StandaloneRoutineLookup(props) {
  const routine = useCurrentRoutine(props.ownerKey);
  return <RoutineLookupContent {...props} routine={routine} />;
}

function RoutineLookupContent({ ownerKey, profile, savedAt, safetyBlocked, onStartSurvey, routine, personalProductFeedback }) {
  const [query, setQuery] = useState("");
  const [allInOneOnly, setAllInOneOnly] = useState(false);
  const [manualCategory, setManualCategory] = useState("");
  const reviewRef = useRef(null);
  const isFull = routine.entries.length >= CURRENT_ROUTINE_LIMIT;
  const manual = makeManualRoutineEntry(query, manualCategory);
  const { matches, total } = searchRoutineProducts(query, 12, allInOneOnly);
  const started = query.normalize("NFKC").replace(/[^\p{L}\p{N}]/gu, "").length >= 2;
  const signedIn = ownerKey.startsWith("account:");
  const exactReviewed = manual && getReviewedRoutineProduct(manual);
  return <section aria-labelledby="routine-lookup-title" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
    <div>
      <h3 id="routine-lookup-title" className="text-lg font-bold">지금 쓰는 화장품 찾기</h3>
      <p className="mt-1 text-sm text-slate-600">등록된 {routineLookupCount}개 중 제품을 찾아 담고, 실제 사용 반응을 기준으로 유지할 것과 점검할 것을 나눠봐요.</p>
      <p className="mt-1 text-xs text-slate-600">국내 공식 전성분이 제품명과 용량에 정확히 일치하면 설문에 함께 반영해요.</p>
    </div>
    <div ref={reviewRef}><CurrentRoutineReview {...{ routine, profile, savedAt, safetyBlocked, onStartSurvey, personalProductFeedback }} /></div>
    {isFull && <p className="text-sm text-slate-600">최대 {CURRENT_ROUTINE_LIMIT}개까지 담을 수 있어요. 더 담으려면 지금 쓰지 않는 제품을 빼주세요.</p>}
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="routine-lookup-input" className="text-sm font-semibold">브랜드나 제품명</label>
        {routine.entries.length > 0 && <button type="button" onClick={() => reviewRef.current?.scrollIntoView?.({ block: "start" })}
          className="text-xs font-semibold text-emerald-800 underline underline-offset-2">담은 제품 보기 ({routine.entries.length}개)</button>}
      </div>
      <input id="routine-lookup-input" type="search" maxLength={100} value={query} onChange={event => setQuery(event.target.value)}
        placeholder="예: 독도 클렌징 밀크" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700" />
    </div>
    <button type="button" aria-pressed={allInOneOnly} onClick={() => setAllInOneOnly(value => !value)} className={`care-secondary ${allInOneOnly ? "border-forest-700 bg-forest-50" : ""}`}>올인원</button>
    <p role="status" className="text-sm text-slate-600">
      {!started && !allInOneOnly ? "두 글자 이상 입력해요." : total === 0
        ? "일치하는 제품이 없어요. 이름을 직접 담거나 공식 자료를 찾아 검수를 요청할 수 있어요."
        : `${total}개 찾았어요.${total > matches.length ? ` 앞의 ${matches.length}개만 표시해요. 제품명을 더 입력해보세요.` : ""}`}
    </p>
    {!!matches.length && <ul className="grid gap-3 sm:grid-cols-2">
      {matches.map(product => {
        const added = routine.entries.some(entry => entry.id === product.id);
        const reviewed = getReviewedRoutineProduct(product);
        const actionName = product.listingOnly && product.volume ? `${product.name} ${product.volume}` : product.name;
        return <li key={product.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3">
        <LookupImage key={product.image} src={product.image} />
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
            {product.officialUrl && <a href={product.officialUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-800 underline underline-offset-2">공식 제품 정보</a>}
          </div>
          {signedIn && !reviewed && <DetailDisclosure title="이 제품 검수 요청" className="mt-2">
            <ProductReviewRequest product={product} source={product.officialUrl ?? ""} />
          </DetailDisclosure>}
        </div>
      </li>;
      })}
    </ul>}
    {started && <DetailDisclosure title="목록에 없는 제품 직접 추가">
      <p>위 검색창에 포장에 적힌 제품명을 입력하고 종류를 골라주세요. 검수 전에는 사용감으로 설문을 이어갈 수 있어요.</p>
      <a className="mt-2 inline-block font-semibold text-emerald-800 underline underline-offset-2" href={getOfficialIngredientSearchUrl(query.trim())} target="_blank" rel="noreferrer">공식 전성분 자료 검색하기</a>
      <label className="mt-2 block font-semibold">제품 종류
        <select value={manualCategory} onChange={event => setManualCategory(event.target.value)} className="ml-2 rounded-lg border border-slate-300 bg-white p-2">
          <option value="">고르기</option>
          {Object.entries(routineLookupCategories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
      <button type="button" disabled={!manual || isFull || routine.entries.some(entry => entry.id === manual.id)} onClick={() => manual && routine.add(manual)}
        className="mt-2 rounded-lg border border-emerald-700 px-3 py-2 font-semibold text-emerald-800 disabled:border-slate-200 disabled:text-slate-500">
        입력한 제품 담기
      </button>
      {exactReviewed ? <p className="mt-2 text-sm">이미 검수된 제품이에요 · {exactReviewed.label}</p>
        : signedIn ? <ProductReviewRequest key={manual?.id ?? "manual"} product={manual} />
          : <p className="mt-2 text-xs text-slate-600">로그인하면 국내 전성분과 보습감 검수를 요청할 수 있어요.</p>}
    </DetailDisclosure>}
    {signedIn && <ProductReviewHistory />}
  </section>;
}
