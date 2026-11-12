import { useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionTitle } from "../components/SectionTitle";
import { getProductById } from "../utils/productCatalog";
import { CHECK_AFTER_DAYS, DAYS_MS, TIGHTNESS_QUESTION, validTightnessDays } from "../utils/moisturizerObservation";

const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white p-3";
const dayChoices = Array.from({ length: 8 }, (_, index) => [String(index), `${index}일`]);

function SelectField({ label, options, value, onChange }) {
  return <label className="block text-sm font-semibold">{label}
    <select className={fieldClass} value={value ?? ""} onChange={event => onChange(event.target.value)}>
      <option value="">선택해주세요</option>
      {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>
  </label>;
}

function ConsentField({ checked, onChange }) {
  return <div className="rounded-xl bg-slate-50 p-3">
    <label className="flex items-start gap-2 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="mt-1" />
      제품 사용과 피부 변화의 내부 분석에 동의해요 (선택)
    </label>
    <p className="mt-2 text-xs leading-relaxed text-slate-600">
      보습제 정보, 볼 당김, 사용 빈도, 자극·중단, 다른 변화 여부를 제품 추천을 개선하기 위한 내부 비교에 사용해요.
      동의일부터 1년 또는 철회할 때까지 집계에 포함돼요. 사진은 받지 않아요.
      동의하지 않아도 개인 기록을 저장하고 비교할 수 있고, 여기에서 언제든 철회할 수 있어요.
    </p>
  </div>;
}

export function MoisturizerObservationScreen({ observation, onHome }) {
  const [days, setDays] = useState("");
  const [choice, setChoice] = useState("");
  const [consent, setConsent] = useState(false);
  const [answers, setAnswers] = useState({});
  const record = observation.record;
  const study = record?.moisturizerObservation;
  const product = study ? getProductById(study.productId) : observation.offer?.product;
  const daysElapsed = study ? Math.max(0, Math.floor((Date.now() - new Date(study.startedAt)) / DAYS_MS)) : 0;
  const isEarly = daysElapsed < CHECK_AFTER_DAYS;
  const report = study?.followUp ?? study?.earlyCheck;
  const change = report ? study.baselineDays - report.days : null;
  const selected = (id, value) => setAnswers(previous => ({ ...previous, [id]: value }));
  const afterDays = answers.days === undefined || answers.days === "" ? NaN : Number(answers.days);
  const canFollow = validTightnessDays(afterDays) && ["used", "frequency", "reaction", "otherChanges"].every(id => answers[id]);
  const date = study ? new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" })
    .format(new Date(new Date(study.startedAt).getTime() + CHECK_AFTER_DAYS * DAYS_MS)) : null;

  return <section className="mx-auto max-w-2xl space-y-5">
    <SectionTitle title="보습제와 볼 당김 기록" desc="같은 질문을 다시 답해서 내 피부가 어떻게 달라졌는지 확인해요." />
    {product && <p className="rounded-xl bg-emerald-50 p-4 text-sm">추천받은 보습제 · <strong>{product.name}</strong></p>}
    {!study && observation.offer && <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-700">오늘 추천 보습제를 처음 썼거나 기존 보습제를 그대로 쓰고 있다면 시작할 수 있어요. 새 제품을 구매할 필요는 없어요. 처음 썼다면 오늘 사용하기 전까지의 상태로 답해요.</p>
      <SelectField label={TIGHTNESS_QUESTION} options={dayChoices} value={days} onChange={setDays} />
      {days === "0" && <p className="text-sm text-slate-700">이번 기록은 볼 당김이 있었던 경우에만 시작해요.</p>}
      <SelectField label="오늘 보습제를 어떻게 쓰기로 했나요?" value={choice} onChange={setChoice} options={[
        ["start", "추천 보습제를 오늘 처음 쓰기 시작했어요"], ["keep", "지금 쓰던 보습제를 그대로 유지할게요"],
      ]} />
      {observation.signedIn && <ConsentField checked={consent} onChange={setConsent} />}
      {!observation.signedIn && <p className="text-xs text-slate-600">로그인 없이 남긴 기록은 이 기기에서만 볼 수 있어요. 다른 사람의 기록과 함께 분석하지 않아요.</p>}
      <PrimaryButton disabled={!days || days === "0" || !choice} onClick={() => observation.enroll({ baselineDays: Number(days), choice, consent })}>시작 기록 저장</PrimaryButton>
    </div>}
    {study && <>
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
        <p className="font-semibold">{study.choice === "start" ? "추천 보습제 시작" : "기존 보습제 유지"} · 시작 전 볼 당김 {study.baselineDays}일</p>
        {!study.followUp && <p>같은 기준으로 다시 비교할 날 · {date} 이후</p>}
        {report && <p>{study.followUp ? "재체크" : "중간 기록"}: {report.days}일 · {change === 0 ? "당긴 날이 같아요" : change > 0 ? `${change}일 줄었어요` : `${-change}일 늘었어요`}</p>}
        {report && <p className="text-xs text-slate-600">내가 답한 전후 변화예요. 보습제 때문에 달라졌는지는 이 기록만으로 알 수 없어요.</p>}
      </div>
      {!study.followUp && !(isEarly && study.earlyCheck) && <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        {isEarly && <p className="text-sm text-slate-700">14일 전에는 중간 기록을 남길 수 있어요. 자극이 있거나 중단했다면 기다리지 말고 기록해요.</p>}
        <SelectField label={TIGHTNESS_QUESTION} options={dayChoices} value={answers.days} onChange={value => selected("days", value)} />
        <SelectField label="이 기간에 실제로 어떤 보습제를 썼나요?" value={answers.used} onChange={value => setAnswers(previous => ({ ...previous, used: value, frequency: value === "none" ? "none" : "" }))} options={[
          ["recommended", "추천받은 보습제"], ["existing", "원래 쓰던 보습제"], ["other", "둘 다 썼거나 다른 제품"], ["none", "쓰지 않았어요"],
        ]} />
        {answers.used !== "none" && <SelectField label="얼마나 자주 썼나요?" value={answers.frequency} onChange={value => selected("frequency", value)} options={[
          ["daily", "거의 매일"], ["sometimes", "가끔"],
        ]} />}
        <SelectField label="불편함이 있거나 사용을 중단했나요?" value={answers.reaction} onChange={value => selected("reaction", value)} options={[
          ["none", "둘 다 없어요"], ["irritation", "따가움·붉어짐이 있었어요"], ["stopped_irritation", "자극 때문에 중단했어요"], ["stopped_other", "다른 이유로 중단했어요"],
        ]} />
        <SelectField label="다른 제품·약 또는 생활 환경도 달라졌나요?" value={answers.otherChanges} onChange={value => selected("otherChanges", value)} options={[
          ["no", "달라지지 않았어요"], ["yes", "같이 달라졌어요"], ["unknown", "잘 모르겠어요"],
        ]} />
        <PrimaryButton disabled={!canFollow} onClick={() => observation.followUp({ ...answers, days: afterDays })}>{isEarly ? "중간 기록 저장" : "변화 기록 저장"}</PrimaryButton>
      </div>}
      {observation.signedIn && <ConsentField checked={Boolean(study.analysisConsent)} onChange={observation.setAnalysisConsent} />}
    </>}
    {!study && !observation.offer && <p className="text-sm text-slate-700">저장한 보습제 기록이 아직 없어요.</p>}
    {observation.error && <p role="alert" className="text-sm text-rose-800">기록을 저장하지 못했어요. 같은 화면에서 다시 시도해주세요.</p>}
    <button type="button" onClick={onHome} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">시작 화면으로</button>
  </section>;
}
