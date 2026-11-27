import { SkinPhotoSurfaceCheck } from "../components/SkinPhotoSurfaceCheck";
import { useState } from "react";
import { searchRoutineProducts, getRoutineLookupProduct } from "../utils/routineLookup";
import { SkinObservationReference } from "../components/SkinObservationReference";
import { DetailDisclosure } from "../components/DetailDisclosure";
import { skinSurveyQuestions } from "../data/skinSurvey";
import { PrimaryButton } from "../components/PrimaryButton";
import { SurveyChoice } from "../components/SurveyChoice";
import { useScreenHeading } from "../hooks/useScreenHeading";
import React from "react";

function SurveyProductSearch({ question, selectedId, onSelect }) {
  const [query, setQuery] = useState("");
  const selected = getRoutineLookupProduct(selectedId);
  const { matches } = searchRoutineProducts(query, 8);
  return <div className="mb-4 space-y-2">
    <label htmlFor="survey-product-search" className="text-sm font-semibold">{question.id === "reactionProduct" ? "반응이 있었던 제품명" : "바꾼 화장품 제품명"}</label>
    <input id="survey-product-search" type="search" maxLength={100} value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-xl border border-stone-300 p-3" />
    {selected && <p className="text-sm font-semibold text-forest-700">선택한 제품: {selected.name}{selected.volume && ` · ${selected.volume}`}</p>}
    {query.trim().length >= 2 && !matches.length && <p className="text-sm">일치하는 제품이 없어요. 아래에서 종류를 골라도 돼요.</p>}
    {matches.map(product => {
      const category = question.options.find(option => option.value === product.category);
      return category && <SurveyChoice key={product.id} selected={selectedId === product.id}
        onClick={() => onSelect(question, { ...category, productId: product.id })}>
        {product.name}{product.volume && ` · ${product.volume}`}
      </SurveyChoice>;
    })}
    <p className="text-xs text-slate-600">제품명이 불확실하면 종류만 골라주세요.</p>
  </div>;
}

export function SurveyScreen({
  surveyIndex,
  surveyProgress,
  currentSurveyQuestion,
  currentSurveyAnswer,
  changedProductId,
  reactionProductId,
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
  const productSearch = ["changedProduct", "reactionProduct"].includes(currentSurveyQuestion.id);
  const selectedProductId = currentSurveyQuestion.id === "reactionProduct" ? reactionProductId : changedProductId;
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
          {currentSurveyQuestion.id === "moisturizerUse" && currentSurveyQuestion.options.some(option => option.value === "heavy_tight") &&
            <DetailDisclosure title="속당김이 어떤 느낌인지 모르겠나요?" className="mb-5">
              <p>크림을 발라 겉은 촉촉하거나 끈적이는데도 피부가 팽팽하게 조이는 듯한 느낌이에요. 예를 들어 입을 벌리거나 웃을 때 볼이나 입 주변이 잡아당겨지는 듯할 수 있어요.</p>
              <p className="mt-2">겉이 무겁거나 끈적이기만 하고 조이는 느낌은 없다면 ‘따갑지는 않지만 무겁거나 끈적여요’를 골라요.</p>
            </DetailDisclosure>}
          <SkinObservationReference kind={currentSurveyQuestion.visual} />
          {(currentSurveyQuestion.visual || currentSurveyQuestion.id === "surfaceObservation") && <SkinPhotoSurfaceCheck question={currentSurveyQuestion} answer={currentSurveyAnswer} onAnswer={handleSurveyAnswer} />}
          {multiple && <p className="mb-3 text-sm font-medium text-forest-700">해당하는 항목을 모두 골라주세요.</p>}
          {productSearch && <SurveyProductSearch key={currentSurveyQuestion.id} question={currentSurveyQuestion} selectedId={selectedProductId} onSelect={handleSurveyAnswer} />}
          <div className="grid gap-2.5" role="group" aria-labelledby="survey-question">
            {currentSurveyQuestion.options.map((option) => {
              const active =
                multiple
                  ? Array.isArray(currentSurveyAnswer) &&
                    currentSurveyAnswer.includes(option.label)
                  : currentSurveyAnswer === option.label && (!productSearch || selectedProductId == null);

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
