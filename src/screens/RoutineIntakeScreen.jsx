import { useState } from "react";
import { RoutineProductLookup } from "../components/RoutineProductLookup";
import { PrimaryButton } from "../components/PrimaryButton";

const options = [["yes", "네, 지금 쓰는 제품이 있어요"], ["no", "아니요, 지금은 아무것도 안 써요"], ["skip", "제품 입력 없이 진행할래요"]];

export function RoutineIntakeScreen({ previous, routineReview, onNext, onBack }) {
  const [use, setUse] = useState(previous?.use ?? "");
  const [serum, setSerum] = useState(previous?.serumPreference ?? "");
  return <section className="mx-auto max-w-3xl space-y-5" aria-labelledby="routine-intake-title">
    <div className="space-y-3 rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-8">
      <p className="text-sm font-semibold text-emerald-700">피부 설문 · 첫 질문</p>
      <h1 id="routine-intake-title" className="text-2xl font-bold">지금 쓰는 화장품이 있나요?</h1>
      <p className="text-sm text-slate-700">세안제·토너·세럼·로션·크림·선크림처럼 평소에 쓰는 제품을 떠올려요. 제품명과 사용감을 알면 세안 뒤 당김이나 화장품을 바른 뒤 광택을 구분하는 데 참고해요.</p>
      <div className="grid gap-2" role="group" aria-label="현재 화장품 사용">
        {options.map(([value, label]) => <button key={value} type="button" aria-pressed={use === value} onClick={() => setUse(value)}
          className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm font-semibold ${use === value ? "border-emerald-800 bg-emerald-50" : "border-slate-200 bg-white"}`}>{label}</button>)}
      </div>
    </div>
    {use === "yes" && <div className="space-y-4">
      <RoutineProductLookup {...routineReview} profile={undefined} />
      <label className="block text-sm font-semibold">지금 쓰는 세럼은 어때요? (선택)
        <select value={serum} onChange={event => setSerum(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-2 font-normal">
          <option value="">선택하지 않음</option><option value="keep">편하게 쓰고 있어서 유지할래요</option><option value="compare">쓰지 않거나 다른 세럼을 비교하고 싶어요</option>
        </select>
      </label>
      <p className="text-sm text-slate-600">이름이 기억나지 않거나 일부 제품만 알아도 다음으로 갈 수 있어요.</p>
    </div>}
    <div className="flex justify-between gap-3">
      <button type="button" className="rounded-xl border px-4 py-3 text-sm" onClick={onBack}>시작 화면으로</button>
      <PrimaryButton disabled={!use} onClick={() => onNext(use, serum)}>피부 상태 질문으로</PrimaryButton>
    </div>
  </section>;
}
