import { useState } from "react";
import { getReviewedRoutineProduct, makeManualRoutineEntry } from "../utils/currentRoutineReview";
import { listProductReviewRequests, requestProductReview } from "../services/productReviewRequests";

const confirmation = { pending: "제품 검수 요청을 접수했어요. 확인 전에는 입력한 사용감만 참고해요.",
  existing: "이미 요청한 제품이에요. 내 검수 요청에서 상태를 볼 수 있어요.",
  limited: "하루에 제품 5개까지 요청할 수 있어요. 제품은 지금 루틴에 담을 수 있어요.",
  invalid_url: "브랜드 공식 제품 페이지의 HTTPS 주소를 입력해주세요.",
  invalid_name: "포장에 적힌 제품명만 입력해주세요.", error: "검수 요청을 보내지 못했어요. 제품은 담아두고 나중에 다시 요청할 수 있어요." };

export function ProductReviewRequest({ product, source = "" }) {
  const [url, setUrl] = useState(source);
  const [status, setStatus] = useState(null);
  const submit = async () => {
    setStatus("sending");
    try { setStatus(await requestProductReview(product, url)); }
    catch { setStatus("error"); }
  };
  const sent = ["pending", "existing"].includes(status);
  return <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
    <label className="block font-semibold">공식 제품 링크 (선택)
      <input type="url" inputMode="url" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
        placeholder="브랜드 공식 제품 페이지 주소" maxLength={512} value={url} onChange={event => setUrl(event.target.value)} />
    </label>
    <p className="text-xs text-slate-600">제품명·종류·입력한 링크만 검수에 사용해요. 피부 답변과 사용감은 보내지 않아요.</p>
    <button type="button" disabled={!product || sent || status === "sending"} onClick={submit}
      className="rounded-lg border border-emerald-700 px-3 py-2 font-semibold text-emerald-800 disabled:border-slate-200 disabled:text-slate-500">
      {status === "sending" ? "보내는 중…" : sent ? "검수 요청함" : "전성분·보습감 검수 요청"}
    </button>
    {confirmation[status] && <p role="status" className="text-sm">{confirmation[status]}</p>}
  </div>;
}

function ReviewRequestRow({ row }) {
  const manual = makeManualRoutineEntry(row.product_name, row.category);
  const reviewed = getReviewedRoutineProduct(manual);
  return <li className="rounded-lg border border-slate-200 p-3">
    <p className="font-semibold">{row.product_name}</p>
    {reviewed ? <><p>검수 완료 · {reviewed.label}</p>
      {reviewed.officialUrl && <a className="underline" href={reviewed.officialUrl} target="_blank" rel="noreferrer">공식 제품 근거</a>}</>
      : <p>{row.status === "insufficient" ? "확인 가능한 국내 제품 자료가 부족해요" : row.status === "published" ? "제품 목록에 반영 중이에요" : "검수 대기"}</p>}
  </li>;
}

export function ProductReviewHistory() {
  const [status, setStatus] = useState("idle");
  const [rows, setRows] = useState([]);
  const load = async () => {
    setStatus("loading");
    try { setRows(await listProductReviewRequests()); setStatus("ready"); }
    catch { setStatus("error"); }
  };
  return <section className="space-y-2" aria-label="내 제품 검수 요청">
    <button type="button" disabled={status === "loading"} onClick={load} className="text-xs font-semibold text-emerald-800 underline underline-offset-2">
      {status === "ready" ? "검수 상태 새로고침" : "내 검수 요청 보기"}
    </button>
    {status === "loading" && <p role="status" className="text-xs">검수 요청을 확인하고 있어요.</p>}
    {status === "error" && <p role="status" className="text-xs">검수 요청을 불러오지 못했어요.</p>}
    {status === "ready" && (rows.length ? <ul className="space-y-2 text-sm">{rows.map(row => <ReviewRequestRow key={`${row.category}:${row.product_name}`} row={row} />)}</ul>
      : <p className="text-xs text-slate-600">아직 요청한 제품이 없어요.</p>)}
  </section>;
}
