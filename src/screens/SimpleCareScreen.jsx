import ProductChangeReview from "../components/ProductChangeReview";
import { readPricePreference } from "../data/pricePreference";
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
import { buildDynamicRoutine, getSeasonalMoisturizerPair } from "../utils/routineRecommendation";
import { AcnePhotoReference } from "../components/AcnePhotoReference";
import { FolliculitisOptions } from "../components/FolliculitisOptions";
import { ConcernProductOptions } from "../components/ConcernProductOptions";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { getBasicObservationTracks, getObservationKinds } from "../utils/moisturizerObservation";
import { buildRoutineSurveyContext, getEntriesForSurveyScope, getCurrentRoutineContext, getCurrentRoutineProduct, getSerumRoutineSummary } from "../utils/currentRoutineReview";
import { DetailDisclosure } from "../components/DetailDisclosure";
import { RoutineProductLookup } from "../components/RoutineProductLookup";
import { buildRoutineAdvice, getRoutineComparison, getRoutinePreferences, routineSlotNames } from "../utils/routineAdvice";
import { getRoutineFitSignals } from "../utils/routineFitContext";
import { ProcedureOptions } from "../components/ProcedureOptions";
import { readRoutineSurveyContext } from "../data/routineSurveyContext";
import { PrimaryButton } from "../components/PrimaryButton";
import { SurveyChoice } from "../components/SurveyChoice";
import { useScreenHeading } from "../hooks/useScreenHeading";
import { MakeupCleansingSection } from "../components/MakeupCleansingSection";
import { getMakeupCleansingPlan } from "../utils/makeupCleansingPlan";

const emptyRoutine = [];

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

