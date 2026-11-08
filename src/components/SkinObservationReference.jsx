// Diagrams explain locations and visible features; they are not diagnostic photographs.
export function SkinObservationReference({ kind }) {
  if (!kind) return null;
  if (kind === "surface") return <figure className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-label="피부 표면 특징 비교 그림">
    <div className="grid grid-cols-3 gap-3">{[
      ["편안한 표면", "#e8c7ad", false], ["들뜨는 각질", "#e8c7ad", true], ["벗겨짐·붉어짐", "#dba4a0", true],
    ].map(([label, color, flakes], i) => <div key={label} className="text-center">
      <svg viewBox="0 0 120 80" className="w-full" role="img" aria-label={label}><rect x="5" y="5" width="110" height="70" rx="18" fill={color} />{flakes && <g fill="#fff6ed" stroke="#b48a79" strokeWidth="1.5"><path d="M24 21l13 1-4 9-13-2z"/><path d="M58 48l15-3 3 9-18 3z"/><path d="M83 19l12 4-6 10-12-5z"/></g>}{i === 2 && <path d="M25 53q15-19 32-12t31-3" fill="none" stroke="#ba6769" strokeWidth="4" strokeLinecap="round"/>}</svg>
      <p className="mt-2 text-xs font-semibold">{label}</p>
    </div>)}</div>
    <figcaption className="mt-3 text-xs text-slate-600">특징 이해용 그림이에요. 실제 피부색·모습은 다양해요. 그림이 비슷하다는 이유만으로 질환을 정하지 않아요.</figcaption>
  </figure>;
  return <figure className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" aria-label="이마·코와 볼·입 주변 부위 그림">
    <svg viewBox="0 0 180 195" className="h-36 w-32 shrink-0" role="img" aria-label="주황색은 이마·코, 파란색은 양쪽 볼과 입 주변">
      <path d="M42 46Q45 13 90 13t48 33v55q0 54-48 78-48-24-48-78z" fill="#ead1bd" stroke="#926c5c" strokeWidth="3"/>
      <path d="M53 48q37-19 74 0v21H102v44H78V69H53z" fill="#edb566"/>
      <ellipse cx="61" cy="111" rx="16" ry="24" fill="#9cbfd3"/><ellipse cx="119" cy="111" rx="16" ry="24" fill="#9cbfd3"/>
      <path d="M69 143q21-12 42 0l-5 14H74z" fill="#9cbfd3"/>
      <path d="M57 79h16m34 0h16M89 86l-4 28h12M78 140q12 6 24 0" fill="none" stroke="#76584b" strokeWidth="3" strokeLinecap="round"/>
    </svg>
    <figcaption className="flex-1 space-y-2 text-sm"><p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-amber-400" aria-hidden="true"/>이마·코: T존</p><p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-sky-300" aria-hidden="true"/>양쪽 볼·입 주변</p><p className="text-xs text-slate-600">{kind === "oil_regions" ? "기름기가 있는 부위를 비교해요. 볼과 코가 같지 않아도 괜찮아요." : "조이는 느낌이 있는 부위를 비교해요. 기름기가 있어도 당김은 따로 답해요."}</p></figcaption>
  </figure>;
}
