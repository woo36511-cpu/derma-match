import { useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionTitle } from "../components/SectionTitle";
import { getProductById } from "../utils/productCatalog";
import {
  CHECK_AFTER_DAYS, DAYS_MS, COMFORT_QUESTION, COMFORT_OPTIONS, validTightnessDays,
  describeTightnessChange, describeComfortChange, getObservationKind, getObservationStudy,
} from "../utils/moisturizerObservation";

const fieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white p-3";
const dayChoices = Array.from({ length: 8 }, (_, index) => [String(index), `${index}일`]);
const choicesWithUnknown = [...dayChoices, ["unknown", "잘 기억나지 않아요"]];
const numberOrNull = value => !value || value === "unknown" ? null : Number(value);

function SelectField({ label, options, value, onChange }) {
  return <label className="block text-sm font-semibold">{label}
    <select className={fieldClass} value={value ?? ""} onChange={event => onChange(event.target.value)}>
      <option value="">선택해주세요</option>
      {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
    </select>
  </label>;
}

function ConsentField({ checked, onChange, legacy }) {
  return <div className="rounded-xl bg-slate-50 p-3">
    <label className="flex items-start gap-2 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="mt-1" />
      제품 사용과 피부 변화의 내부 분석에 동의해요 (선택)
    </label>
    <p className="mt-2 text-xs leading-relaxed text-slate-600">
      {legacy ? "보습제 정보, 볼 당김, 사용 빈도, 자극·중단, 다른 변화 여부" :
        "제품 정보, 피부 성향, 당김·피부 불편함, 사용 빈도, 자극·중단, 다른 변화 여부"}를 추천 개선을 위한 내부 비교에 사용해요.
      동의일부터 1년 또는 철회할 때까지 집계에 포함돼요. 사진은 받지 않아요.
      동의하지 않아도 개인 기록을 저장하고 비교할 수 있고, 여기에서 언제든 철회할 수 있어요.
    </p>
  </div>;
}

function ObservationHistory({ history, onSelect }) {
  return <div className="space-y-3">
    {history.map(record => {
      const study = getObservationStudy(record);
      const config = getObservationKind(study?.protocol);
      if (!config) return null;
      const product = getProductById(study.productId);
      return <button key={record.id} type="button" onClick={() => onSelect(record.id)}
        className="block w-full rounded-xl border border-slate-200 bg-white p-4 text-left">
        <strong className="block">{config.label} · {study.followUp ? "비교 완료" : "변화 기록 열기"}</strong>
        <span className="text-sm text-slate-700">{study.choice === "keep" ? "기존 제품 유지" : product?.name ?? "추천 제품"} · {study.startedAt.slice(0, 10)}</span>
      </button>;
    })}
  </div>;
}

export function MoisturizerObservationScreen({ observation, onHome }) {
  const [days, setDays] = useState("");
  const [comfort, setComfort] = useState("");
  const [choice, setChoice] = useState("");
  const [consent, setConsent] = useState(false);
  const [answers, setAnswers] = useState({});
  const study = getObservationStudy(observation.record);
  const config = study ? getObservationKind(study.protocol) : observation.offer?.config;
  const product = study ? getProductById(study.productId) : observation.offer?.product;
  const daysElapsed = study ? Math.floor((Date.now() - new Date(study.startedAt)) / DAYS_MS) : 0;
  const isEarly = daysElapsed < CHECK_AFTER_DAYS;
  const report = study?.followUp ?? study?.earlyCheck;
  const change = report && config ? describeTightnessChange(study, report, config.symptom) : null;
  const comfortChange = report && study ? describeComfortChange(study, report) : null;
  const reaction = report?.reaction;
  const selected = (id, value) => setAnswers(previous => ({ ...previous, [id]: value }));
  const afterDays = numberOrNull(answers.days);
  const canFollow = (validTightnessDays(afterDays) || (!config?.legacy && answers.days === "unknown")) &&
    ["used", "frequency", "reaction", "otherChanges"].every(id => answers[id]);
  const date = study ? new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" })
    .format(new Date(new Date(study.startedAt).getTime() + CHECK_AFTER_DAYS * DAYS_MS)) : null;
  const label = config?.label;

  return <section className="mx-auto max-w-2xl space-y-5">
    <SectionTitle title={config ? `${label} 사용과 피부 변화 기록` : "화장품 사용과 피부 변화 기록"}
      desc="같은 질문에 다시 답해서 내 피부가 어떻게 달라졌는지 확인해요." />
    {product && study?.choice !== "keep" && <p className="rounded-xl bg-emerald-50 p-4 text-sm">추천받은 {label} · <strong>{product.name}</strong></p>}
    {!study && config && <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-700">추천 제품을 오늘 처음 쓰기 시작했거나, 기존 제품을 그대로 쓸 때 기록할 수 있어요. 새 제품은 한 가지씩 바꿔야 변화를 비교하기 쉬워요. 처음 썼다면 오늘 사용하기 전까지의 상태로 답해요.</p>
      <SelectField label={config.question} options={choicesWithUnknown} value={days} onChange={setDays} />
      {(days === "0" || days === "unknown") && <p className="text-sm text-slate-700">이 비교는 최근 7일에 당긴 날이 있었고, 그 일수를 기억할 때 시작할 수 있어요.</p>}
      <SelectField label={COMFORT_QUESTION} options={COMFORT_OPTIONS} value={comfort} onChange={setComfort} />
      <SelectField label="오늘 이 제품을 어떻게 쓰기로 했나요?" value={choice} onChange={setChoice} options={[
        ["start", "추천 제품을 오늘 처음 쓰기 시작했어요"], ["keep", "지금 쓰던 제품을 그대로 유지할게요"],
      ]} />
      {observation.signedIn && <ConsentField checked={consent} onChange={setConsent} />}
      {!observation.signedIn && <p className="text-xs text-slate-600">로그인 없이 남긴 기록은 이 기기에서만 볼 수 있어요. 다른 사람의 기록과 함께 분석하지 않아요.</p>}
      <PrimaryButton disabled={!(Number(days) > 0) || !choice} onClick={() => observation.enroll({ baselineDays: Number(days), comfort: numberOrNull(comfort), choice, consent })}>시작 기록 저장</PrimaryButton>
    </div>}
    {study && config && <>
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm" aria-live="polite">
        <p className="font-semibold">{study.choice === "start" ? `추천 ${label} 시작` : `기존 ${label} 유지`} · 시작 전 {config.symptom} {study.baselineDays}일</p>
        {!study.followUp && <p>같은 기준으로 다시 비교할 날 · {date} 이후</p>}
        {change && <p>{study.followUp ? "재체크" : "중간 기록"}: {change}</p>}
        {comfortChange && <p>{comfortChange}</p>}
        {["irritation", "stopped_irritation", "stopped_other"].includes(reaction) && <p>
          {reaction === "irritation" ? "사용 중 따가움·붉어짐이 있었어요."
            : reaction === "stopped_irritation" ? "자극으로 사용을 중단했어요." : "다른 이유로 사용을 중단했어요."}
        </p>}
        {report && <p className="text-xs text-slate-600">내가 답한 전후 변화예요. 어떤 요인 때문에 달라졌는지는 이 기록만으로 알 수 없어요.</p>}
      </div>
      {!study.followUp && !(isEarly && study.earlyCheck) && <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        {isEarly && <p className="text-sm text-slate-700">14일 전에는 중간 기록을 남길 수 있어요. 자극이 있거나 중단했다면 기다리지 말고 기록해요.</p>}
        <SelectField label={config.question} options={config.legacy ? dayChoices : choicesWithUnknown} value={answers.days} onChange={value => selected("days", value)} />
        {!config.legacy && <SelectField label={COMFORT_QUESTION} options={COMFORT_OPTIONS} value={answers.comfort} onChange={value => selected("comfort", value)} />}
        <SelectField label="이 기간에 실제로 어떤 제품을 썼나요?" value={answers.used} onChange={value => setAnswers(previous => ({ ...previous, used: value, frequency: value === "none" ? "none" : "" }))} options={[
          ["recommended", "추천받은 제품"], ["existing", "원래 쓰던 제품"], ["other", "둘 다 썼거나 다른 제품"], ["none", "쓰지 않았어요"],
        ]} />
        {answers.used !== "none" && <SelectField label="얼마나 자주 썼나요?" value={answers.frequency} onChange={value => selected("frequency", value)} options={[
          ["daily", "거의 매일"], ["sometimes", "가끔"],
        ]} />}
        <SelectField label="불편함이 있거나 사용을 중단했나요?" value={answers.reaction} onChange={value => selected("reaction", value)} options={[
          ["none", "둘 다 없어요"], ["irritation", "따가움·붉어짐이 있었어요"], ["stopped_irritation", "자극 때문에 중단했어요"], ["stopped_other", "다른 이유로 중단했어요"],
        ]} />
        <SelectField label="다른 화장품·약·세안 습관이나 생활 환경도 달라졌나요?" value={answers.otherChanges} onChange={value => selected("otherChanges", value)} options={[
          ["no", "달라지지 않았어요"], ["yes", "같이 달라졌어요"], ["unknown", "잘 모르겠어요"],
        ]} />
        <PrimaryButton disabled={!canFollow} onClick={() => observation.followUp({ ...answers, days: afterDays, comfort: numberOrNull(answers.comfort) })}>{isEarly ? "중간 기록 저장" : "변화 기록 저장"}</PrimaryButton>
      </div>}
      {observation.signedIn && <ConsentField checked={Boolean(study.analysisConsent)} onChange={observation.setAnalysisConsent} legacy={config.legacy} />}
    </>}
    {!config && <ObservationHistory history={observation.history} onSelect={observation.selectRecord} />}
    {observation.error && <p role="alert" className="text-sm text-rose-800">기록을 저장하지 못했어요. 같은 화면에서 다시 시도해주세요.</p>}
    <div className="flex flex-wrap gap-2">
      {config && observation.history.length > 1 && <button type="button" onClick={observation.showHistory} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">다른 제품 기록 보기</button>}
      <button type="button" onClick={onHome} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">시작 화면으로</button>
    </div>
  </section>;
}
