import { DetailDisclosure } from "./DetailDisclosure";
export function AcneCareReview({ review }) {
  if (!review) return null;
  return <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" aria-label="여드름 관리 목표와 확인 시점">
    <h2 className="text-lg font-bold">이번 관리에서 확인할 변화</h2>
    <p className="font-medium">{review.goal}</p>
    <ul className="list-disc space-y-1 pl-5 text-sm">{review.observations.map(item => <li key={item}>{item}</li>)}</ul>
    <p className="text-sm text-slate-600">{review.cosmeticRole}</p>
    <DetailDisclosure title="근거와 사용 후 확인 시점">
      <div className="space-y-3"><p>{review.earlyCheck}</p><p>{review.effectCheck}</p><p>{review.evidence}</p>
        <ul className="space-y-1">{review.sources.map(source => <li key={source.url}><a className="underline" href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
      </div>
    </DetailDisclosure>
  </section>;
}
