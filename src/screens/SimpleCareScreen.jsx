import { getProductById } from "../utils/productCatalog";
import { RECOMMENDATION_RULE_VERSION } from "../utils/productEvidence";
import { AcneCareReview } from "../components/AcneCareReview";
import { buildAcneCareReview } from "../utils/acneCareReview";
import { ADAPTIVE_SURVEY_VERSION } from "../data/adaptiveObservationSurvey";
import { CosmeticAddOnSection } from "../components/CosmeticAddOnSection";
import { buildCosmeticAddOnPlan } from "../utils/cosmeticAddOnPlan";
import { useMemo, useState } from "react";
import { acneAreas, getSimpleCareQuestions, cleanSimpleCareAnswers } from "../data/simpleCare";
import { buildSimpleCarePlan, SIMPLE_CARE_VERSION } from "../utils/simpleCarePlan";
import { buildSimpleSkinRecord } from "../utils/simpleSkinRecord";
import { buildDynamicRoutine } from "../utils/routineRecommendation";
import { AcnePhotoReference } from "../components/AcnePhotoReference";
import { FolliculitisOptions } from "../components/FolliculitisOptions";
import { ConcernProductOptions } from "../components/ConcernProductOptions";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { getObservationKinds, getProductObservationOffers } from "../utils/moisturizerObservation";
import { DetailDisclosure } from "../components/DetailDisclosure";

export function ObservationSummary({ profile }) {
  const assessment = profile.observationAssessment;
  if (!assessment) return <p className="text-sm text-slate-600">예전 설문 기준으로 저장된 결과예요. 당시 답변과 점수를 유지했어요.</p>;
  return <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 space-y-3" aria-label="관찰한 특징과 추천 근거">
    <h2 className="text-lg font-bold">답변에서 확인한 특징</h2>
    {assessment.evidence.length > 0 ? <ul className="list-disc pl-5 space-y-1">{assessment.evidence.map(item => <li key={item}>{item}</li>)}</ul> : <p>{assessment.careActions ? "아직 확인되지 않은 항목은 남겨두고, 아래 기본 관리부터 시작해요." : "아직 피부 성향을 정할 관찰 답변이 부족해요."}</p>}
    {assessment.resolvedWithFollowUps && <p className="text-sm text-emerald-800">도움 질문에서 확인한 답변도 반영했어요.</p>}
    <p className="font-medium">{assessment.recommendationReason}</p>
    {assessment.environmentContext && <div className="space-y-1 rounded-xl border border-emerald-100 bg-white p-3 text-sm">
      <h3 className="font-semibold">최근 달라진 환경</h3>
      <p>{assessment.environmentContext.label}</p>
      <p>{assessment.environmentContext.nextAction}</p>
      <p className="text-xs text-slate-600">함께 달라진 환경을 기록했어요. 이 답만으로 피부타입이나 변화의 원인을 정하지 않아요.</p>
    </div>}
    {assessment.careActions?.length > 0 && <div className="space-y-2"><h3 className="font-semibold">지금 시작할 관리</h3><ul className="list-disc pl-5 space-y-1">{assessment.careActions.map(item => <li key={item}>{item}</li>)}</ul></div>}
    {assessment.nextObservations?.length > 0 && <DetailDisclosure title="다음에 확인하면 더 맞출 수 있어요"><ul className="list-disc pl-5 space-y-2">{assessment.nextObservations.map(item => <li key={item}>{item}</li>)}</ul></DetailDisclosure>}
    {assessment.uncertainties.length > 0 && <DetailDisclosure title="아직 확인하지 못한 점">{assessment.uncertainties.map(item => <p key={item} className="mt-2">{item}</p>)}</DetailDisclosure>}
    <p className="text-xs text-slate-600">자가 응답을 이용한 관리 방향이에요. 피부 수분·유분·pH나 장벽 기능을 측정한 검사가 아니며, 정확도가 검증된 진단 도구는 아니에요.</p>
  </section>;
}

