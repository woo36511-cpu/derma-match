import { SectionTitle } from "../components/SectionTitle";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { PrimaryButton } from "../components/PrimaryButton";
import React from "react";

export function StarterScreen({
  starterRoutineInfo,
  starterRoutine,
  userContext,
  setBaseLevel,
  starterLevel,
  setAnswers,
  setStep,
}) {
  return (
    <section>
      <SectionTitle
        title={starterRoutineInfo.label}
        desc="처음 사용하는 사람도 시작하기 쉬운 기본 스타터 세트입니다."
      />

      <RoutineProductScroller
        productsByCategory={starterRoutine.products}
        userContext={userContext}
      />

      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-lg font-semibold leading-relaxed break-keep mb-2">
            2주 정도 사용해본 뒤 다음 단계로 넘어가세요
          </p>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep">
            사용 후 당김, 번들거림, 답답함, 트러블 변화를 기준으로 더 촉촉하게
            갈지, 그대로 갈지, 더 가볍게 갈지 조정합니다.
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <PrimaryButton
          onClick={() => {
            setBaseLevel(starterLevel);
            setAnswers({});
            setStep("feedback");
          }}
        >
          2주 사용 후 피드백 입력
        </PrimaryButton>
      </div>
    </section>
  );
}