export function SimpleCareResult({ profile, routine, plan, onReviewRoutine, serumStatus, otherRetained = [], advice, recommendationContext, ownedIds, notes, routineHasIrritation, makeupCleansing }) {
  const heading = useScreenHeading("care-result");
  const concernFirst = plan.blockNewBasics || (plan.answers.concern !== "none" && !routineHasIrritation);
  const priority = concernFirst ? plan : advice;
  const fitNote = !concernFirst && advice?.slot && getRoutineFitSignals(advice.slot, recommendationContext)?.note;
  const firstCareAction = !concernFirst && !routineHasIrritation && profile.observationAssessment?.canRecommendBasics === false
    ? profile.observationAssessment.careActions?.[0] : null;
  const seasonalPair = getSeasonalMoisturizerPair(profile.hydrationLevel, recommendationContext, routine);
  return <div className="space-y-5 sm:space-y-6">
    <section className="rounded-[1.75rem] bg-forest-900 p-5 text-white sm:p-8" aria-labelledby="simple-result-title">
      <p className="text-xs font-semibold tracking-wide text-forest-100">내 피부 관리 결과</p>
      <h1 id="simple-result-title" ref={heading} tabIndex={-1} className="mt-2 scroll-mt-28 text-2xl font-bold tracking-tight focus:outline-none sm:text-3xl">{profile.skinType}</h1>
      <p className="mt-1 text-xs text-forest-100">답변을 바탕으로 한 관리 안내예요. 질환이나 원인균을 확정한 결과는 아니에요.</p>
      {priority && <section className="mt-5 space-y-2 rounded-xl bg-paper p-4 text-ink sm:mt-6 sm:p-5" aria-label="지금 먼저 할 한 가지">
        <p className="care-kicker">오늘 할 한 가지</p>
        <h2 className="text-lg font-bold text-forest-900 sm:text-xl">{priority.title}</h2>
        <p className="text-sm leading-relaxed">{priority.detail}</p>
        {firstCareAction && <p className="text-sm text-slate-600">{firstCareAction}</p>}
        {fitNote && <p className="text-sm text-slate-600">{fitNote}</p>}
      </section>}
    </section>
    {serumStatus?.skipBasicSerum && !plan.blockNewBasics && <section aria-label="지금 쓰는 세럼" className="care-panel space-y-1 text-sm">
      <p className="care-kicker">{serumStatus.hasIrritation ? "사용감 먼저 확인" : "그대로 쓸 제품"}</p>
      <h2 className="font-bold">{serumStatus.hasIrritation ? "세럼은 자극 여부부터 확인해요." : "편하게 쓰는 세럼은 그대로 유지해요."}</h2>
      {serumStatus.hasIrritation ? <p>새 세럼을 더하기보다, 어떤 제품을 쓸 때 불편했는지 먼저 확인해요.</p> : <>
        {serumStatus.keep.length > 0 && <p>{serumStatus.keep.map(entry => getCurrentRoutineProduct(entry)?.name).join(" · ")}</p>}
        <p>지금 조합이 편하다면 기본 세럼을 하나 더 살 필요는 없어요.</p>
      </>}
    </section>}
    {otherRetained.length > 0 && !plan.blockNewBasics && <section aria-label="그대로 쓸 화장품" className="care-panel space-y-1 text-sm">
      <p className="care-kicker">그대로 쓸 제품</p>
      <h2 className="font-bold">편하게 쓰는 기초 제품도 유지해요.</h2>
      <ul className="mt-2 grid gap-1">
        {otherRetained.map(([slot, products]) => <li key={slot}><span className="font-semibold text-forest-700">{routineSlotNames[slot]}</span> · {products.join(" · ")}</li>)}
      </ul>
    </section>}
    {notes}
    {(!concernFirst || plan.concernSummary || plan.pharmacy || plan.cosmetics?.length || plan.productNote || plan.recheck || plan.showFolliculitis || (plan.answers.shape === "deep" && plan.answers.medicine !== "none")) && <section className="care-panel space-y-3" aria-label="추가 고민 관리">
      <p className="care-kicker">{concernFirst ? "이 고민에 맞는 관리" : "관리 방향"}</p>
      {plan.concernSummary && <p className="text-sm font-semibold text-emerald-800">먼저 고른 고민: {plan.concernSummary.primary.label}{plan.concernSummary.primary.area && ` · ${plan.concernSummary.primary.area}`}</p>}
      {!concernFirst && <><h2 className="text-lg font-bold">{plan.title}</h2><p>{plan.detail}</p></>}
      <ConcernProductOptions plan={plan} />
      {plan.showFolliculitis && <FolliculitisOptions />}
      {plan.answers.shape === "deep" && plan.answers.medicine !== "none" && <p className="text-sm">깊은 덩이는 짜지 않아요. 계속 커지거나 통증·흉터가 생기면 확인이 필요해요.</p>}
    </section>}
    {plan.concernSummary && <section className="care-panel space-y-3" aria-label="함께 선택한 고민">
      <h2 className="text-lg font-bold">함께 선택한 고민</h2>
      <ul className="space-y-3">{plan.concernSummary.secondary.map(item => <li key={item.shape}>
        <p className="font-semibold">{item.label}{item.area && ` · ${item.area}`}</p>
        <p className="text-sm text-slate-700">{item.observation}</p>
      </li>)}</ul>
      <p className="text-sm text-slate-600">지금은 위의 관리부터 살펴보고, 다른 고민에 새 제품을 한꺼번에 추가하지 않아요.</p>
    </section>}
    <AcneCareReview review={buildAcneCareReview(plan)} />
    <MakeupCleansingSection plan={makeupCleansing} />
    {!plan.blockNewBasics && profile.observationAssessment?.canRecommendBasics !== false && Object.values(routine.products).some(Boolean) && <section className="space-y-4" aria-label="피부타입별 기본 화장품">
      <div>
        <p className="care-kicker">필요한 단계만</p>
        <h2 className="mt-1 text-xl font-bold text-forest-900 sm:text-2xl">피부타입에 맞는 기본 화장품</h2>
        <p className="mt-1 text-sm text-slate-700">기초 관리를 시작한다면 세안제와 보습제부터 골라요. 토너·세럼은 필요할 때만 하나씩 추가해요.</p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-forest-100 rounded-xl border border-forest-100 bg-forest-50 text-sm">
        <div className="p-3 sm:p-4"><p className="font-bold text-forest-900">아침</p><p className="mt-0.5 text-slate-700">기초 관리 후 선크림</p></div>
        <div className="p-3 sm:p-4"><p className="font-bold text-forest-900">저녁</p><p className="mt-0.5 text-slate-700">세안 후 필요한 기초 관리</p></div>
      </div>
      <RoutineProductScroller layout="routine" productsByCategory={routine.products} optionalSlots={["toner", "serum"]} userContext={{ ...recommendationContext, level: profile.hydrationLevel, acneSupport: plan.answers.concern === "acne" }} />
      {seasonalPair && <section className="care-panel space-y-3" aria-label="계절과 사용감에 따른 보습제 비교">
        <h3 className="font-bold">같은 피부 성향, 다른 날의 보습제</h3>
        <p className="text-sm text-slate-700">더울 때와 건조할 때 중 지금에 맞는 한 가지를 골라요. 두 제품을 함께 쓸 필요는 없어요.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[["더울 때 · 가벼운 사용감", seasonalPair.light], ["건조할 때 · 더 있는 보습감", seasonalPair.rich]].map(([label, product]) =>
            <div key={product.id} className="space-y-2"><p className="care-kicker">{label}</p>
              <RoutineProductScroller layout="routine" productsByCategory={{ cream: product }} userContext={{ ...recommendationContext, level: profile.hydrationLevel }} />
            </div>)}
        </div>
      </section>}
      {!routine.isHistorical && Object.keys(routine.products).map(slot => {
        const comparison = getRoutineComparison(routine, slot, ownedIds);
        return comparison && <DetailDisclosure key={slot} title={`${routineSlotNames[slot]} 대안 비교`}>
          <p className="font-semibold">{comparison.alternative.name}</p><p>{comparison.reason}</p>
          {comparison.closeFit && <p className="mt-1 text-slate-600">두 후보 모두 비슷한 조건에 맞아요. 평소 선호하는 사용감으로 골라도 돼요.</p>}
          <div className="mt-3 max-w-xs"><RoutineProductScroller layout="routine" productsByCategory={{ [slot]: comparison.alternative }} userContext={{ ...recommendationContext, level: profile.hydrationLevel }} /></div>
        </DetailDisclosure>;
      })}
      <DetailDisclosure title="사용 순서·세안법·함께 쓸 때 주의점">
        <p>미지근한 물로 부드럽게 씻고, 과한 세안·스크럽은 줄여요. 피부의 산성도는 설문만으로 측정할 수 없어요. 토너 → 세럼 → 크림 순서는 선택한 제품 안내에 따라 조절해요. 낮에는 잘 맞는 자외선 차단제를 사용해요.</p>
        <p className="mt-2">약과 화장품의 사용 순서는 해당 약 설명서를 우선해요. 각질 관리제·레티놀·벤조일퍼옥사이드를 같은 부위에 새로 여러 개 추가하지 않아요. 따갑거나 벗겨지면 새 제품을 쉬고 편안했던 세안·보습으로 줄여요. 토너·세럼 4단계를 모두 써야 장벽이 회복되는 것은 아니에요.</p>
        <p className="mt-2">현재 제품명을 모두 입력받는 방식은 아니므로 개별 제품 조합의 안전성을 보증하지 않아요. 새 제품은 한 가지씩 추가해 반응을 확인해요.</p>
      </DetailDisclosure>
    </section>}
    <DetailDisclosure title="피부 상태와 추천 근거"><ObservationSummary profile={profile} /></DetailDisclosure>
    {onReviewRoutine && <button type="button" onClick={onReviewRoutine} className="care-secondary">지금 쓰는 제품 점검하기</button>}
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