export function applyObservationToCarePlan(plan, profile) {
  const assessment = profile.observationAssessment;
  if (!assessment || plan.blockNewBasics) return plan;
  if (assessment.currentIrritation) return { ...plan, blockNewBasics: true, pharmacy: null, showFolliculitis: false, title: "현재 자극부터 가라앉히는 방향으로 줄여요.", detail: assessment.recommendationReason };
  if (profile.surveyVersion === ADAPTIVE_SURVEY_VERSION && plan.answers.concern === "none" && (!assessment.typeComplete || !assessment.canRecommendBasics)) return { ...plan, title: "확인된 특징으로 기본 관리부터 시작해요.", detail: assessment.canRecommendBasics ? "아래 후보는 확인된 특징을 기준으로 골랐어요. 잘 맞는 제품이 있다면 유지하고 필요한 카테고리만 살펴봐요." : "아래 시작할 관리를 먼저 실천해요. 새 기본 제품 선택은 현재 편안함과 유분·당김이 확인되면 이어갈 수 있어요." };
  if (!assessment.canRecommendBasics && plan.answers.concern === "none") return { ...plan, title: "기본 제품을 고르기 전에 피부타입 답변을 보완해요.", detail: "아래 확인하지 못한 점을 보고 평소 경험으로 답해요. 잘 맞는 기존 세안·보습은 유지해요." };
  return plan;
}

