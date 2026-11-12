import { ConcernTrackingFields, ConcernTrackingRecord } from "../components/ConcernTracking";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionTitle } from "../components/SectionTitle";

export function ConcernCheckScreen({ check, onHome, onDetailedFeedback, onMoisturizerCheck }) {
  if (!check.tracking) return <section className="mx-auto max-w-3xl space-y-4">
    <SectionTitle title="고민 변화 기록" desc="기록할 고민이 아직 없어요. 첫 설문에서 고민을 선택하면 이어서 기록할 수 있어요." />
    <PrimaryButton onClick={onHome}>시작 화면으로</PrimaryButton>
  </section>;
  return <section className="mx-auto max-w-3xl space-y-5">
    <SectionTitle title={check.saved ? "고민 변화를 저장했어요" : "지난 고민만 빠르게 체크"}
      desc={check.saved ? "내 피부 변화에서 지난 기록과 함께 볼 수 있어요." : "달라진 고민만 골라 저장해요. 제품이나 피부타입 설문은 다시 하지 않아도 돼요."} />
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p>새 증상이 생겼거나 더 불편해졌다면 지금 상태를 자세히 확인할 수 있어요.</p>
      <button type="button" onClick={check.startSymptoms} className="mt-2 font-semibold underline underline-offset-2">증상 자세히 확인하기</button>
    </div>
    {check.saved ? <ConcernTrackingRecord tracking={check.saved.concernTracking} /> :
      <ConcernTrackingFields questions={check.tracking.questions} answers={check.answers} onAnswer={check.answer} />}
    {check.error && <p role="alert" className="text-sm text-amber-950">기록을 저장하지 못했어요. 답변을 유지했으니 다시 저장해주세요.</p>}
    <div className="flex flex-wrap items-center gap-3">
      {check.saved ? <PrimaryButton onClick={check.openHistory}>내 피부 변화 보기</PrimaryButton> :
        <PrimaryButton onClick={check.save} disabled={!check.canSave}>{check.error ? "변화 저장 다시 시도" : "변화만 저장"}</PrimaryButton>}
      {onMoisturizerCheck && <button type="button" onClick={onMoisturizerCheck} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">보습제 변화 기록</button>}
      {onDetailedFeedback && <button type="button" onClick={onDetailedFeedback} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">루틴·제품 자세히 체크하기</button>}
      <button type="button" onClick={onHome} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">시작 화면으로</button>
    </div>
  </section>;
}
