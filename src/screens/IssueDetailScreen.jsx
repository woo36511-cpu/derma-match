import { SectionTitle } from "../components/SectionTitle";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function IssueDetailScreen({
  selectedConcern,
  issueIndex,
  activeIssueQuestions,
  issueProgress,
  currentIssueQuestion,
  currentIssueAnswer,
  handleIssueAnswer,
  handlePrevIssue,
  handleNextIssue,
  isLastIssueQuestion,
}) {
  return (
    <section>
      <SectionTitle
        title={`${selectedConcern?.label || "피부 고민"} 상태를 조금 더 확인할게요`}
        desc="현재 상태를 더 구체적으로 확인하면 피부 루틴과 관리 방향을 더 정확하게 조정할 수 있어요."
      />

      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-500">
              {issueIndex + 1} / {activeIssueQuestions.length}
            </p>

            <p className="text-sm text-gray-400">
              {Math.round(issueProgress)}%
            </p>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${issueProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
          <p className="text-sm text-gray-400 mb-3">
            현재 고민 · {selectedConcern?.label}
          </p>

          <h2 className="text-2xl sm:text-3xl font-black leading-relaxed break-keep mb-6">
            {currentIssueQuestion.q}
          </h2>

          <div className="space-y-3">
            {currentIssueQuestion.options.map((option) => {
              const active = currentIssueAnswer?.value === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleIssueAnswer(currentIssueQuestion, option)
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
        </div>

        <div className="mt-8 flex gap-3 justify-between">
          <button
            onClick={handlePrevIssue}
            className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            이전
          </button>

          <PrimaryButton
            onClick={handleNextIssue}
            disabled={!currentIssueAnswer}
          >
            {isLastIssueQuestion ? "분석 결과 보기" : "다음"}
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
