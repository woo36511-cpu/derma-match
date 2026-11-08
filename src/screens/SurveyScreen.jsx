import { DetailDisclosure } from "../components/DetailDisclosure";
import { SectionTitle } from "../components/SectionTitle";
import { skinSurveyQuestions } from "../data/skinSurvey";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function SurveyScreen({
  surveyIndex,
  surveyProgress,
  currentSurveyQuestion,
  currentSurveyAnswer,
  handleSurveyAnswer,
  handlePrevSurvey,
  handleNextSurvey,
  isCurrentSurveyAnswered,
  isLastSurveyQuestion,
  simpleMode = false,
  questionsCount = skinSurveyQuestions.length,
}) {
  return (
    <section>
      <SectionTitle
        title="피부 설문 시작"
        desc="평소 관리하면서 관찰한 상태로 답해요. 모르면 그대로 골라도 돼요. 일부 답변에 따라 질문이 추가돼요."
      />

      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-500">
              {surveyIndex + 1} / {questionsCount}
            </p>

            <p className="text-sm text-gray-400">
              {Math.round(surveyProgress)}%
            </p>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${surveyProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
          <p className="text-sm text-gray-400 mb-3">질문 {surveyIndex + 1}</p>

          <h2 className="text-2xl sm:text-3xl font-black leading-relaxed break-keep mb-6">
            {currentSurveyQuestion.question}
          </h2>

          {currentSurveyQuestion.hint && <p className="mb-4 text-sm text-slate-600">{currentSurveyQuestion.hint}</p>}
          {currentSurveyQuestion.helper && <DetailDisclosure title="답변 기준 자세히 보기" className="mb-5"><p>{currentSurveyQuestion.helper}</p></DetailDisclosure>}
          <div className="space-y-3">
            {currentSurveyQuestion.options.map((option) => {
              const active =
                currentSurveyQuestion.type === "multi"
                  ? Array.isArray(currentSurveyAnswer) &&
                    currentSurveyAnswer.includes(option.label)
                  : currentSurveyAnswer === option.label;

              return (
                <button
                  key={option.label}
                  aria-pressed={active}
                  onClick={() =>
                    handleSurveyAnswer(currentSurveyQuestion, option)
                  }
                  className={`w-full text-left px-5 py-4 rounded-2xl text-sm sm:text-base border transition active:scale-[0.98] break-keep ${
                    active
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {currentSurveyQuestion.type === "multi" && (
            <p className="mt-4 text-xs sm:text-sm text-gray-400 leading-relaxed break-keep">
              여러 개 선택할 수 있어요. 다 골랐으면 다음을 눌러주세요.
            </p>
          )}
        </div>

        <div className="mt-8 flex gap-3 justify-between">
          <button
            onClick={handlePrevSurvey}
            className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            {surveyIndex === 0 ? "시작 화면으로" : "이전"}
          </button>

          <PrimaryButton
            onClick={handleNextSurvey}
            disabled={!isCurrentSurveyAnswered}
          >
            {isLastSurveyQuestion ? simpleMode ? "추가 고민 선택" : "피부 고민 선택" : "다음"}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
