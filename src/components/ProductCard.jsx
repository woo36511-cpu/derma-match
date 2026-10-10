import { useState } from "react";
import { isValidProductLink, getCategoryLabel } from "../utils/productCatalog";
import {
  buildUserTags,
  buildRecommendationReasons,
  getRecommendedAmount,
} from "../utils/recommendationExplanation";

export function ProductCard({ product, categoryKey, userContext }) {
  const [openInfo, setOpenInfo] = useState(null);

  if (!product) return null;

  const clickable = isValidProductLink(product.link);
  const tags = userContext ? buildUserTags(userContext) : [];
  const reasons = userContext
    ? buildRecommendationReasons(product, userContext)
    : [];

  const recommendedAmount = getRecommendedAmount(product, userContext);
  const cardInner = (
    <>
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-36 sm:h-44 object-cover rounded-2xl mb-4"
      />
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-block text-[11px] tracking-wider text-gray-400 bg-gray-100 rounded-full px-2 py-1">
          {getCategoryLabel(categoryKey)}
        </span>

        {product.volume && (
          <span className="text-[11px] text-gray-400">{product.volume}</span>
        )}
      </div>

      <p className="text-base font-semibold leading-relaxed break-keep mb-1">
        {product.name}
      </p>

      <p className="text-sm text-gray-500 leading-relaxed break-keep mb-2">
        {product.description}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {product.shortReason && (
        <p className="text-sm text-gray-700 leading-relaxed break-keep mb-3">
          {product.shortReason}
        </p>
      )}

      {product.ratingTags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {product.ratingTags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 mb-3">
        {reasons.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpenInfo(openInfo === "reason" ? null : "reason");
            }}
            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-2 transition"
          >
            추천 이유
          </button>
        )}

        {product.usage && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setOpenInfo(openInfo === "usage" ? null : "usage");
            }}
            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-2 transition"
          >
            사용법
          </button>
        )}
      </div>

      {openInfo === "reason" && (
        <div className="mb-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">추천 이유</p>

          <ul className="space-y-1">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="text-sm text-gray-700 leading-relaxed break-keep"
              >
                · {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {openInfo === "usage" && product.usage && (
        <div className="mb-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-3">사용법</p>

          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1">사용 시점</p>
            <p className="text-sm text-gray-700 leading-relaxed break-keep">
              {product.usage.when}
            </p>
          </div>

          {product.usageAmount && (
            <div className="mb-3">
              {recommendedAmount && (
                <div className="mb-3 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-500 mb-1">
                    현재 피부 기준 추천 사용량
                  </p>

                  <p className="text-sm font-medium text-blue-800">
                    {recommendedAmount}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 mb-2">추천 사용량</p>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1">
                  지성 · {product.usageAmount.oily}
                </span>
                <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1">
                  중성 · {product.usageAmount.normal}
                </span>
                <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1">
                  건성 · {product.usageAmount.dry}
                </span>
              </div>
            </div>
          )}

          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-2">사용 순서</p>

            <ul className="space-y-1">
              {product.usage.howToUse.map((item, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 leading-relaxed break-keep"
                >
                  {index + 1}. {item}
                </li>
              ))}
            </ul>
          </div>

          {product.usage.caution?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">주의사항</p>

              <ul className="space-y-1">
                {product.usage.caution.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-amber-700 leading-relaxed break-keep"
                  >
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-auto">
        <div className="text-sm text-gray-500">
          {product.price ? `${product.price.toLocaleString()}원` : ""}
        </div>

        <div
          className={`text-sm font-medium ${
            clickable ? "text-black" : "text-gray-400"
          }`}
        >
          {clickable ? "쿠팡에서 보기" : "링크 준비중"}
        </div>
      </div>

      {product.caution?.length > 0 && (
        <div className="mt-3 bg-amber-50 rounded-2xl p-3 text-sm text-amber-800 leading-relaxed break-keep">
          주의: {product.caution[0]}
        </div>
      )}
    </>
  );

  if (!clickable) {
    return (
      <div className="group bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col">
        {cardInner}
      </div>
    );
  }

  return (
    <a
      href={product.link}
      target="_blank"
      rel="noreferrer"
      className="group bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col"
    >
      {cardInner}
    </a>
  );
}

export default ProductCard;
