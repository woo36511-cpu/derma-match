import { useState } from "react";
import { nextBrandDiscoveryTime, requestBrandDiscovery } from "../services/brandDiscoveryRequests";

const inSeoul = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const messages = {
  accepted: "브랜드 찾기를 접수했어요.",
  existing: "이미 찾기 요청이 접수된 브랜드예요.",
  invalid: "브랜드 이름만 입력해 주세요.",
  busy: "지금은 요청이 많아요. 잠시 뒤 다시 시도해 주세요.",
  error: "요청을 접수하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
};

export function BrandDiscoveryRequest({ query }) {
  const [status, setStatus] = useState("idle");
  const received = status === "accepted" || status === "existing";
  const next = nextBrandDiscoveryTime();
  async function submit() {
    setStatus("sending");
    setStatus(await requestBrandDiscovery(query));
  }
  return <div className="space-y-2 rounded-xl border border-slate-200 p-3 text-sm">
    {!received && <button type="button" className="care-secondary" disabled={status === "sending"} onClick={submit}>
      {status === "sending" ? "접수 중…" : "이 브랜드를 찾을 수 없어"}
    </button>}
    <p className="text-slate-600">
      다음 확인 예정 <time dateTime={next.toISOString()}>{inSeoul.format(next)}</time> (한국 시간).
      공식몰 확인 후 제품 수집과 검색 반영에는 수십 분 이상 걸릴 수 있어요.
    </p>
    {messages[status] && <p role="status">{messages[status]}</p>}
    {received && <p className="text-slate-600">상품이 확인되면 검색 목록에 추가돼요. 제품명을 직접 담아 지금 설문을 계속할 수도 있어요.</p>}
  </div>;
}
