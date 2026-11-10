import { useState } from "react";
import { routineLookupCategories, routineLookupCount, searchRoutineProducts } from "../utils/routineLookup";

function LookupImage({ src }) {
  const [failed, setFailed] = useState(false);
  return src && !failed
    ? <img src={src} alt="" width="64" height="64" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-16 w-16 shrink-0 rounded-xl bg-white object-contain" />
    : <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">사진 없음</span>;
}

export function RoutineProductLookup() {
  const [query, setQuery] = useState("");
  const { matches, total } = searchRoutineProducts(query);
  const started = query.normalize("NFKC").replace(/[^\p{L}\p{N}]/gu, "").length >= 2;
  return <section aria-labelledby="routine-lookup-title" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
    <div>
      <h3 id="routine-lookup-title" className="text-lg font-bold">지금 쓰는 화장품 찾기</h3>
      <p className="mt-1 text-sm text-slate-600">등록된 {routineLookupCount}개 중 제품명과 포장을 확인해요. 피부에 맞는지는 사용 반응과 함께 봐야 해요.</p>
    </div>
    <div>
      <label htmlFor="routine-lookup-input" className="block text-sm font-semibold">브랜드나 제품명</label>
      <input id="routine-lookup-input" type="search" maxLength={100} value={query} onChange={event => setQuery(event.target.value)}
        placeholder="예: 독도 클렌징 밀크" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700" />
    </div>
    <p role="status" className="text-sm text-slate-600">
      {!started ? "두 글자 이상 입력해요." : total === 0
        ? "일치하는 제품이 없어요. 포장에 적힌 브랜드나 제품명의 일부로 다시 찾아보세요."
        : `${total}개 찾았어요.${total > matches.length ? ` 앞의 ${matches.length}개만 표시해요. 제품명을 더 입력해보세요.` : ""}`}
    </p>
    {!!matches.length && <ul className="grid gap-3 sm:grid-cols-2">
      {matches.map(product => <li key={product.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3">
        <LookupImage key={product.image} src={product.image} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-600">{routineLookupCategories[product.category]}{product.volume && ` · ${product.volume}`}</p>
          <p className="mt-1 break-keep text-sm font-semibold text-slate-950">{product.name}</p>
          <p className="mt-1 text-xs text-slate-600">{product.formulaVerified ? "국내 전성분 확인됨" : "전성분 검수 전"}</p>
          {product.officialUrl && <a href={product.officialUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-emerald-800 underline underline-offset-2">공식 제품 정보</a>}
        </div>
      </li>)}
    </ul>}
  </section>;
}
