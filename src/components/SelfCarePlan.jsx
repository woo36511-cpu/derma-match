import React from "react";
import { SymptomAssessmentCard } from "./SymptomAssessmentCard";

const basicCare = {
  dry: "세안할 때 오래 문지르지 말고, 세안 뒤 당기기 전에 이미 잘 맞던 보습제를 발라보세요.",
  oily: "번들거려도 세안을 더 세게 하기보다, 순한 세안과 답답하지 않은 보습으로 시작해보세요.",
  breakouts: "트러블을 짜거나 문지르지 말고, 각질 제거제를 여러 개 겹치지 마세요. 쓰던 세안제·보습제가 편안했다면 그대로 유지해도 좋아요.",
  sensitive: "최근 추가한 화장품이 따갑다면 그 제품을 잠시 쉬고, 기존에 편안했던 세안과 보습만 남겨보세요.",
  none: "지금 편안하게 쓰고 있는 세안제와 보습제가 있다면 그대로 유지해도 좋아요.",
};

export function SymptomCareSummary({ assessment }) {
  const priority = ["emergency", "urgent", "clinic"].includes(assessment?.urgency);
  return <>
    {priority && <SymptomAssessmentCard assessment={assessment} />}
    <SelfCarePlan assessment={assessment} />
    {!priority && <SymptomAssessmentCard assessment={assessment} />}
  </>;
}

const habits = {
  barrier: "기존에 편안했던 세안·보습을 중심으로 단순하게 유지하고, 새 제품은 한꺼번에 여러 개 추가하지 않아요.",
  sleep: "자는 시간·스트레스와 피부 불편감을 함께 기록해요. 피부 변화의 원인이라고 단정하지 않고 반복되는 관계를 살펴봐요.",
  vegetables: "손질 채소·냉동 채소·동결건조 채소처럼 준비가 쉬운 선택지를 한 끼에 곁들여요. 제품별 실제 채소 함량·1회 섭취량·나트륨·당류를 보고, 균형 잡힌 식사를 대신하지 않아요.",
  gut: "식사·배변·장 불편감과 유산균 사용 여부를 함께 기록해요. 불편감만으로 장 면역력이 낮다고 판단하거나 피부 문제의 원인으로 확정하지 않아요.",
  observe: "돈을 더 쓰기 전에 현재 사용 제품과 증상 변화를 기록해요. 한 번에 여러 가지를 바꾸지 않으면 반응을 비교하기 쉬워요.",
};

export function SelfCarePlan({ assessment }) {
  if (!assessment || ["emergency", "urgent"].includes(assessment.urgency)) return null;
  const { concern, habit, barrier, probiotic, vegetables } = assessment.answers ?? {};
  const tip = barrier === "stinging" ? basicCare.sensitive : basicCare[concern] ?? basicCare.none;
  return <section className="rounded-3xl border border-emerald-100 bg-white p-5 sm:p-7 text-left space-y-4" aria-label="부담을 줄이는 개인 관리">
    <h2 className="text-xl font-bold">오늘 해볼 피부 관리</h2>
    <div className="rounded-2xl bg-emerald-50 p-4 text-sm space-y-2">
      <p className="font-semibold">세안·보습: 기본 피부 관리</p>
      <p>{tip}</p>
    </div>
    <p className="text-sm leading-relaxed">{habits[habit] || habits.observe}</p>
    {["gut", "vegetables"].includes(habit) && <details className="rounded-2xl bg-slate-50 p-4 text-sm space-y-2">
      <summary className="cursor-pointer font-semibold">장·식사 관리 참고</summary>
      <p className="font-semibold">유산균·식품: 피부 치료 근거가 제한적인 보조 선택</p>
      <p>장내 미생물·면역 반응·피부 상태의 연결을 살피는 ‘장–피부 축’ 연구와, 특정 유산균 복합제에서 여드름 개선을 관찰한 임상시험이 있어요. 제품·균주마다 결과가 달라 개인에게 같은 효과가 난다고 보장할 수는 없어요.</p>
      {probiotic === "recent" && <p>유산균을 최근 시작했다면 시작일과 가스·복통·배변 변화를 함께 적어두세요. 피부와 장의 변화가 같은 제품 때문이라고 바로 단정하지 않아요.</p>}
      {vegetables === "rare" && <p>채소를 거의 먹지 않는다면 추가 보충제를 사기 전에 준비하기 쉬운 채소를 한 끼에 곁들이는 것부터 계획해보세요.</p>}
      <p>유산균의 효과는 균주·목적·개인에 따라 달라요. 여드름·모낭염 치료나 ‘장 면역력 강화’를 보장하는 제품으로 추천하지 않아요. 특히 면역저하·중증 질환이 있으면 의료진과 먼저 상의하세요. 피부 개선을 위해 특정 제품을 꼭 구매할 필요는 없어요.</p>
      <p>선택할 때는 균주명, 기대하는 목적에 대한 사람 대상 연구, 보관 방법, 유통기한까지의 균수 보장과 알레르기 성분을 확인하세요. 장 증상이 지속되거나 심하면 보충제만 바꾸며 버티지 말고 진료받으세요.</p>
    </details>}
    <p className="text-sm text-slate-600">2주 뒤에는 당김·가려움·새 트러블이 전보다 줄었는지 확인해요. 더 불편해지면 기다리지 말고 다시 체크하세요.</p>
    <details className="text-xs text-slate-500"><summary className="cursor-pointer">개인 관리 근거 보기</summary><ul className="mt-3 space-y-2">
      <li><a className="underline" target="_blank" rel="noreferrer" href="https://www.aad.org/public/diseases/acne/skin-care/tips/">AAD · 자극을 줄이는 기본 피부 관리</a></li>
      <li><a className="underline" target="_blank" rel="noreferrer" href="https://www.nice.org.uk/guidance/ng198/chapter/Recommendations">NICE · 특정 식단의 여드름 치료 근거는 충분하지 않음</a></li>
      <li><a className="underline" target="_blank" rel="noreferrer" href="https://www.nccih.nih.gov/health/probiotics-usefulness-and-safety">NCCIH · 유산균의 용도별 근거와 안전성</a></li>
      <li><a className="underline" target="_blank" rel="noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/38751177/">특정 유산균 복합제의 12주 여드름 임상시험 · 다른 제형이나 모낭염에 그대로 적용할 수 없음</a></li>
      <li><a className="underline" target="_blank" rel="noreferrer" href="https://ods.od.nih.gov/factsheets/Probiotics-HealthProfessional/">NIH ODS · 균주별 근거와 제품 선택</a></li>
    </ul></details>
  </section>;
}
