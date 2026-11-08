import { CosmeticAddOnSection } from "../components/CosmeticAddOnSection";
import { buildCosmeticAddOnPlan } from "../utils/cosmeticAddOnPlan";
import { useMemo, useState } from "react";
import { getSimpleCareQuestions, cleanSimpleCareAnswers } from "../data/simpleCare";
import { buildSimpleCarePlan } from "../utils/simpleCarePlan";
import { buildSimpleSkinRecord } from "../utils/simpleSkinRecord";
import { buildDynamicRoutine } from "../utils/routineRecommendation";
import { AcnePhotoReference } from "../components/AcnePhotoReference";
import { FolliculitisOptions } from "../components/FolliculitisOptions";
import { ConcernProductOptions } from "../components/ConcernProductOptions";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { DetailDisclosure } from "../components/DetailDisclosure";

export function ObservationSummary({ profile }) {
  const assessment = profile.observationAssessment;
  if (!assessment) return <p className="text-sm text-slate-600">예전 설문 기준으로 저장된 결과예요. 당시 답변과 점수를 유지했어요.</p>;
  return <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 space-y-3" aria-label="관찰한 특징과 추천 근거">
    <h2 className="text-lg font-bold">답변에서 확인한 특징</h2>
    {assessment.evidence.length > 0 ? <ul className="list-disc pl-5 space-y-1">{assessment.evidence.map(item => <li key={item}>{item}</li>)}</ul> : <p>아직 피부 성향을 정할 관찰 답변이 부족해요.</p>}
    <p className="font-medium">{assessment.recommendationReason}</p>
    {assessment.uncertainties.length > 0 && <DetailDisclosure title="아직 확인하지 못한 점">{assessment.uncertainties.map(item => <p key={item} className="mt-2">{item}</p>)}</DetailDisclosure>}
    <p className="text-xs text-slate-600">자가 응답을 이용한 관리 방향이에요. 피부 수분·유분·pH나 장벽 기능을 측정한 검사가 아니며, 정확도가 검증된 진단 도구는 아니에요.</p>
  </section>;
}

export function applyObservationToCarePlan(plan, profile) {
  const assessment = profile.observationAssessment;
  if (!assessment || plan.blockNewBasics) return plan;
  if (assessment.currentIrritation) return { ...plan, blockNewBasics: true, pharmacy: null, showFolliculitis: false, title: "현재 자극부터 가라앉히는 방향으로 줄여요.", detail: assessment.recommendationReason };
  if (!assessment.canRecommendBasics && plan.answers.concern === "none") return { ...plan, title: "기본 제품을 고르기 전에 피부타입 답변을 보완해요.", detail: "아래 확인하지 못한 점을 보고 평소 경험으로 답해요. 잘 맞는 기존 세안·보습은 유지해요." };
  return plan;
}

export function SimpleCareResult({ profile, routine, plan }) {
  return <div className="space-y-6">
    <header className="space-y-2"><p className="text-sm font-semibold text-emerald-700">내 피부 관리 결과</p><h1 className="text-2xl sm:text-3xl font-bold">{profile.skinType} · 기본 루틴과 필요한 추가 관리</h1><p className="text-sm text-slate-600">설문으로 추정한 피부타입이에요. 질환·원인균을 확정한 결과는 아니에요.</p></header>
    <ObservationSummary profile={profile} />
    <section className="space-y-3 rounded-2xl bg-white border border-slate-200 p-5" aria-label="추가 고민 관리">
      <h2 className="text-lg font-bold">{plan.title}</h2><p>{plan.detail}</p>
      <ConcernProductOptions plan={plan} />
      {plan.showFolliculitis && <FolliculitisOptions />}
      {plan.answers.shape === "deep" && plan.answers.medicine !== "none" && <p className="text-sm">깊은 덩이는 짜지 않아요. 계속 커지거나 통증·흉터가 생기면 확인이 필요해요.</p>}
    </section>
    {!plan.blockNewBasics && profile.observationAssessment?.canRecommendBasics !== false && <section className="space-y-4" aria-label="피부타입별 기본 화장품">
      <h2 className="text-xl font-bold">피부타입에 맞는 기본 화장품</h2>
      <p className="text-sm">아무 관리도 하지 않았다면 아래 4가지 카테고리를 비교해요. 세안제·보습제를 먼저 고르고, 토너·세럼은 필요할 때 추가해요. 이미 잘 맞는 제품이 있다면 그대로 유지해요.</p>
      <RoutineProductScroller productsByCategory={routine.products} userContext={{ skinType: profile.skinType, mainConcern: "none" }} />
      <DetailDisclosure title="사용 순서·세안법·함께 쓸 때 주의점">
        <p>미지근한 물로 부드럽게 씻고, 과한 세안·스크럽은 줄여요. 피부의 산성도는 설문만으로 측정할 수 없어요. 토너 → 세럼 → 크림 순서는 선택한 제품 안내에 따라 조절해요. 낮에는 잘 맞는 자외선 차단제를 사용해요.</p>
        <p className="mt-2">약과 화장품의 사용 순서는 해당 약 설명서를 우선해요. 각질 관리제·레티놀·벤조일퍼옥사이드를 같은 부위에 새로 여러 개 추가하지 않아요. 따갑거나 벗겨지면 새 제품을 쉬고 편안했던 세안·보습으로 줄여요. 토너·세럼 4단계를 모두 써야 장벽이 회복되는 것은 아니에요.</p>
        <p className="mt-2">현재 제품명을 모두 입력받는 방식은 아니므로 개별 제품 조합의 안전성을 보증하지 않아요. 새 제품은 한 가지씩 추가해 반응을 확인해요.</p>
      </DetailDisclosure>
    </section>}
  </div>;
}

