import { SkinObservationReference } from "../components/SkinObservationReference";
import { DetailDisclosure } from "../components/DetailDisclosure";
import { skinSurveyQuestions } from "../data/skinSurvey";
import { PrimaryButton } from "../components/PrimaryButton";
import { SurveyChoice } from "../components/SurveyChoice";
import { useScreenHeading } from "../hooks/useScreenHeading";
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
  afterRoutineIntake = false,
  questionsCount = skinSurveyQuestions.length,
}) {
  const heading = useScreenHeading(currentSurveyQuestion.id);
  const multiple = currentSurveyQuestion.type === "multi";
  return (
    <section className="mx-auto max-w-2xl" aria-labelledby="survey-question">
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="care-kicker">피부 설문 · 피부 상태</p>
            <p className="text-xs font-semibold tabular-nums text-slate-600">{surveyIndex + 1} / {questionsCount}</p>
          </div>
          <div role="progressbar" aria-label="피부 설문 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(surveyProgress)} className="h-1.5 overflow-hidden rounded-full bg-forest-100">
            <div
              className="h-full rounded-full bg-forest-700 motion-safe:transition-[width] motion-safe:duration-300"
              style={{ width: `${surveyProgress}%` }}
            />
          </div>
        </div>

        <div className="care-panel">
          <p className="care-kicker mb-2">{currentSurveyQuestion.supplemental ? "답변을 돕는 추가 질문" : `질문 ${surveyIndex + 1}`}</p>

          <h1 id="survey-question" ref={heading} tabIndex={-1} className="mb-4 scroll-mt-28 text-2xl font-bold leading-snug tracking-tight focus:outline-none sm:text-3xl">
            {currentSurveyQuestion.question}
          </h1>

          {currentSurveyQuestion.hint && <p className="mb-4 text-sm text-slate-600">{currentSurveyQuestion.hint}</p>}
          {currentSurveyQuestion.helper && <DetailDisclosure title="답변 기준 자세히 보기" className="mb-5"><p>{currentSurveyQuestion.helper}</p></DetailDisclosure>}
          <SkinObservationReference kind={currentSurveyQuestion.visual} />
          {multiple && <p className="mb-3 text-sm font-medium text-forest-700">해당하는 항목을 모두 골라주세요.</p>}
          <div className="grid gap-2.5" role="group" aria-labelledby="survey-question">
            {currentSurveyQuestion.options.map((option) => {
              const active =
                multiple
                  ? Array.isArray(currentSurveyAnswer) &&
                    currentSurveyAnswer.includes(option.label)
                  : currentSurveyAnswer === option.label;

              return (
                <SurveyChoice
                  key={option.label}
                  selected={active}
                  multiple={multiple}
                  onClick={() => handleSurveyAnswer(currentSurveyQuestion, option)}
                >
                  {option.label}
                </SurveyChoice>
              );
            })}
          </div>

        </div>

        <div className="mt-4 flex justify-between gap-3 sm:mt-6">
          <button
            type="button"
            onClick={handlePrevSurvey}
            className="care-secondary"
          >
            {surveyIndex === 0 ? afterRoutineIntake ? "화장품 답변으로" : "시작 화면으로" : "이전"}
          </button>

          <PrimaryButton
            onClick={handleNextSurvey}
            disabled={!isCurrentSurveyAnswered}
          >
            {isLastSurveyQuestion ? simpleMode ? "추가 고민 선택" : "피부 고민 선택" : "다음"}
          </PrimaryButton>
        </div>
    </section>
  );
}
