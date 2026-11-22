import { DetailDisclosure } from "./DetailDisclosure";

export function ConcernProductCard({ product }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {product.image && <img src={product.image} alt={`${product.name} 제품 사진`} width={88} height={88} loading="lazy" className="h-[88px] w-[88px] shrink-0 rounded-lg bg-white object-contain p-1" />}
      <div className="min-w-0">
      <p className="text-xs font-semibold text-emerald-800">{product.type}</p>
      <p className="font-semibold">{product.name}</p>
      <p className="mt-1 text-sm">{product.guidance}</p>
      <a className="mt-1 inline-block text-sm underline" href={product.source} target="_blank" rel="noreferrer">{product.sourceLabel ?? "공식 제품 정보"}</a>
      </div>
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
      <ConcernProductCard product={first} />
      {alternatives.length > 0 && <DetailDisclosure title="토너·리퀴드 대안 보기">
        <div className="space-y-2">{alternatives.map(product => <ConcernProductCard key={product.name} product={product} />)}</div>
      </DetailDisclosure>}
    </section>}
    {pharmacy && <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 space-y-3" aria-label="일반의약품 후보">
      <div className="flex items-center gap-3">
        {pharmacy.image && <img src={pharmacy.image} alt={`${pharmacy.name} 제품 포장`} width="88" height="88" className="h-[88px] w-[88px] shrink-0 rounded-lg bg-white object-contain p-1" />}
        <div>
          <p className="text-xs font-semibold text-emerald-800">{plan.replacementOnly ? "교체 검토용 일반의약품 후보" : "약국 일반의약품 후보"}</p>
          <h3 className="font-semibold">{pharmacy.name}</h3>
          <p className="mt-1 text-sm">{pharmacy.indication}</p>
        </div>
      </div>
      <p className="text-sm">사용 전 주의사항을 확인해요. 시작한다면 설명서대로 해당 부위에만 바르고, 평소보다 따갑거나 붉어지거나 붓는다면 사용을 중단해요.</p>
      <DetailDisclosure title="성분·사용 전 주의사항">
        <div className="space-y-2">
          <p>{pharmacy.ingredients}</p>
          <p>{pharmacy.caution}</p>
          <a className="inline-block underline" href={pharmacy.source} target="_blank" rel="noreferrer">{pharmacy.sourceLabel ?? "식약처 허가사항 보기"}</a>
        </div>
      </DetailDisclosure>
    </section>}
    {plan.recheck && <p className="text-sm text-slate-700">{plan.recheck}</p>}
  </>;
}