export function SimpleCareScreen({ profile, surveyAnswers, initialRecord, onSave, onBack, onHome, onRestart }) {
  const [answers, setAnswers] = useState(() => initialRecord?.additionalCare ?? {});
  const [index, setIndex] = useState(0);
  const [record, setRecord] = useState(initialRecord ?? null);
  const [showResult, setShowResult] = useState(() => Boolean(initialRecord));
  const [saveError, setSaveError] = useState(false);
  const [cosmeticAnswers, setCosmeticAnswers] = useState(() => initialRecord?.cosmeticAddOn?.answers ?? null);
  const questions = getSimpleCareQuestions(answers);
  const question = questions[Math.min(index, questions.length - 1)];
  const plan = applyObservationToCarePlan(buildSimpleCarePlan(answers), profile);
  const routine = useMemo(() => profile.observationAssessment?.canRecommendBasics === false || plan.blockNewBasics
    ? { products: {} }
    : buildDynamicRoutine(profile.hydrationLevel, { mainConcern: "none", skinType: profile.skinType, careNeeds: profile.careNeeds, isSensitive: profile.observationAssessment?.isSensitive ?? true }), [profile, plan.blockNewBasics]);
  const cosmeticContext = { profile, surveyAnswers, carePlan: plan, routine };
  const cosmeticPlan = cosmeticAnswers ? buildCosmeticAddOnPlan(cosmeticAnswers, cosmeticContext) : null;
  const applyCosmeticRoute = addon => addon?.suppressPharmacy ? { ...plan, pharmacy: null, title: "막힌 피지·거친 결은 선택한 화장품 후보로 살펴봐요.", detail: "아래 추가 화장품 영역에서 선택한 후보를 확인해요. 약품 후보 표시는 보류했어요.", productNote: "각질 관리 화장품과 여드름약을 같은 부위에 함께 새로 시작하지 않아요." } : plan;
  const displayPlan = applyCosmeticRoute(cosmeticPlan);
  const save = (nextCosmeticAnswers = cosmeticAnswers) => {
    if (!plan.complete) return;
    const nextCosmeticPlan = nextCosmeticAnswers ? buildCosmeticAddOnPlan(nextCosmeticAnswers, cosmeticContext) : null;
    const next = buildSimpleSkinRecord(surveyAnswers, profile, routine, applyCosmeticRoute(nextCosmeticPlan), record, nextCosmeticPlan);
    setCosmeticAnswers(nextCosmeticAnswers);
    setRecord(next); setShowResult(true);
    try { onSave(next); setSaveError(false); } catch { setSaveError(true); }
  };
  if (showResult && plan.complete) return <div className="space-y-6">
    <SimpleCareResult profile={profile} routine={routine} plan={displayPlan} />
    {!profile.observationAssessment && onRestart && <button onClick={onRestart} className="rounded-xl border px-4 py-3">새 기준으로 다시 확인</button>}
    {!plan.blockNewBasics && profile.observationAssessment?.canRecommendBasics !== false && <CosmeticAddOnSection context={cosmeticContext} initialAnswers={cosmeticAnswers} onApply={save} />}
    {saveError && <div role="alert" className="rounded-xl bg-amber-50 p-4">결과는 표시했지만 저장하지 못했어요. <button className="underline" onClick={() => save()}>저장 다시 시도</button></div>}
    <div className="flex flex-wrap gap-3"><button className="rounded-xl border px-4 py-3" onClick={() => { setShowResult(false); setIndex(0); }}>추가 고민 답변 바꾸기</button><button className="rounded-xl border px-4 py-3" onClick={onBack}>피부타입 답변 다시 보기</button><button className="rounded-xl bg-slate-900 text-white px-4 py-3" onClick={onHome}>시작 화면</button></div>
  </div>;
  return <SimpleCareQuestion question={question} index={index} total={questions.length} answer={answers[question.id]}
    onAnswer={value => setAnswers(previous => cleanSimpleCareAnswers({ ...previous, [question.id]: value }))}
    onPrev={() => index === 0 ? onBack() : setIndex(index - 1)}
    onNext={() => index === questions.length - 1 ? save() : setIndex(index + 1)} />;
}

export function SimpleCareQuestion({ question, index, total, answer, onAnswer, onPrev, onNext }) {
  return <div className="max-w-2xl mx-auto space-y-6">
    <p className="text-sm font-semibold text-emerald-700">피부 성향 답변 완료 · 추가 고민 {index + 1}/{total}</p>
    <h1 className="text-2xl font-bold">{question.q}</h1>
    {question.visual && <AcnePhotoReference />}
    {question.id === "concern" && <p className="text-sm text-slate-600">기본 루틴과 별도로 필요한 관리를 확인해요. 피부 성향 답변이 부족하면 기본 제품 추천은 보류해요.</p>}
    <div className="space-y-3" role="group" aria-label={question.q}>{question.options.map(option => <button key={option.value} aria-pressed={answer === option.value} className={`w-full text-left rounded-2xl border p-4 ${answer === option.value ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white"}`} onClick={() => onAnswer(option.value)}>
      <span className="block font-semibold">{option.label}</span>{option.detail && <span className="mt-1 block text-sm text-slate-600">{option.detail}</span>}
    </button>)}</div>
    <div className="flex justify-between gap-3"><button className="rounded-xl border px-5 py-3" onClick={onPrev}>이전</button>
      <button disabled={!answer} className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-40" onClick={onNext}>{index === total - 1 ? "기본 루틴과 추가 관리 보기" : "다음"}</button></div>
  </div>;
}
