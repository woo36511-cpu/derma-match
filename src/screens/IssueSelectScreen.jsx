import { SectionTitle } from "../components/SectionTitle";
import { skinConcernOptions } from "../data/skinIssueQuestions";
import { skinSurveyQuestions } from "../data/skinSurvey";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function IssueSelectScreen({
  surveyResult,
  mainConcern,
  setIssueAnswers,
  setIssueIndex,
  setMainConcern,
  setSurveyIndex,
  setStep,
  saveSurveyResult,
}) {
  return (
    <section>
      <SectionTitle
        title="지금 가장 신경 쓰이는 피부 고민은?"
        desc="기본 피부 상태와 별개로, 현재 가장 먼저 관리하고 싶은 문제를 하나 선택해주세요."
      />

      <div className="max-w-3xl mx-auto">
        <div className="mb-6 bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6">
          <p className="text-sm text-gray-400 mb-2">기본 피부 분석</p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-2 bg-gray-100 rounded-full text-sm font-semibold">
              {surveyResult.skinType}
            </span>

            <span className="px-3 py-2 bg-gray-100 rounded-full text-sm font-semibold">
              수분감 {surveyResult.hydrationLevel}단계
            </span>
          </div>

          <p className="mt-4 text-sm text-gray-500 leading-relaxed break-keep">
            기본 피부 상태는 확인했어요. 이제 현재 가장 신경 쓰이는 문제를
            확인해서 추천 방향을 더 구체적으로 좁혀볼게요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skinConcernOptions.map((concern) => {
            const active = mainConcern === concern.id;

            return (
              <button
                key={concern.id}
                onClick={() => {
                  if (mainConcern !== concern.id) {
                    setIssueAnswers({});
                    setIssueIndex(0);
                  }

                  setMainConcern(concern.id);
                }}
                className={`rounded-3xl border p-5 text-left transition active:scale-[0.98] ${
                  active
                    ? "bg-black text-white border-black shadow-md"
                    : "bg-white border-gray-100 hover:shadow-md"
                }`}
              >
                <h3 className="text-lg font-bold mb-2 break-keep">
                  {concern.label}
                </h3>

                <p
                  className={`text-sm leading-relaxed break-keep ${
                    active ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {concern.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-between gap-3">
          <button
            onClick={() => {
              setSurveyIndex(skinSurveyQuestions.length - 1);
              setStep("survey");
            }}
            className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            이전
          </button>

          <PrimaryButton
            disabled={!mainConcern}
            onClick={() => {
              if (
                mainConcern === "inflammatory_acne" ||
                mainConcern === "closed_comedones" ||
                mainConcern === "blackhead_sebum" ||
                mainConcern === "dehydration" ||
                mainConcern === "sensitivity_redness" ||
                mainConcern === "oiliness"
              ) {
                setIssueIndex(0);
                setStep("issueDetail");
                return;
              }

              saveSurveyResult();
              setStep("surveyResult");
            }}
          >
            다음
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
