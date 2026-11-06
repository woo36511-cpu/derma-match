import { DetailDisclosure } from "./DetailDisclosure";

export function CarePrioritySummary({ priorities }) {
  if (!priorities) return null;
  return <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 sm:p-7 space-y-4" aria-labelledby="care-priorities">
    <h2 id="care-priorities" className="text-xl font-bold">피부를 좋아지게 하는 관리 순서</h2>
    <div>
      <h3 className="font-semibold">1. 먼저 해결할 문제</h3>
      <p className="mt-1 text-sm">{priorities.headline}</p>
      {priorities.reason && <p className="mt-1 text-sm">{priorities.reason}</p>}
    </div>
    <div>
      <h3 className="font-semibold">2. 지금 같이 해도 되는 관리</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
        {priorities.parallel.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
    {priorities.later.length > 0 && <div>
      <h3 className="font-semibold">3. 피부가 편안해진 뒤 할 관리</h3>
      <ul className="mt-1 space-y-2 text-sm">
        {priorities.later.map(({ title, detail }) => <li key={title}><strong>{title}:</strong> {detail}</li>)}
      </ul>
    </div>}
    <DetailDisclosure title="관리 순서의 근거 보기">
      <a className="underline" href="https://www.aad.org/public/diseases/acne/skin-care/moisturizer" target="_blank" rel="noreferrer">AAD · 여드름 관리와 보습</a>
      {" · "}
      <a className="underline" href="https://www.aad.org/public/everyday-care/skin-care-basics/dry/oily-skin" target="_blank" rel="noreferrer">AAD · 번들거리는 피부 관리</a>
      {" · "}
      <a className="underline" href="https://www.aad.org/public/everyday-care/skin-care-secrets/routine/fade-dark-spots" target="_blank" rel="noreferrer">AAD · 갈색 자국과 자외선 차단</a>
    </DetailDisclosure>
  </section>;
}
