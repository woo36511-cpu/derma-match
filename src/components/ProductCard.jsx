import { CopyProductName } from "./CopyProductName";
import { ProductPhoto } from "./ProductPhoto";
import { getCategoryLabel } from "../utils/productCatalog";
import { getProductPurchaseLink } from "../utils/productPurchaseLink";
import { getOfficialPriceReference } from "../utils/pricePreference";
import {
  buildUserTags,
  buildRecommendationReasons,
  getRecommendedAmount,
} from "../utils/recommendationExplanation";
import { DetailDisclosure } from "./DetailDisclosure";

const tagsClass = "rounded-full bg-forest-50 px-2 py-1 text-xs text-forest-900";

function ProductUsage({ usage, usageAmount, recommendedAmount }) {
  return <DetailDisclosure title="사용법과 주의사항">
    <div className="space-y-3">
      {usage.when && <p><span className="font-semibold">사용 시점</span> · {usage.when}</p>}
      {recommendedAmount && <p><span className="font-semibold">추천 사용량</span> · {recommendedAmount}</p>}
      {usageAmount && <div className="flex flex-wrap gap-1.5">
        <span className={tagsClass}>지성 · {usageAmount.oily}</span>
        <span className={tagsClass}>중성 · {usageAmount.normal}</span>
        <span className={tagsClass}>건성 · {usageAmount.dry}</span>
      </div>}
      {usage.howToUse?.length > 0 && <ol className="list-decimal space-y-1 pl-5">
        {usage.howToUse.map((item, index) => <li key={index}>{item}</li>)}
      </ol>}
      {usage.caution?.length > 0 && <ul className="list-disc space-y-1 pl-5 text-amber-900">
        {usage.caution.map((item, index) => <li key={index}>{item}</li>)}
      </ul>}
    </div>
  </DetailDisclosure>;
}

export function ProductCard({ product, categoryKey, userContext, step = 0, optional = false }) {
  if (!product) return null;

  const purchase = getProductPurchaseLink(product);
  const tags = userContext ? buildUserTags(userContext) : [];
  const detailTags = [...new Set([...tags, ...(product.ratingTags ?? [])])];
  const reasons = userContext ? buildRecommendationReasons(product, userContext) : [];
  const visibleReason = reasons[0] ?? product.shortReason;
  const price = userContext?.pricePreference === "important" ? getOfficialPriceReference(product) : null;
  const ingredients = product.evidence?.domesticFormulaVerified === true && product.evidence?.fullIngredientsVerified === true
    ? product.fullIngredients : null;
  const ingredientSource = ingredients?.length && product.evidence.sources?.find(source =>
    source.url && /^(official_domestic_|manufacturer_domestic_)/.test(source.sourceType));

  return <article className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-white p-3.5 sm:p-4" aria-label={product.name}>
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
      <p className="care-kicker">{step > 0 && <span aria-hidden="true" className="mr-1.5 tabular-nums">{String(step).padStart(2, "0")}</span>}{getCategoryLabel(categoryKey)}</p>
      {optional && <span className="text-xs text-slate-600">필요할 때 추가</span>}
    </div>
    <ProductPhoto product={product} width={240} height={160} className="h-28 w-full rounded-xl bg-stone-50 object-contain p-2 sm:h-36" />
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-bold leading-snug text-ink">{product.name}</h3>
        <CopyProductName key={product.name} name={product.name} />
      </div>
      <p className="mt-1 text-xs text-slate-600">
        {[product.volume, price && `공식 기준가 ${price.amount.toLocaleString("ko-KR")}원`].filter(Boolean).join(" · ")}
      </p>
      {product.shortReason && <p className="mt-2 text-sm text-slate-700"><strong>주요 기능</strong> · {product.shortReason}</p>}
      {visibleReason && visibleReason !== product.shortReason && <p className="mt-2 text-sm leading-relaxed text-slate-700">{visibleReason}</p>}
    </div>
    <div className="grid gap-1.5 [&_summary]:gap-1.5 [&_summary]:px-2.5 [&_summary]:py-2 [&_summary]:text-xs [&_summary>span]:text-[11px]">
      <DetailDisclosure title={ingredients?.length ? "추천 이유·전성분" : "추천 이유·성분 정보"}>
        <div className="space-y-2">
          {product.description && <p>{product.description}</p>}
          {reasons.length > 0 && <ul className="list-disc space-y-1 pl-4">{reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>}
          {detailTags.length > 0 && <div className="flex flex-wrap gap-1.5">
            {detailTags.map(tag => <span key={tag} className={tagsClass}>{tag}</span>)}
          </div>}
          {ingredients?.length > 0 ? <div className="border-t border-line pt-2">
            <p className="font-semibold">국내 공식 전성분</p>
            <p className="mt-1">{ingredients.join(", ")}</p>
            {ingredientSource && <a className="mt-1 inline-block underline" href={ingredientSource.url} target="_blank" rel="noreferrer">공식 성분 출처 보기</a>}
          </div> : <p className="text-xs text-slate-600">확인된 국내 공식 전성분 정보는 아직 없어요.</p>}
          {price && <p className="text-xs text-slate-600"><a className="underline" href={price.url} target="_blank" rel="noreferrer">가격 출처</a> · {price.checkedAt} 확인 · 할인과 배송비 제외</p>}
        </div>
      </DetailDisclosure>
      {product.usage && <ProductUsage usage={product.usage} usageAmount={product.usageAmount} recommendedAmount={getRecommendedAmount(product, userContext)} />}
    </div>
    {product.caution?.length > 0 && <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-950">주의: {product.caution[0]}</p>}
    <div className="border-t border-line pt-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {!!product.price && !price && <span className="text-slate-600">{product.price.toLocaleString("ko-KR")}원</span>}
        {purchase.url ? <a href={purchase.url} target="_blank" rel={purchase.affiliate ? "sponsored noopener noreferrer" : "noopener noreferrer"}
          className="inline-flex min-h-8 items-center gap-1 font-semibold text-forest-800 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700">{purchase.label} <span aria-hidden="true">↗</span></a>
          : <span className="text-slate-600">{purchase.label}</span>}
      </div>
      {purchase.affiliate && <p className="mt-1 text-xs text-slate-600">쿠팡 파트너스 링크로 구매 시 일정액의 수수료를 제공받을 수 있어요.</p>}
      {purchase.note && <p className="mt-1 text-xs text-slate-600">{purchase.note}</p>}
    </div>
  </article>;
}

export default ProductCard;
