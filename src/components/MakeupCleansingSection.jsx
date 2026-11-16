import { DetailDisclosure } from "./DetailDisclosure";

export function MakeupCleansingSection({ plan }) {
  if (!plan) return null;
  const { product } = plan;
  return (
    <section className="care-panel space-y-3" aria-labelledby="makeup-cleansing-title">
      <p className="care-kicker">화장하는 날 · 저녁</p>
      <h2 id="makeup-cleansing-title" className="text-lg font-bold text-forest-900 sm:text-xl">{plan.title}</h2>
      <p className="text-sm leading-relaxed text-slate-700">{plan.detail}</p>
      {product && <article aria-label={product.name} className="space-y-2 rounded-xl border border-forest-100 bg-forest-50 p-4">
        <p className="text-xs font-semibold text-forest-700">{product.kind} · {product.volume}</p>
        <h3 className="font-bold text-forest-900">{product.name}</h3>
        <p className="text-sm text-slate-700">{product.usage}</p>
        <p className="text-xs text-slate-600">이미 이 제품으로 지우고 있다면 다시 구매할 필요는 없어요. 새로 사용했을 때 따갑거나 붉어지면 사용을 중단해요.</p>
        {product.caution && <p className="text-xs text-amber-900">{product.caution}</p>}
        <DetailDisclosure title="확인한 정보">
          <p>{product.evidence}</p>
          {product.ingredients && <p className="mt-2"><span className="font-semibold">국내 공식 전성분</span> · {product.ingredients.join(", ")}</p>}
          {product.evidenceUrl && <a href={product.evidenceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block underline underline-offset-4">확인 자료 보기</a>}
        </DetailDisclosure>
        <a href={product.url} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center text-sm font-semibold text-forest-800 underline underline-offset-4">공식 제품 정보</a>
      </article>}
    </section>
  );
}