export function SimpleCareResult({ profile, routine, plan, onReviewRoutine }) {
  return <div className="space-y-6">
    <header className="space-y-2"><p className="text-sm font-semibold text-emerald-700">내 피부 관리 결과</p><h1 className="text-2xl sm:text-3xl font-bold">{profile.skinType} · 기본 루틴과 필요한 추가 관리</h1><p className="text-sm text-slate-600">설문으로 추정한 피부타입이에요. 질환·원인균을 확정한 결과는 아니에요.</p></header>
    {onReviewRoutine && <button type="button" onClick={onReviewRoutine} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">지금 쓰는 제품 점검하기</button>}
    <ObservationSummary profile={profile} />
    <section className="space-y-3 rounded-2xl bg-white border border-slate-200 p-5" aria-label="추가 고민 관리">
      {plan.concernSummary && <p className="text-sm font-semibold text-emerald-800">먼저 고른 고민: {plan.concernSummary.primary.label}{plan.concernSummary.primary.area && ` · ${plan.concernSummary.primary.area}`}</p>}
      <h2 className="text-lg font-bold">{plan.title}</h2><p>{plan.detail}</p>
      <ConcernProductOptions plan={plan} />
      {plan.showFolliculitis && <FolliculitisOptions />}
      {plan.answers.shape === "deep" && plan.answers.medicine !== "none" && <p className="text-sm">깊은 덩이는 짜지 않아요. 계속 커지거나 통증·흉터가 생기면 확인이 필요해요.</p>}
    </section>
    {plan.concernSummary && <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" aria-label="함께 선택한 고민">
      <h2 className="text-lg font-bold">함께 선택한 고민</h2>
      <ul className="space-y-3">{plan.concernSummary.secondary.map(item => <li key={item.shape}>
        <p className="font-semibold">{item.label}{item.area && ` · ${item.area}`}</p>
        <p className="text-sm text-slate-700">{item.observation}</p>
      </li>)}</ul>
      <p className="text-sm text-slate-600">지금은 위의 관리부터 살펴보고, 다른 고민에 새 제품을 한꺼번에 추가하지 않아요.</p>
    </section>}
    <AcneCareReview review={buildAcneCareReview(plan)} />
    {!plan.blockNewBasics && profile.observationAssessment?.canRecommendBasics !== false && <section className="space-y-4" aria-label="피부타입별 기본 화장품">
      <h2 className="text-xl font-bold">피부타입에 맞는 기본 화장품</h2>
      <p className="text-sm">아무 관리도 하지 않았다면 아래 4가지 카테고리를 비교해요. 세안제·보습제를 먼저 고르고, 토너·세럼은 필요할 때 추가해요. 이미 잘 맞는 제품이 있다면 그대로 유지해요.</p>
      <RoutineProductScroller productsByCategory={routine.products} userContext={{ skinType: profile.skinType, level: profile.hydrationLevel, careNeeds: profile.careNeeds, isSensitive: profile.observationAssessment?.isSensitive, acneSupport: plan.answers.concern === "acne", mainConcern: "none" }} />
      <DetailDisclosure title="사용 순서·세안법·함께 쓸 때 주의점">
        <p>미지근한 물로 부드럽게 씻고, 과한 세안·스크럽은 줄여요. 피부의 산성도는 설문만으로 측정할 수 없어요. 토너 → 세럼 → 크림 순서는 선택한 제품 안내에 따라 조절해요. 낮에는 잘 맞는 자외선 차단제를 사용해요.</p>
        <p className="mt-2">약과 화장품의 사용 순서는 해당 약 설명서를 우선해요. 각질 관리제·레티놀·벤조일퍼옥사이드를 같은 부위에 새로 여러 개 추가하지 않아요. 따갑거나 벗겨지면 새 제품을 쉬고 편안했던 세안·보습으로 줄여요. 토너·세럼 4단계를 모두 써야 장벽이 회복되는 것은 아니에요.</p>
        <p className="mt-2">현재 제품명을 모두 입력받는 방식은 아니므로 개별 제품 조합의 안전성을 보증하지 않아요. 새 제품은 한 가지씩 추가해 반응을 확인해요.</p>
      </DetailDisclosure>
    </section>}
  </div>;
}

function updateCareAnswer(previous, id, value) {
  if (JSON.stringify(previous[id]) === JSON.stringify(value)) return previous;
  const next = { ...previous, [id]: value };
  const order = ["concern", "shapes", "primaryShape", "locations", "areaState", "breakoutExtent", "medicine", "duration", "response"];
  for (const downstream of order.slice(order.indexOf(id) + 1)) {
    if (downstream !== "locations" || id === "concern") delete next[downstream];
  }
  if (id === "concern" || id === "shapes") delete next.shape;
  return cleanSimpleCareAnswers(next);
}

export function SimpleCareScreen({ profile, surveyAnswers, initialRecord, onSave, onBack, onHome, onRestart, onReviewRoutine, onMoisturizerObservation }) {
  const [legacyExtent, setLegacyExtent] = useState(() => Boolean(initialRecord &&
    initialRecord.symptomAssessment?.ruleVersion !== SIMPLE_CARE_VERSION && !initialRecord.additionalCare?.breakoutExtent));
  const [answers, setAnswers] = useState(() => cleanSimpleCareAnswers(initialRecord?.additionalCare ?? {}, { legacyExtent }));
  const [index, setIndex] = useState(0);
  const [record, setRecord] = useState(initialRecord ?? null);
  const [showResult, setShowResult] = useState(() => Boolean(initialRecord));
  const [saveError, setSaveError] = useState(false);
  const [cosmeticAnswers, setCosmeticAnswers] = useState(() => initialRecord?.cosmeticAddOn?.answers ?? null);
  const questions = getSimpleCareQuestions(answers, { legacyExtent });
  const question = questions[Math.min(index, questions.length - 1)];
  const plan = applyObservationToCarePlan(buildSimpleCarePlan(answers, { legacyExtent }), profile);
  const routine = useMemo(() => profile.observationAssessment?.canRecommendBasics === false || plan.blockNewBasics
    ? { products: {} }
    : initialRecord?.routine && JSON.stringify(initialRecord.surveyAnswers) === JSON.stringify(surveyAnswers)
      ? { products: Object.fromEntries(Object.entries(initialRecord.routine).map(([category, id]) => [category, getProductById(id) ?? null])), selectionEvidence: initialRecord.recommendationAssessment?.selectionEvidence ?? null, isHistorical: initialRecord.recommendationAssessment?.ruleVersion !== RECOMMENDATION_RULE_VERSION }
    : buildDynamicRoutine(profile.hydrationLevel, { mainConcern: "none", skinType: profile.skinType, careNeeds: profile.careNeeds, basicOnly: profile.surveyVersion === ADAPTIVE_SURVEY_VERSION, isSensitive: profile.observationAssessment?.isSensitive ?? true, observationKinds: getObservationKinds(profile) }), [profile, plan.blockNewBasics, initialRecord, surveyAnswers]);
  const observationOffers = getProductObservationOffers(record);
  const cosmeticContext = { profile, surveyAnswers, carePlan: plan, routine };
  const cosmeticPlan = cosmeticAnswers ? buildCosmeticAddOnPlan(cosmeticAnswers, cosmeticContext) : null;
  const applyCosmeticRoute = addon => addon?.suppressPharmacy ? { ...plan, pharmacy: null, title: "막힌 피지·거친 결은 선택한 화장품 후보로 살펴봐요.", detail: "아래 추가 화장품 영역에서 선택한 후보를 확인해요. 약품 후보 표시는 보류했어요.", productNote: "각질 관리 화장품과 여드름약을 같은 부위에 함께 새로 시작하지 않아요." } : plan;
  const displayPlan = applyCosmeticRoute(cosmeticPlan);
  const save = (nextCosmeticAnswers = cosmeticAnswers) => {
    if (!plan.complete) return;
    const nextCosmeticPlan = nextCosmeticAnswers ? buildCosmeticAddOnPlan(nextCosmeticAnswers, cosmeticContext) : null;
    const next = buildSimpleSkinRecord(surveyAnswers, profile, routine, applyCosmeticRoute(nextCosmeticPlan), record, nextCosmeticPlan);
    if (legacyExtent) next.symptomAssessment.ruleVersion = record?.symptomAssessment?.ruleVersion ?? "type-and-extra-care-v3";
    setCosmeticAnswers(nextCosmeticAnswers);
    setRecord(next); setShowResult(true);
    try { onSave(next); setSaveError(false); } catch { setSaveError(true); }
  };
  if (showResult && plan.complete) return <div className="space-y-6">
    {routine.isHistorical && <p className="rounded-xl bg-slate-50 p-4 text-sm">저장 당시의 제품 후보를 보여드려요. 새 검수 기준으로 다시 추천받으려면 아래에서 다시 확인해요.</p>}
    <SimpleCareResult profile={profile} routine={routine} plan={displayPlan} onReviewRoutine={saveError ? undefined : onReviewRoutine} />
    {!saveError && !displayPlan.blockNewBasics && onMoisturizerObservation && observationOffers.length > 0 &&
      <section aria-label="화장품 사용과 피부 변화 기록 시작" className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="font-bold">지금 쓰는 제품과 피부 변화를 기록해요</h2>
        <p className="text-sm text-slate-700">기존 제품을 유지해도 돼요. 바꾼다면 한 번에 한 가지씩 바꾸고, 2주 후 같은 질문에 답해요.</p>
        <div className="flex flex-wrap gap-2">{observationOffers.map(({ kind, config }) =>
          <button key={kind} type="button" onClick={() => onMoisturizerObservation(record, kind)} className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white">{config.label} 사용 기록 시작</button>
        )}</div>
      </section>}
    {(profile.surveyVersion !== ADAPTIVE_SURVEY_VERSION || routine.isHistorical) && onRestart && <button onClick={onRestart} className="rounded-xl border px-4 py-3">새 기준으로 다시 확인</button>}
    {!plan.blockNewBasics && profile.observationAssessment?.canRecommendBasics !== false && <CosmeticAddOnSection context={cosmeticContext} initialAnswers={cosmeticAnswers} onApply={save} />}
    {saveError && <div role="alert" className="rounded-xl bg-amber-50 p-4">결과는 표시했지만 저장하지 못했어요. <button className="underline" onClick={() => save()}>저장 다시 시도</button></div>}
    <div className="flex flex-wrap gap-3"><button className="rounded-xl border px-4 py-3" onClick={() => { setShowResult(false); setLegacyExtent(false); setIndex(0); }}>추가 고민 답변 바꾸기</button><button className="rounded-xl border px-4 py-3" onClick={onBack}>피부타입 답변 다시 보기</button><button className="rounded-xl bg-slate-900 text-white px-4 py-3" onClick={onHome}>시작 화면</button></div>
  </div>;
  const changeAnswer = (id, value) => {
    const next = updateCareAnswer(answers, id, value);
    if (next !== answers) {
      setAnswers(next);
      setCosmeticAnswers(null);
    }
  };
  return <SimpleCareQuestion question={question} index={index} total={questions.length} answer={answers[question.id]} locations={answers.locations}
    onAnswer={value => changeAnswer(question.id, value)}
    onLocation={(shape, value) => changeAnswer("locations", { ...answers.locations, [shape]: value })}
    onPrev={() => index === 0 ? onBack() : setIndex(index - 1)}
    onNext={() => index === questions.length - 1 ? save() : setIndex(index + 1)} />;
}

export function SimpleCareQuestion({ question, index, total, answer, locations, onAnswer, onLocation, onPrev, onNext }) {
  const selected = question.multiple ? answer ?? [] : [];
  const isSelected = value => question.multiple ? selected.includes(value) : answer === value;
  const select = value => onAnswer(!question.multiple ? value : selected.includes(value)
    ? selected.filter(item => item !== value) : value === "unknown" ? ["unknown"] : [...selected.filter(item => item !== "unknown"), value]);
  return <div className="max-w-2xl mx-auto space-y-6">
    <p className="text-sm font-semibold text-emerald-700">피부 성향 답변 완료 · 추가 고민 {index + 1}/{total}</p>
    <h1 className="text-2xl font-bold">{question.q}</h1>
    {question.hint && <p className="text-sm text-slate-600">{question.hint}</p>}
    {question.visual && <AcnePhotoReference />}
    {question.multiple && <p className="text-sm text-slate-600">좁쌀, 붉은 돌기, 이전 트러블의 자국이 함께 있다면 모두 골라요.</p>}
    {question.id === "concern" && <p className="text-sm text-slate-600">기본 관리와 별도로 필요한 관리를 확인해요. 아직 모르는 항목이 있어도 확인된 특징으로 가능한 관리부터 안내해요.</p>}
    <div className="space-y-3" role="group" aria-label={question.q}>{question.options.map(option => <button key={option.value} aria-pressed={isSelected(option.value)} className={`w-full text-left rounded-2xl border p-4 ${isSelected(option.value) ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white"}`} onClick={() => select(option.value)}>
      <span className="block font-semibold">{option.label}</span>{option.detail && <span className="mt-1 block text-sm text-slate-600">{option.detail}</span>}
    </button>)}</div>
    {question.locations && <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold">고민별 부위 기록 (선택)</legend>
      {question.options.map(option => <label key={option.value} className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>{option.label} 부위</span>
        <select className="rounded-lg border border-slate-300 bg-white p-2" value={locations?.[option.value] ?? ""} onChange={event => onLocation(option.value, event.target.value)}>
          <option value="">선택 안 함</option>
          {acneAreas.map(area => <option key={area.value} value={area.value}>{area.label}</option>)}
        </select>
      </label>)}
    </fieldset>}
    <div className="flex justify-between gap-3"><button className="rounded-xl border px-5 py-3" onClick={onPrev}>이전</button>
      <button disabled={question.multiple ? !selected.length : !answer} className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-40" onClick={onNext}>{index === total - 1 ? "기본 루틴과 추가 관리 보기" : "다음"}</button></div>
  </div>;
}
