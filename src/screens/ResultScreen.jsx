import { SectionTitle } from "../components/SectionTitle";
import { FeedbackAdviceCard } from "../components/FeedbackAdviceCard";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { ingredientsInfo } from "../data/ingredients";
import {
  sortProductsForDisplay,
  filterByLevel,
} from "../utils/recommendationScoring";
import { products } from "../data/products";
import { isProductAvailable } from "../utils/productCatalog";
import { ProductCard } from "../components/ProductCard";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function ResultScreen({
  nextRoutineInfo,
  nextLevel,
  baseLevel,
  levelChangeMessage,
  feedbackAdvice,
  routineReason,
  nextRoutine,
  userContext,
  ingredients,
  setStep,
  resetFlow,
}) {
  return (
    <section>
      <SectionTitle
        title={nextRoutineInfo.label}
        desc={nextRoutineInfo.summary}
      />

      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <p className="text-sm text-gray-500 break-keep mb-3">
            2주 사용 후 피드백 기준 결과
          </p>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="text-5xl font-bold">{nextLevel}</div>
            <div className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep">
              기준 단계 {baseLevel} → 다음 단계 {nextLevel}
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep">
            건조하고 당기면 더 촉촉한 쪽으로, 무겁고 번들거리면 더 가벼운 쪽으로
            이동합니다.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep mt-3">
            {levelChangeMessage}
          </p>
        </div>
      </div>

      <FeedbackAdviceCard advice={feedbackAdvice} />

      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-gray-50 rounded-3xl p-5 sm:p-6">
          <p className="text-sm text-gray-500 mb-3">추천 루틴 설명</p>

          <ul className="space-y-2">
            {routineReason.map((text) => (
              <li
                key={text}
                className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
              >
                · {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mb-10">
        <SectionTitle
          title="다음 단계 기본 루틴"
          desc="2주 사용 후 반응을 반영한 다음 추천 루틴입니다."
        />

        <RoutineProductScroller
          productsByCategory={nextRoutine.products}
          userContext={userContext}
        />
      </div>

      <div className="max-w-3xl mx-auto">
        <SectionTitle
          title="함께 보기 좋은 성분"
          desc="수분감 단계와 트러블 반응을 함께 반영한 추천입니다."
        />

        <div className="space-y-6">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6"
            >
              <div className="mb-5">
                <p className="text-xl font-bold leading-relaxed break-keep mb-2">
                  {ingredient}
                </p>

                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep mb-3">
                  {ingredientsInfo[ingredient].effect}
                </p>

                {ingredientsInfo[ingredient].recommendFor && (
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep mb-2">
                    추천 대상: {ingredientsInfo[ingredient].recommendFor}
                  </p>
                )}

                {ingredientsInfo[ingredient].caution && (
                  <div className="bg-amber-50 rounded-2xl p-3 text-sm text-amber-800 leading-relaxed break-keep">
                    주의: {ingredientsInfo[ingredient].caution}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortProductsForDisplay(
                  filterByLevel(
                    products.filter(
                      (product) =>
                        isProductAvailable(product) &&
                        product.ingredients.includes(ingredient),
                    ),
                  ),
                  nextLevel,
                ).map((product) => (
                  <ProductCard
                    key={product.id}
                    categoryKey={product.category}
                    product={product}
                    userContext={userContext}
                  />
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ingredientsInfo[ingredient].target.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full bg-white border border-gray-200 text-sm text-gray-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => setStep("feedback")}
          className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          피드백 다시 선택
        </button>
        <PrimaryButton onClick={resetFlow}>처음부터 다시</PrimaryButton>
      </div>
    </section>
  );
}
