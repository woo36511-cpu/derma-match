import { DetailDisclosure } from "./DetailDisclosure";

function CosmeticOption({ product }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-xs font-semibold text-emerald-800">{product.type}</p>
      <p className="font-semibold">{product.name}</p>
      <p className="mt-1 text-sm">{product.guidance}</p>
      <a className="mt-1 inline-block text-sm underline" href={product.source} target="_blank" rel="noreferrer">공식 제품 정보</a>
    </div>
  );
}

export function ConcernProductOptions({ plan }) {
  const [first, ...alternatives] = plan.cosmetics ?? [];
  const pharmacy = plan.pharmacy;
  return <>
    {plan.productNote && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{plan.productNote}</p>}
    {first && <section className="space-y-2" aria-label="고민에 맞는 화장품">
      <h3 className="text-sm font-semibold">고민에 맞는 화장품 후보</h3>
      <CosmeticOption product={first} />
      {alternatives.length > 0 && <DetailDisclosure title="토너·리퀴드 대안 보기">
        <div className="space-y-2">{alternatives.map(product => <CosmeticOption key={product.name} product={product} />)}</div>
      </DetailDisclosure>}
    </section>}
    {pharmacy && <DetailDisclosure title={`약사와 확인할 일반의약품 · ${pharmacy.name}`}>
      <div className="space-y-2">
        <p><strong>{pharmacy.name}</strong> · {pharmacy.ingredients}</p>
        <p>{pharmacy.indication}</p>
        <p>{pharmacy.caution}</p>
        <p>사용 여부와 방법은 약사 안내와 제품 설명서를 따르세요. 바른 뒤 자극이 생기면 중단하고 확인하세요.</p>
        <a className="inline-block underline" href={pharmacy.source} target="_blank" rel="noreferrer">식약처 허가사항 보기</a>
      </div>
    </DetailDisclosure>}
    {plan.recheck && <p className="text-sm text-slate-700">{plan.recheck}</p>}
  </>;
}
