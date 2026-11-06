import React from "react";
import { SymptomAssessmentCard } from "./SymptomAssessmentCard";
import { DetailDisclosure } from "./DetailDisclosure";

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
  products: "최근 바꾼 화장품의 사용 시작일과 피부 반응을 적어보고, 한 번에 하나씩 점검하세요.",
  observe: "돈을 더 쓰기 전에 현재 사용 제품과 증상 변화를 기록해요. 한 번에 여러 가지를 바꾸지 않으면 반응을 비교하기 쉬워요.",
};

export function SelfCarePlan({ assessment }) {
  if (!assessment || ["emergency", "urgent"].includes(assessment.urgency)) return null;
  const { concern, habit, barrier, recentProduct } = assessment.answers ?? {};
  const tip = barrier === "stinging" ? basicCare.sensitive : basicCare[concern] ?? basicCare.none;
  return <section className="rounded-3xl border border-emerald-100 bg-white p-5 sm:p-7 text-left space-y-4" aria-label="부담을 줄이는 개인 관리">
    <h2 className="text-xl font-bold">오늘 해볼 피부 관리</h2>
    <div className="rounded-2xl bg-emerald-50 p-4 text-sm space-y-2">
      <p className="font-semibold">세안·보습: 기본 피부 관리</p>
      <p>{tip}</p>
    </div>
    <p className="text-sm leading-relaxed">{habits[habit] || habits.observe}</p>
    {["cleanser", "moisturizer", "active", "other"].includes(recentProduct) &&
      <p className="text-sm text-slate-600">새 제품을 쓰기 시작한 날과 피부가 달라진 날을 함께 기록해보세요. 시점이 겹쳐도 그 제품이 원인이라고 단정할 수는 없어요.</p>}
    <DetailDisclosure title="생활습관 참고">
      <p>수면이나 식사가 달라진 날의 피부 반응이 궁금하면 따로 메모해도 좋아요. 간편한 채소는 식사를 보완하는 선택지예요. 유산균이나 특정 식품을 피부관리 필수품으로 권하지 않아요.</p>
    </DetailDisclosure>
    <p className="text-sm text-slate-600">2주 뒤에는 당김·가려움·새 트러블이 전보다 줄었는지 확인해요. 더 불편해지면 기다리지 말고 다시 체크하세요.</p>
    <DetailDisclosure title="개인 관리 근거 보기"><ul className="space-y-2">
      <li><a className="underline" target="_blank" rel="noreferrer" href="https://www.aad.org/public/diseases/acne/skin-care/tips/">AAD · 자극을 줄이는 기본 피부 관리</a></li>
      <li><a className="underline" target="_blank" rel="noreferrer" href="https://www.nice.org.uk/guidance/ng198/chapter/Recommendations">NICE · 특정 식단의 여드름 치료 근거는 충분하지 않음</a></li>
      <li><a className="underline" target="_blank" rel="noreferrer" href="https://www.nccih.nih.gov/health/probiotics-usefulness-and-safety">NCCIH · 유산균의 용도별 근거와 안전성</a></li>
    </ul></DetailDisclosure>
  </section>;
}
