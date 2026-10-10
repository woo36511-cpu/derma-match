import { SectionTitle } from "../components/SectionTitle";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function QuickRecommendScreen({
  setQuickLevel,
  quickLevel,
  quickRoutineReason,
  quickRoutine,
  setStep,
  startQuickJourneyFeedback,
}) {
  return (
    <section>
      <SectionTitle
        title="내 피부타입으로 바로 추천받기"
        desc="본인 피부타입에 가까운 항목을 선택하면 수분감 단계에 맞춰 루틴을 추천합니다."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <button
          onClick={() => setQuickLevel(3)}
          className={`rounded-3xl border p-6 text-left transition active:scale-[0.98] ${
            quickLevel === 3
              ? "bg-black text-white border-black"
              : "bg-white border-gray-100 hover:shadow-md"
          }`}
        >
          <p className="text-sm opacity-70 mb-2">1~3단계</p>
          <h3 className="text-xl font-bold mb-2">건성 / 건조함</h3>
          <p className="text-sm leading-relaxed break-keep opacity-80">
            세안 후 당김이 있고 보습감이 오래가지 않는 타입
          </p>
        </button>

        <button
          onClick={() => setQuickLevel(5)}
          className={`rounded-3xl border p-6 text-left transition active:scale-[0.98] ${
            quickLevel === 5
              ? "bg-black text-white border-black"
              : "bg-white border-gray-100 hover:shadow-md"
          }`}
        >
          <p className="text-sm opacity-70 mb-2">4~6단계</p>
          <h3 className="text-xl font-bold mb-2">수부지 / 복합성</h3>
          <p className="text-sm leading-relaxed break-keep opacity-80">
            속은 건조한데 시간이 지나면 유분이 올라오는 타입
          </p>
        </button>

        <button
          onClick={() => setQuickLevel(8)}
          className={`rounded-3xl border p-6 text-left transition active:scale-[0.98] ${
            quickLevel === 8
              ? "bg-black text-white border-black"
              : "bg-white border-gray-100 hover:shadow-md"
          }`}
        >
          <p className="text-sm opacity-70 mb-2">7~10단계</p>
          <h3 className="text-xl font-bold mb-2">지성 / 번들거림</h3>
          <p className="text-sm leading-relaxed break-keep opacity-80">
            유분감이 많고 무거운 제품이 답답하게 느껴지는 타입
          </p>
        </button>
      </div>

      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <p className="text-sm text-gray-500 mb-2">선택된 수분감 단계</p>
          <div className="text-4xl font-bold mb-3">{quickLevel}단계</div>
          <ul className="space-y-2">
            {quickRoutineReason.map((text) => (
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
          title="추천 루틴"
          desc="선택한 피부타입에 맞춰 클렌저, 토너, 세럼, 크림을 하나씩 추천합니다."
        />

        <RoutineProductScroller
          productsByCategory={quickRoutine.products}
          userContext={{
            level: quickLevel,
            isSensitive: false,
            troubleScore: 0,
            skinType:
              quickLevel <= 4 ? "건성" : quickLevel <= 6 ? "수부지" : "지성",
            season: "spring",
            goal:
              quickLevel <= 4
                ? "보습"
                : quickLevel <= 6
                  ? "밸런스"
                  : "유분 밸런스",
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => setStep("start")}
          className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          시작 화면으로 돌아가기
        </button>

        <PrimaryButton onClick={startQuickJourneyFeedback}>
          이 루틴으로 시작하기
        </PrimaryButton>
      </div>
    </section>
  );
}
