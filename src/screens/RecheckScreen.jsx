import { SectionTitle } from "../components/SectionTitle";
import { skinSurveyQuestions } from "../data/skinSurvey";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function RecheckScreen({
  feedbackSurveyAnswers,
  handleFeedbackSurveyAnswer,
  saveFeedbackResult,
  feedbackSurveyComplete,
}) {
  return (
    <section>
      <SectionTitle
        title="현재 피부 상태 다시 확인"
        desc="처음과 같은 질문으로 다시 측정해 Before / After를 같은 기준으로 비교합니다."
      />

      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-gray-50 rounded-3xl p-5 sm:p-6">
          <p className="text-sm text-gray-600 leading-relaxed break-keep">
            이 단계는 제품 효과를 단정하기 위한 검사가 아니라, 처음과 동일한
            기준으로 현재 피부 상태 변화를 기록하기 위한 재체크예요.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">
        {skinSurveyQuestions.map((question) => {
          const currentAnswer = feedbackSurveyAnswers[question.id];

          return (
            <div
              key={question.id}
              className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6"
            >
              <p className="text-base sm:text-lg font-semibold leading-relaxed break-keep mb-4">
                {question.question}
              </p>

              <div className="flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const active =
                    question.type === "multi"
                      ? Array.isArray(currentAnswer) &&
                        currentAnswer.includes(option.label)
                      : currentAnswer === option.label;

                  return (
                    <button
                      key={option.label}
                      onClick={() =>
                        handleFeedbackSurveyAnswer(question, option)
                      }
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
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <PrimaryButton
          onClick={saveFeedbackResult}
          disabled={!feedbackSurveyComplete}
        >
          변화 저장하고 다음 추천 보기
        </PrimaryButton>
      </div>
    </section>
  );
}
