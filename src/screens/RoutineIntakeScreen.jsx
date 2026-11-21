import { useState } from "react";
import { RoutineProductLookup } from "../components/RoutineProductLookup";
import { PrimaryButton } from "../components/PrimaryButton";
import { SurveyChoice } from "../components/SurveyChoice";
import { useScreenHeading } from "../hooks/useScreenHeading";

const options = [
  ["with_sunscreen", "세안제나 기초 화장품도 쓰고, 선크림도 발라요"],
  ["without_sunscreen", "세안제나 기초 화장품은 쓰지만, 선크림은 안 발라요"],
  ["sunscreen_only", "선크림만 발라요 (세안제를 같이 써도 돼요)"],
  ["no", "아니요, 지금은 아무것도 안 써요"],
  ["skip", "제품 입력 없이 진행할래요"],
];

const basicCategories = { cleanser: "세안제", toner: "토너", serum: "세럼", moisturizer: "크림" };
const sunscreenCategories = { cleanser: "세안제", sunscreen: "선크림" };
const allCategories = { ...basicCategories, sunscreen: "선크림", mask: "팩", lipCare: "립케어" };
const withoutSunscreenCategories = { ...basicCategories, mask: "팩", lipCare: "립케어" };

export function RoutineIntakeScreen({ previous, routineReview, onNext, onBack }) {
  const heading = useScreenHeading("routine-intake");
  const [choice, setChoice] = useState(previous?.routineScope ?? (previous?.use === "yes" ? "" : previous?.use ?? ""));
  const use = ["no", "skip", ""].includes(choice) ? choice : "yes";
  const scope = use === "yes" ? choice : undefined;
  const [serum, setSerum] = useState(previous?.serumPreference ?? "");
  const [continuing, setContinuing] = useState(false);
  const [continueWithoutCheck, setContinueWithoutCheck] = useState(false);
  const routine = routineReview.currentRoutine;
  const next = async () => {
    if (use !== "yes" || !routine?.checking || continueWithoutCheck) { onNext(use, choice === "sunscreen_only" ? "" : serum, undefined, scope); return; }
    setContinuing(true);
    const entries = await routine.entriesAfterChecks();
    onNext(use, choice === "sunscreen_only" ? "" : serum, entries, scope);
  };
  return <section className="mx-auto max-w-2xl space-y-5" aria-labelledby="routine-intake-title">
    <div className="care-panel space-y-3">
      <p className="care-kicker">피부 설문 · 첫 질문</p>
      <h1 id="routine-intake-title" ref={heading} tabIndex={-1} className="scroll-mt-28 text-2xl font-bold leading-snug tracking-tight focus:outline-none sm:text-3xl">지금 쓰는 화장품이 있나요?</h1>
      <p className="text-sm text-slate-700">세안제부터 토너·세럼·크림·선크림까지 평소에 쓰는 제품을 떠올려요. 이름과 사용감을 알려주면 유지할 제품을 찾는 데 참고해요.</p>
      <div className="grid gap-2 pt-2" role="group" aria-label="현재 화장품 사용">
        {options.map(([value, label]) => <SurveyChoice key={value} disabled={continuing} selected={choice === value} onClick={() => { setChoice(value); if (!["no", "skip"].includes(value)) routine?.checkExisting?.(); }}>{label}</SurveyChoice>)}
      </div>
    </div>
    {use === "yes" && <div className="space-y-4">
      <RoutineProductLookup {...routineReview} profile={undefined}
        categoryChoices={choice === "sunscreen_only" ? sunscreenCategories
          : choice === "without_sunscreen" ? withoutSunscreenCategories : allCategories} />
      {choice !== "sunscreen_only" && <label className="block text-sm font-semibold">지금 쓰는 세럼은 어때요? (선택)
        <select value={serum} onChange={event => setSerum(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-2 font-normal">
          <option value="">선택하지 않음</option><option value="keep">편하게 쓰고 있어서 유지할래요</option><option value="compare">쓰지 않거나 다른 세럼을 비교하고 싶어요</option>
        </select>
      </label>}
      <p className="text-sm text-slate-600">이름이 기억나지 않거나 일부 제품만 알아도 다음으로 갈 수 있어요.</p>
      {routine?.checking && <p role="status" className="text-sm text-emerald-900">담은 제품의 공식 전성분을 확인 중이에요.</p>}
      {routine?.checking && !continuing && <label className="flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={continueWithoutCheck} onChange={e => setContinueWithoutCheck(e.target.checked)} /> 확인을 기다리지 않고 계속하기
      </label>}
    </div>}
    <div className="flex justify-between gap-3">
      <button type="button" disabled={continuing} className="care-secondary" onClick={onBack}>시작 화면으로</button>
      <PrimaryButton disabled={!use || continuing} onClick={next}>{continuing ? "공식 자료 확인 중…" : "피부 상태 질문으로"}</PrimaryButton>
    </div>
  </section>;
}
