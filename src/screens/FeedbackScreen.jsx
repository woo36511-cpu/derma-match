import { SectionTitle } from "../components/SectionTitle";
import { getCategoryLabel } from "../utils/productCatalog";
import { feedbackQuestions } from "../data/feedbackQuestions";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function FeedbackScreen({
  feedbackTargetProducts,
  productUsageFeedback,
  handleProductUsageAnswer,
  answers,
  handleAnswer,
  nextLevel,
  nextRoutineInfo,
  setStep,
  isComplete,
}) {
  return (
    <section>
      <SectionTitle
        title="사용 후 피드백"
        desc="추천받은 루틴을 약 2주 사용한 후 느낀 피부 변화를 선택해주세요."
      />

      <div className="max-w-3xl mx-auto space-y-5">
        {feedbackTargetProducts.length > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 sm:p-6">
            <p className="text-base sm:text-lg font-semibold mb-2">
              실제로 사용한 제품을 확인해주세요
            </p>
            <p className="text-sm text-gray-600 leading-relaxed break-keep mb-5">
              추천만 받은 제품과 실제 사용한 제품을 구분해야 제품 효과 데이터를
              정확하게 분석할 수 있어요.
            </p>

            <div className="space-y-5">
              {feedbackTargetProducts.map(({ category, product }) => {
                const current = productUsageFeedback[product.id]?.status;

                const options = [
                  {
                    label: "꾸준히 사용함",
                    status: "consistent",
                  },
                  {
                    label: "가끔 사용함",
                    status: "occasional",
                  },
                  {
                    label: "중단함 / 거의 안 씀",
                    status: "stopped",
                  },
                ];

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4"
                  >
                    <p className="font-semibold mb-1">
                      {getCategoryLabel(category)} · {product.name}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {options.map((option) => (
                        <button
                          key={option.status}
                          onClick={() =>
                            handleProductUsageAnswer(product.id, option)
                          }
                          className={`px-3 py-2 rounded-xl text-sm border transition ${
                            current === option.status
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {feedbackQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6 min-h-[132px]"
          >
            <p className="text-base sm:text-lg font-semibold leading-relaxed break-keep mb-4">
              {q.q}
            </p>

            <div className="flex flex-wrap gap-2">
              {q.options.map((option) => {
                const active = answers[q.id]?.label === option.label;

                return (
                  <button
                    key={option.label}
                    onClick={() => handleAnswer(q.id, option)}
                    className={`px-4 py-2 rounded-2xl text-sm border transition active:scale-95 ${
                      active
                        ? "bg-black text-white border-black shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 break-keep mb-2">
            예상 다음 단계
          </p>
          <div className="text-3xl font-bold mb-2">{nextLevel}</div>
          <p className="text-sm text-gray-600 leading-relaxed break-keep">
            {nextRoutineInfo.label}
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <PrimaryButton
          onClick={() => setStep("recheck")}
          disabled={!isComplete}
        >
          피부 상태 다시 확인하기
        </PrimaryButton>
      </div>
    </section>
  );
}
