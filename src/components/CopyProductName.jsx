import { useState } from "react";

export function CopyProductName({ name }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(name);
      setStatus("복사 완료");
    } catch {
      setStatus("복사 실패. 제품명을 선택해 복사해 주세요.");
    }
  }

  return <span className="inline-flex flex-wrap items-center gap-2">
    <button type="button" aria-label={`${name} 제품명 복사`} onClick={copy}
      className="rounded-lg border border-line px-2 py-1 text-xs font-semibold text-forest-900">제품명 복사</button>
    <span role="status" className="text-xs text-slate-600">{status}</span>
  </span>;
}
