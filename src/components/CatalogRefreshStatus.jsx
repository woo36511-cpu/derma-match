import React, { useEffect, useState } from "react";
import catalog from "../data/routineLookupExpansion.json";

const workflow = "brand-discovery-watch.yml";
const repository = "woo36511-cpu/derma-match";
const history = `https://github.com/${repository}/actions/workflows/${workflow}`;
const endpoint = `https://api.github.com/repos/${repository}/actions/workflows/${workflow}/runs?branch=main&per_page=1`;
const brandCount = new Set(catalog.products.map(product => product.brand)).size;
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul",
});

function describeRun(run) {
  if (!run) return "실행 기록 없음";
  if (run.status === "queued" || run.status === "waiting") return "실행 대기";
  if (run.status === "in_progress") return "갱신 중";
  if (run.status !== "completed") return "실행 상태 확인 필요";
  if (run.conclusion === "success") return "수집 작업 완료";
  if (run.conclusion === "cancelled") return "실행 취소";
  return "실행 결과 확인 필요";
}

export function CatalogRefreshStatus() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("실행 상태 확인 중");

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error("Workflow status unavailable");
        const { workflow_runs: [run] } = await response.json();
        const updated = run?.updated_at ? dateFormatter.format(new Date(run.updated_at)) : "";
        if (!controller.signal.aborted) {
          setStatus(updated ? `${describeRun(run)} · ${updated}` : describeRun(run));
        }
      } catch {
        if (!controller.signal.aborted) setStatus("실행 상태를 불러오지 못했어요");
      }
    }
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [open]);

  return (
    <details className="rounded-2xl bg-gray-50 p-4 text-sm" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary className="cursor-pointer font-semibold text-gray-900">제품 정보 갱신</summary>
      <dl className="mt-3 grid gap-3 text-gray-600 sm:grid-cols-3">
        <div><dt className="font-medium text-gray-800">사이트 검색 목록</dt><dd>{brandCount.toLocaleString("ko-KR")}개 브랜드 · {catalog.products.length.toLocaleString("ko-KR")}개 항목</dd></div>
        <div><dt className="font-medium text-gray-800">배포된 목록의 기준일</dt><dd><time dateTime={catalog.checkedAt}>{catalog.checkedAt}</time></dd></div>
        <div><dt className="font-medium text-gray-800">최근 수집 작업</dt><dd aria-live="polite">{status}</dd></div>
      </dl>
      <a className="mt-3 inline-block font-medium text-gray-800 underline" href={history}>전체 실행 기록</a>
    </details>
  );
}