export function SimpleCareScreen({ profile, surveyAnswers, initialRecord, onSave, onBack, onHome, onRestart, onReviewRoutine, currentRoutineEntries, routineReview, priorSerumPreference, personalProductFeedback }) {
  const [legacyExtent, setLegacyExtent] = useState(() => Boolean(initialRecord &&
    initialRecord.symptomAssessment?.ruleVersion !== SIMPLE_CARE_VERSION && !initialRecord.additionalCare?.breakoutExtent));
  const [answers, setAnswers] = useState(() => cleanSimpleCareAnswers(initialRecord?.additionalCare ?? {}, { legacyExtent }));
  const [index, setIndex] = useState(0);
  const [record, setRecord] = useState(initialRecord ?? null);
  const [showResult, setShowResult] = useState(() => Boolean(initialRecord));
  const [saveError, setSaveError] = useState(false);
  const intake = readRoutineSurveyContext(surveyAnswers?.routineIntake);
  const [legacySerumPreference, setSerumPreference] = useState(() => initialRecord?.routinePreferences?.serum ?? priorSerumPreference ?? "");
  const serumPreference = intake ? intake.serumPreference ?? "" : legacySerumPreference;
  const activeRoutineEntries = useMemo(() => intake && intake.use !== "yes" ? emptyRoutine :
    getEntriesForSurveyScope(currentRoutineEntries, intake?.routineScope), [currentRoutineEntries, intake?.use, intake?.routineScope]);
  const currentRoutine = useMemo(() => getCurrentRoutineContext(activeRoutineEntries), [activeRoutineEntries]);
  const serumStatus = getSerumRoutineSummary(activeRoutineEntries, serumPreference === "keep");
  const skipBasicSerum = (serumPreference !== "compare" && serumStatus.skipBasicSerum) || serumStatus.hasIrritation;
  const [cosmeticAnswers, setCosmeticAnswers] = useState(() => initialRecord?.cosmeticAddOn?.answers ?? null);
  const questions = getSimpleCareQuestions(answers, { legacyExtent });
  const question = questions[Math.min(index, questions.length - 1)];
  const plan = applyObservationToCarePlan(buildSimpleCarePlan(answers, { legacyExtent }), profile);
  const assessment = profile.observationAssessment;
  const observedSkin = assessment?.resolvedObservations;
  const preferences = getRoutinePreferences(currentRoutine, observedSkin, serumPreference);
  const allowNewBasics = assessment?.canRecommendBasics !== false && !plan.blockNewBasics && !currentRoutine.irritated.length;
  const makeupCleansing = getMakeupCleansingPlan(surveyAnswers, {
    blocked: !allowNewBasics,
    sensitive: assessment?.isSensitive ?? true,
    cleanserDiscomfort: Boolean(currentRoutine.slotReactions.cleanser) || ["tight", "stings"].includes(observedSkin?.washResponse),
  });
  if (makeupCleansing?.skipNewCleanser) preferences.suppressedSlots.add("cleanser");
  const recommendationContext = { ...currentRoutine, suppressedSlots: preferences.suppressedSlots, mainConcern: "none",
    pricePreference: readPricePreference(surveyAnswers),
    skinType: profile.skinType, careNeeds: profile.careNeeds, basicOnly: profile.surveyVersion === ADAPTIVE_SURVEY_VERSION,
    isSensitive: assessment?.isSensitive ?? true, observationKinds: getObservationKinds(profile),
    observationTracks: getBasicObservationTracks(profile), observedSkin, personalProductFeedback };
  const historical = initialRecord?.routine && initialRecord.recommendationAssessment?.ruleVersion !== RECOMMENDATION_RULE_VERSION &&
    JSON.stringify(cleanSimpleCareAnswers(initialRecord.additionalCare ?? {}, { legacyExtent })) === JSON.stringify(answers) &&
    (initialRecord.routinePreferences?.serum ?? priorSerumPreference ?? "") === serumPreference &&
    Object.values(initialRecord.routine).some(Boolean) && !currentRoutine.ownedProductIds.size && !Object.keys(currentRoutine.rowsBySlot).length;
  const displayRoutine = !allowNewBasics ? { products: {} }
    : historical ? { products: Object.fromEntries(Object.entries(initialRecord.routine).map(([category, id]) => [category, getProductById(id) ?? null])),
      selectionEvidence: initialRecord.recommendationAssessment?.selectionEvidence ?? null, isHistorical: true }
    : buildDynamicRoutine(profile.hydrationLevel, recommendationContext);
  const otherRetained = Object.entries(preferences.retained).filter(([slot]) => slot !== "serum");
  const advice = buildRoutineAdvice({ currentRoutine, routine: displayRoutine, assessment, plan, retained: preferences.retained });
  const visibleSerumStatus = { ...serumStatus, skipBasicSerum };
  const cosmeticContext = { profile, surveyAnswers, carePlan: plan, routine: displayRoutine, personalProductFeedback, currentRoutine };
  const cosmeticPlan = cosmeticAnswers ? buildCosmeticAddOnPlan(cosmeticAnswers, cosmeticContext) : null;
  const applyCosmeticRoute = addon => addon?.suppressPharmacy ? { ...plan, pharmacy: null, title: "막힌 피지·거친 결은 선택한 화장품 후보로 살펴봐요.", detail: "아래 추가 화장품 영역에서 선택한 후보를 확인해요. 약품 후보 표시는 보류했어요.", productNote: "각질 관리 화장품과 여드름약을 같은 부위에 함께 새로 시작하지 않아요." } : plan;
  const displayPlan = applyCosmeticRoute(cosmeticPlan);
  const liveIntake = showResult && intake?.use === "yes" ? buildRoutineSurveyContext("yes", activeRoutineEntries) : null;
  const newReview = ["cleanser", "toner", "serum", "cream"].some(slot => intake?.[slot]?.band === "unknown" &&
    ((liveIntake?.[slot]?.band && liveIntake[slot].band !== "unknown") ||
      (!intake[slot].listedHumectants && liveIntake?.[slot]?.listedHumectants)));
  const save = (nextCosmeticAnswers = cosmeticAnswers) => {
    if (!plan.complete) return;
    const nextCosmeticPlan = nextCosmeticAnswers ? buildCosmeticAddOnPlan(nextCosmeticAnswers, cosmeticContext) : null;
    const next = buildSimpleSkinRecord(surveyAnswers, profile, displayRoutine, applyCosmeticRoute(nextCosmeticPlan), record, nextCosmeticPlan);
    if (serumPreference) next.routinePreferences = { serum: serumPreference };
    if (legacyExtent) next.symptomAssessment.ruleVersion = record?.symptomAssessment?.ruleVersion ?? "type-and-extra-care-v3";
    setCosmeticAnswers(nextCosmeticAnswers);
    setRecord(next); setShowResult(true);
    try { onSave(next); setSaveError(false); } catch { setSaveError(true); }
  };
  if (showResult && plan.complete) {
    const notes = <>
    <ProductChangeReview answers={surveyAnswers} entries={currentRoutineEntries} />
    {recommendationContext.pricePreference === "important" && Object.values(displayRoutine.products).some(Boolean) && !historical && <p className="rounded-xl bg-slate-50 p-4 text-sm">가격을 중요하게 선택했어요. 피부에 비슷하게 맞는 제품 중 확인된 공식 기준가가 있는 제품을 우선해요. 실제 할인 가격과 배송비는 판매처에서 확인할 수 있어요.</p>}
    {displayRoutine.isHistorical && <p className="rounded-xl bg-slate-50 p-4 text-sm">저장 당시의 제품 후보를 보여드려요. 새 검수 기준으로 다시 추천받으려면 아래에서 다시 확인해요.</p>}
    {newReview && onRestart && <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
      <p>전에는 보습 특성을 알 수 없었던 단계에 검수된 제품 정보가 있어요. 지금도 쓰는 제품이라면 새 설문에서 반영할 수 있어요.</p>
      <button type="button" className="font-semibold text-emerald-900 underline" onClick={onRestart}>검수된 제품 정보로 다시 확인</button>
    </div>}
    </>;
    return <div className="space-y-6">
      <SimpleCareResult profile={profile} routine={displayRoutine} otherRetained={otherRetained} advice={advice} recommendationContext={recommendationContext} ownedIds={currentRoutine.ownedProductIds} plan={displayPlan} serumStatus={visibleSerumStatus} onReviewRoutine={saveError ? undefined : onReviewRoutine} notes={notes} routineHasIrritation={currentRoutine.irritated.length > 0} makeupCleansing={makeupCleansing} />
    {(profile.surveyVersion !== ADAPTIVE_SURVEY_VERSION || displayRoutine.isHistorical) && onRestart && <button onClick={onRestart} className="rounded-xl border px-4 py-3">새 기준으로 다시 확인</button>}
    {allowNewBasics && <CosmeticAddOnSection context={cosmeticContext} initialAnswers={cosmeticAnswers} onApply={save} />}
    <ProcedureOptions plan={displayPlan} profile={profile} />
    {saveError && <div role="alert" className="rounded-xl bg-amber-50 p-4">결과는 표시했지만 저장하지 못했어요. <button className="underline" onClick={() => save()}>저장 다시 시도</button></div>}
    <div className="flex flex-wrap gap-3"><button type="button" className="care-secondary" onClick={() => { setShowResult(false); setLegacyExtent(false); setIndex(0); }}>추가 고민 답변 바꾸기</button><button type="button" className="care-secondary" onClick={onBack}>피부타입 답변 다시 보기</button><PrimaryButton onClick={onHome}>시작 화면</PrimaryButton></div>
    </div>;
  }
  const changeAnswer = (id, value) => {
    const next = updateCareAnswer(answers, id, value);
    if (next !== answers) {
      setAnswers(next);
      setCosmeticAnswers(null);
    }
  };
  return <SimpleCareQuestion routineReview={routineReview} serumPreference={serumPreference} onSerumPreference={intake ? undefined : setSerumPreference} question={question} index={index} total={questions.length} answer={answers[question.id]} locations={answers.locations}
    onAnswer={value => changeAnswer(question.id, value)}
    onLocation={(shape, value) => changeAnswer("locations", { ...answers.locations, [shape]: value })}
    onPrev={() => index === 0 ? onBack() : setIndex(index - 1)}
    onNext={() => index === questions.length - 1 ? save() : setIndex(index + 1)} />;
}

