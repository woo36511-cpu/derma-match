import { useState } from "react";
import { getCosmeticQuestions, cleanCosmeticAnswers } from "../data/cosmeticAddOns";
import { buildCosmeticAddOnPlan } from "../utils/cosmeticAddOnPlan";
import { getProductPurchaseLink } from "../utils/productPurchaseLink";
import { DetailDisclosure } from "./DetailDisclosure";

export function CosmeticAddOnResult({ plan }) {
  const purchase = getProductPurchaseLink(plan.product);
  return <div className="space-y-4" aria-label="추가 화장품 추천 결과">
    <div><h3 className="font-bold">{plan.title}</h3><p className="mt-1 text-sm text-slate-700">{plan.detail}</p></div>
    {plan.product && <article className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-4" aria-label={plan.product.name}>
      <div className="flex items-center gap-4"><img src={plan.product.image} alt={plan.product.name} loading="lazy" width="100" height="100" className="h-24 w-24 shrink-0 rounded-xl object-contain bg-slate-50" /><div><p className="text-xs font-semibold text-emerald-800">{plan.classification}</p><h4 className="mt-1 font-bold">{plan.product.name}</h4><p className="mt-1 text-sm text-slate-600">{plan.product.volume}</p></div></div>
      <p className="text-sm">{plan.fit}</p>
      {plan.status === "candidate" && purchase?.url && <a href={purchase.url} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-emerald-800 underline">{purchase.label}</a>}
      {plan.suppressPharmacy && <p className="rounded-xl bg-amber-50 p-3 text-sm">이번 결과에서는 각질 관리 화장품 후보를 선택했어요. 약품 후보 표시는 보류하며, 약과 이 제품을 함께 새로 시작하지 않아요.</p>}
      <DetailDisclosure title="추천 이유·사용 순서·주의사항">
        <div className="space-y-3"><p>{plan.placement}</p><p>{plan.product.description}</p><ul className="list-disc space-y-1 pl-5">{(plan.product.usage?.howToUse ?? []).map(text => <li key={text}>{text}</li>)}</ul><ul className="list-disc space-y-1 pl-5">{(plan.product.caution ?? []).map(text => <li key={text}>{text}</li>)}</ul><p>같은 목적의 기능성 제품은 한 가지만 먼저 확인해요. 낮에는 잘 맞는 자외선 차단제를 사용하고, 새 자극이 생기면 새로 추가한 제품을 중단해요.</p><p>답변한 성분군과 확인된 제품 정보로 조합을 점검했어요. 현재 제품의 전체 처방이나 알레르기를 모두 확인한 것은 아니므로 무자극·안전성을 보장하지 않아요.</p>{plan.source && <a href={plan.source} target="_blank" rel="noreferrer" className="inline-block underline">브랜드 공식 제품 정보</a>}</div>
      </DetailDisclosure>
    </article>}
  </div>;
}

export function CosmeticAddOnSection({ context, initialAnswers, onApply }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => initialAnswers ?? {});
  const [index, setIndex] = useState(0);
  const questions = getCosmeticQuestions(draft, context.carePlan);
  const question = questions[Math.min(index, questions.length - 1)];
  const plan = initialAnswers ? buildCosmeticAddOnPlan(initialAnswers, context) : null;
  const answered = question.multiple ? draft[question.id]?.length > 0 : Boolean(draft[question.id]);
  const answer = value => setDraft(previous => {
    let selected = value;
    if (question.multiple) {
      const before = previous[question.id] ?? [];
      selected = ["none", "unknown"].includes(value) ? [value] : before.includes(value) ? before.filter(item => item !== value) : [...before.filter(item => !["none", "unknown"].includes(item)), value];
    }
    return cleanCosmeticAnswers({ ...previous, [question.id]: selected,
      ...(["goal", "actives"].includes(question.id) && { unlistedIngredientsChecked: false }),
    }, context.carePlan);
  });
  return <section className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6" aria-label="기능성·고민별 화장품 추가">
    <div><p className="text-xs font-semibold text-emerald-800">선택 사항</p><h2 className="mt-1 text-xl font-bold">기능성·고민별 화장품 추가</h2><p className="mt-2 text-sm text-slate-700">기본 제품 외에 보완하고 싶은 고민이 있나요? 피부의 보습 필요도와 현재 쓰는 성분을 확인해 후보 한 가지를 골라요. 화장품으로 염증·모낭염을 치료한다고 안내하지 않아요.</p></div>
    {!editing && plan?.complete && <CosmeticAddOnResult plan={plan} />}
    {!editing ? <div className="flex flex-wrap gap-3"><button className="rounded-xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white" onClick={() => { setDraft(initialAnswers ?? {}); setIndex(0); setEditing(true); }}>{initialAnswers ? "추가 추천 답변 바꾸기" : "추가 화장품 후보 찾아보기"}</button>{initialAnswers && <button className="rounded-xl border border-slate-300 px-4 py-3 text-sm" onClick={() => { onApply(null); setDraft({}); }}>추가 선택 지우기</button>}</div> : <div className="space-y-4">
      <p className="text-xs text-slate-600">추가 확인 {index + 1}/{questions.length}</p><h3 className="font-semibold">{question.q}</h3>{question.multiple && <p className="text-sm text-slate-600">해당하는 성분을 모두 골라요. 모르는 성분은 추측하지 않아도 돼요.</p>}
      <div className="space-y-2" role="group" aria-label={question.q}>{question.options.map(option => { const active = question.multiple ? draft[question.id]?.includes(option.value) : draft[question.id] === option.value; return <button key={option.value} aria-pressed={Boolean(active)} className={`w-full rounded-xl border p-3 text-left text-sm ${active ? "border-emerald-700 bg-emerald-100" : "border-slate-200 bg-white"}`} onClick={() => answer(option.value)}><span className="block font-semibold">{option.label}</span>{option.detail && <span className="mt-1 block text-slate-600">{option.detail}</span>}</button>; })}</div>
      {question.id === "goal" && ["support", "lines"].includes(draft.goal) && <label className="block text-sm font-semibold">먼저 비교하고 싶은 세럼 (선택)
        <select className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-2 font-normal" value={draft.serumFocus ?? ""} onChange={event => setDraft(previous => ({ ...previous, serumFocus: event.target.value }))}>
          <option value="">피부 상태에 맞게 골라주세요</option>
          {draft.goal === "support" ? <><option value="pdrn">PDRN 수분 세럼</option><option value="panthenol">판테놀 보습 세럼</option></> : <option value="peptide">펩타이드 세럼</option>}
        </select>
      </label>}
      {question.id === "actives" && ["tone", "texture", "sebum"].includes(draft.goal) && !!context.currentRoutine?.uncertainActives?.length &&
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={draft.unlistedIngredientsChecked === true}
          onChange={event => setDraft(previous => ({ ...previous, unlistedIngredientsChecked: event.target.checked }))} />
          성분 정보가 없는 제품의 포장도 확인하고 위 답에 반영했어요. ({context.currentRoutine.uncertainActives.join(" · ")})
        </label>}
      <div className="flex flex-wrap justify-between gap-3"><button className="rounded-xl border px-4 py-3 text-sm" onClick={() => index ? setIndex(index - 1) : setEditing(false)}>{index ? "이전" : "돌아가기"}</button><button disabled={!answered} className="rounded-xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40" onClick={() => { if (index === questions.length - 1) { if (!buildCosmeticAddOnPlan(draft, context).complete) return; onApply(draft); setEditing(false); } else setIndex(index + 1); }}>{index === questions.length - 1 ? "추가 추천 확인하고 저장" : "다음"}</button></div>
    </div>}
    <p className="text-xs text-slate-600">보습·각질 관리용 일반화장품도 포함해요. 기능성 표시는 공식 자료로 확인한 제품에만 사용해요. 추가 선택은 추천 기록으로 저장하며 실제 사용한 것으로 처리하지 않아요.</p>
  </section>;
}
