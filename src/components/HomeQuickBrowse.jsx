import { useMemo, useState } from "react";
import { quickSkinTypes, homeMedicineGroups } from "../data/homeQuickGuides";
import { buildDynamicRoutine } from "../utils/routineRecommendation";
import { RoutineProductScroller } from "./RoutineProductScroller";
import { RoutineProductLookup } from "./RoutineProductLookup";
import { DetailDisclosure } from "./DetailDisclosure";

export function MedicineReferenceCard({ medicine }) {
  return <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-label={medicine.name}>
    <div className="flex items-center gap-4">
      {medicine.image && <img src={medicine.image} alt={`${medicine.name} 제품 포장`} width="88" height="88" loading="lazy" className="h-[88px] w-[88px] shrink-0 rounded-xl bg-slate-50 object-contain p-1" />}
      <div><p className={`mb-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${medicine.classification.startsWith("전문") ? "bg-amber-50 text-amber-900" : "bg-slate-100 text-slate-700"}`}>{medicine.classification}</p><h4 className="text-lg font-bold text-slate-950">{medicine.name}</h4><p className="mt-1 text-sm text-slate-600">{medicine.role}</p></div>
    </div>
    <p className="text-sm leading-relaxed text-slate-700">{medicine.indication}</p>
    <DetailDisclosure title="성분·용도·사용 전 주의사항">
      <dl className="space-y-3">
        <div><dt className="font-semibold">성분</dt><dd>{medicine.ingredients}</dd></div>
        <div><dt className="font-semibold">허가 용도</dt><dd>{medicine.approvedUse}</dd></div>
        <div><dt className="font-semibold">사용할 때</dt><dd>{medicine.use}</dd></div>
        <div><dt className="font-semibold">주의사항</dt><dd>{medicine.caution}</dd></div>
      </dl>
      <div className="mt-4 flex flex-col items-start gap-2"><a className="underline underline-offset-2" href={medicine.source} target="_blank" rel="noreferrer">{medicine.sourceLabel}</a>{medicine.secondarySource && <a className="underline underline-offset-2" href={medicine.secondarySource} target="_blank" rel="noreferrer">{medicine.secondarySourceLabel}</a>}<p className="text-xs text-slate-500">자료 확인 · {medicine.checkedAt}</p></div>
    </DetailDisclosure>
  </article>;
}

export function HomeQuickBrowse({ onStartSurvey, onStartRoutine, routineReview }) {
  const [view, setView] = useState(null);
  const [skinId, setSkinId] = useState(null);
  const [concernId, setConcernId] = useState(null);
  const skin = quickSkinTypes.find(type => type.id === skinId);
  const group = homeMedicineGroups.find(item => item.id === concernId);
  const routine = useMemo(() => skin ? buildDynamicRoutine(skin.level) : null, [skin]);
  return <section aria-labelledby="home-quick-title" className="space-y-5">
    <div><p className="text-xs font-semibold text-emerald-700">설문 없이 빠르게 보기</p><h2 id="home-quick-title" className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">필요한 정보만 바로 찾아봐요</h2></div>
    <div className="grid gap-3 sm:grid-cols-3">
      {[{id:"products",title:"피부타입별 화장품",detail:"타입을 고르면 기본 제품 4종을 바로 보여줘요.",number:"01"},{id:"medicines",title:"피부 고민별 약품 안내",detail:"어떤 고민에 어떤 약을 쓰는지 용도별로 살펴봐요.",number:"02"},{id:"lookup",title:"지금 쓰는 화장품 찾기",detail:"지금 쓰는 제품을 담고 유지할지 점검해요.",number:"03"}].map(item => <button key={item.id} type="button" aria-expanded={view === item.id} aria-controls="home-quick-content" onClick={() => setView(previous => previous === item.id ? null : item.id)} className={`rounded-2xl border p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ${view === item.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
      <span className="text-xs font-bold text-emerald-700">{item.number}</span><span className="mt-2 block text-lg font-bold">{item.title}</span><span className="mt-1 block text-sm text-slate-600">{item.detail}</span><span className="mt-3 block text-sm font-semibold text-emerald-800">{view === item.id ? "접기 −" : "바로 보기 →"}</span>
    </button>)}
    </div>
    <div id="home-quick-content">
      {view === "lookup" && <RoutineProductLookup {...routineReview} onStartSurvey={onStartSurvey} />}
      {view === "products" && <section aria-label="피부타입별 화장품 빠른 보기" className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
        <div><h3 className="text-lg font-bold">내 피부타입을 골라주세요</h3><p className="mt-1 text-sm text-slate-600">선택한 타입에 맞는 기본 예시예요. 지금 피부 상태를 더 반영하려면 설문을 이용해요.</p></div>
        <div className="grid gap-3 sm:grid-cols-3" role="group" aria-label="피부타입 선택">{quickSkinTypes.map(type => <button key={type.id} aria-pressed={skinId === type.id} onClick={() => setSkinId(type.id)} className={`rounded-2xl border px-4 py-3 text-left ${skinId === type.id ? "border-emerald-600 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}><span className="block font-semibold">{type.label}</span><span className="mt-1 block text-xs text-slate-600">{type.detail}</span></button>)}</div>
        {skin && routine && <div className="space-y-4" aria-label={`${skin.label} 기본 제품`}>
          <div><h4 className="font-bold">{skin.label} 기본 화장품</h4><p className="mt-1 text-sm text-slate-600">{skin.description} 잘 맞는 기존 제품은 유지하고, 토너·세럼은 필요할 때만 추가해요.</p></div>
          <RoutineProductScroller productsByCategory={routine.products} userContext={{ level: skin.level, skinType: skin.skinType, mainConcern: "none" }} />
          <div className="flex flex-wrap items-center gap-3"><button onClick={() => onStartRoutine(skin.level)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold">이 루틴으로 기록하기</button><p className="text-xs text-slate-500">기록을 시작할 때 현재 상태를 한 번 확인해요.</p></div>
        </div>}
        <button onClick={onStartSurvey} className="text-sm font-semibold text-emerald-800 underline underline-offset-4">피부타입을 잘 모르겠어요 · 설문으로 확인</button>
      </section>}
      {view === "medicines" && <section aria-label="피부 고민별 약품 빠른 안내" className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
        <div><h3 className="text-lg font-bold">고민별로 쓰이는 약을 살펴봐요</h3><p className="mt-1 text-sm text-slate-600">일반적인 약품 정보예요. 증상만으로 진단하거나 내게 맞는 약을 확정하는 목록은 아니에요.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="약품 안내 고민 선택">{homeMedicineGroups.map(item => <button key={item.id} aria-pressed={concernId === item.id} onClick={() => setConcernId(item.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${concernId === item.id ? "border-emerald-800 bg-emerald-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{item.label}</button>)}</div>
        {group && <div className="space-y-4">
          <div><h3 className="font-bold">{group.label}</h3><p className="mt-1 text-sm text-slate-700">{group.description}</p></div>
          <p className="rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-950">{group.notice}</p>
          <div className="grid items-start gap-4 lg:grid-cols-2">{group.medicines.map(medicine => <MedicineReferenceCard key={medicine.id} medicine={medicine} />)}</div>
          <p className="text-xs text-slate-600">붓기·통증이 심하거나 빠르게 번지면 약을 바꿔 시험하지 말고 상태 확인을 받아야 해요.</p>
        </div>}
        <button onClick={onStartSurvey} className="text-sm font-semibold text-emerald-800 underline underline-offset-4">현재 상태와 쓰는 약을 설문으로 확인하기</button>
      </section>}
    </div>
  </section>;
}