export function SimpleCareQuestion({ question, index, total, answer, locations, onAnswer, onLocation, onPrev, onNext, serumPreference, onSerumPreference, routineReview }) {
  const heading = useScreenHeading(question.id);
  const selected = question.multiple ? answer ?? [] : [];
  const isSelected = value => question.multiple ? selected.includes(value) : answer === value;
  const select = value => onAnswer(!question.multiple ? value : selected.includes(value)
    ? selected.filter(item => item !== value) : value === "unknown" ? ["unknown"] : [...selected.filter(item => item !== "unknown"), value]);
  return <div className="mx-auto max-w-2xl space-y-5">
    <section className="care-panel space-y-3" aria-labelledby="care-question">
      <p className="care-kicker">피부 설문 · 추가 고민 {index + 1}/{total}</p>
      <h1 id="care-question" ref={heading} tabIndex={-1} className="scroll-mt-28 text-2xl font-bold leading-snug tracking-tight focus:outline-none sm:text-3xl">{question.q}</h1>
      {question.hint && <p className="text-sm text-slate-600">{question.hint}</p>}
      {question.visual && <AcnePhotoReference />}
      {question.multiple && <p className="text-sm font-medium text-forest-700">여러 고민이 함께 있다면 해당하는 항목을 모두 골라주세요.</p>}
      {question.id === "concern" && <p className="text-sm text-slate-600">기초 관리에 더해 지금 필요한 관리가 있는지 확인해요.</p>}
      <div className="grid gap-2.5 pt-2" role="group" aria-labelledby="care-question">{question.options.map(option => <SurveyChoice key={option.value} multiple={question.multiple} selected={isSelected(option.value)} onClick={() => select(option.value)}>
        <span className="block">{option.label}</span>{option.detail && <span className="mt-0.5 block text-sm font-normal text-slate-600">{option.detail}</span>}
      </SurveyChoice>)}</div>
    </section>
    {question.id === "concern" && onSerumPreference && <section aria-label="지금 쓰는 화장품 확인" className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
      <h2 className="font-semibold">지금 쓰는 화장품이 있나요?</h2>
      <p className="text-sm text-slate-700">잘 맞는 제품을 굳이 바꾸지 않도록, 아는 제품만 담고 사용감을 골라요. 건너뛰어도 돼요.</p>
      {routineReview && <DetailDisclosure title="쓰는 화장품 검색·직접 입력 (선택)">
        <RoutineProductLookup {...routineReview} profile={undefined} />
      </DetailDisclosure>}
      <label className="block text-sm font-semibold">지금 쓰는 세럼은 어때요? (선택)
        <select value={serumPreference} onChange={event => onSerumPreference(event.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-2 font-normal">
          <option value="">선택하지 않음</option><option value="keep">편하게 쓰고 있어서 유지할래요</option><option value="compare">쓰지 않거나 다른 세럼을 비교하고 싶어요</option>
        </select>
      </label>
    </section>}
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
    <div className="flex justify-between gap-3"><button type="button" className="care-secondary" onClick={onPrev}>이전</button>
      <PrimaryButton disabled={question.multiple ? !selected.length : !answer} onClick={onNext}>{index === total - 1 ? "기본 루틴과 추가 관리 보기" : "다음"}</PrimaryButton></div>
  </div>;
}
