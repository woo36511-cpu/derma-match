import { avoidPersonalProduct, getPersonalRoutineActions } from "../utils/personalProductFeedback";
import { sunscreenOption } from "../data/targetedCareProducts";
import { useVerifiedProductFormula } from "../hooks/useVerifiedProductFormula";
import { getReactionIngredientClues } from "../utils/reactionIngredientFit";
import { getRoutineLookupProduct } from "../utils/routineLookup";
import ProductChangeReview from "../components/ProductChangeReview";
import { readPricePreference } from "../data/pricePreference";
import { getProductById, hasExfoliatingActive } from "../utils/productCatalog";
import { getProductEvidenceStatus, RECOMMENDATION_RULE_VERSION } from "../utils/productEvidence";
import { AcneCareReview } from "../components/AcneCareReview";
import { buildAcneCareReview } from "../utils/acneCareReview";
import { ADAPTIVE_SURVEY_VERSION } from "../data/adaptiveObservationSurvey";
import { CosmeticAddOnSection } from "../components/CosmeticAddOnSection";
import { buildCosmeticAddOnPlan } from "../utils/cosmeticAddOnPlan";
import { useMemo, useState } from "react";
import { acneAreas, getSimpleCareQuestions, cleanSimpleCareAnswers } from "../data/simpleCare";
import { buildSimpleCarePlan, SIMPLE_CARE_VERSION } from "../utils/simpleCarePlan";
import { buildSimpleSkinRecord } from "../utils/simpleSkinRecord";
import { buildDynamicRoutine, getRankedProductCandidates, getSeasonalMoisturizerPair, pickBestProductByCategory } from "../utils/routineRecommendation";
import { AcnePhotoReference } from "../components/AcnePhotoReference";
import { FolliculitisOptions } from "../components/FolliculitisOptions";
import { ConcernProductOptions } from "../components/ConcernProductOptions";
import { RoutineProductScroller } from "../components/RoutineProductScroller";
import { getBasicObservationTracks, getObservationKinds } from "../utils/moisturizerObservation";
import { buildRoutineSurveyContext, getEntriesForSurveyScope, getCurrentRoutineContext, getCurrentRoutineProduct, getExactCatalogProduct, getReviewedRoutineProduct, getSerumRoutineSummary } from "../utils/currentRoutineReview";
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

export function HydrationComparison({ slot, product, entries = [] }) {
  const category = { toner: "toner", serum: "serum", cream: "moisturizer" }[slot];
  if (!category || !product) return null;

  const reviewedProfile = getProductEvidenceStatus(product).eligible ? product.careProfile : null;
  const recommendedScore = reviewedProfile?.hydrationSupport;
  const comparisons = entries.flatMap(entry => {
    const previous = getCurrentRoutineProduct(entry);
    if (previous?.category !== category) return [];
    const catalog = getReviewedRoutineProduct(entry)?.catalog;
    if (previous.id === product.id || catalog?.id === product.id) return [];
    const previousScore = catalog?.careProfile.hydrationSupport;
    let label = "비교 자료 부족";
    if (Number.isFinite(recommendedScore) && Number.isFinite(previousScore)) {
      label = recommendedScore > previousScore ? "기존 제품보다 높음"
        : recommendedScore < previousScore ? "기존 제품보다 낮음" : "기존 제품과 비슷함";
    }
    const textureDifference = reviewedProfile && catalog ? reviewedProfile.lightweightFit - catalog.careProfile.lightweightFit : null;
    const texture = textureDifference >= 2 ? "기존보다 산뜻한 마무리로 예상돼요."
      : textureDifference <= -2 ? "기존보다 묵직한 마무리로 예상돼요." : null;
    const previousPurpose = reviewedProfile && catalog?.shortReason !== product.shortReason ? catalog?.shortReason : null;
    return [{ id: entry.id, name: previous.name, label, texture, previousPurpose }];
  });
  if (!comparisons.length) return null;

  return <section className="mt-2 rounded-xl bg-forest-50 p-3 text-sm" aria-label={`보습감 비교 · ${product.name}`}>
    <h4 className="font-bold text-forest-900">기존 제품과 달라지는 점</h4>
    <ul className="mt-1 space-y-2">{comparisons.map(({ id, name, label, texture, previousPurpose }) =>
      <li key={id} className="space-y-1">
        <span className="block break-words text-slate-700">{name}</span>
        {previousPurpose && <p>기존 제품의 주요 기능 · {previousPurpose}</p>}
        <p>예상 보습감 · <strong>{label}</strong></p>
        {texture && <p>{texture}</p>}
      </li>
    )}</ul>
    <p className="mt-2 text-xs text-slate-600">제품 검수 자료 기준 · 실제 사용감은 다를 수 있어요.</p>
  </section>;
}

export function CombinationMoisturizerGuide({ profile, product, context, renderedComparison }) {
  const observations = profile.observationAssessment?.resolvedObservations;
  if (!product || observations?.observedOil !== "tzone") return null;

  const comfortable = observations.drynessArea === "none";
  const persistent = observations.drynessTiming === "persistent";
  const sustained = observations.drynessArea === "cheeks" && (persistent || observations.drynessTiming === "day");
  if (!comfortable && !sustained) return null;

  const richer = persistent && getRankedProductCandidates("cream", 3, context).find(candidate =>
    candidate.id !== product.id && !hasExfoliatingActive(candidate) &&
    candidate.careProfile.hydrationSupport > product.careProfile.hydrationSupport);

  return <section className="care-panel space-y-2 text-sm" aria-label="복합성 피부의 부위별 보습">
    <h3 className="font-bold">{comfortable ? "이마·코는 번들거리고 볼은 편안해요" : "이마·코는 번들거리고 볼은 당겨요"}</h3>
    <p>{comfortable ? "볼이 편안하다면 가벼운 보습제 하나로 시작해요."
      : "볼의 당김과 이마·코의 유분을 함께 고려해 중간 보습감 기준으로 제품을 골랐어요. 먼저 보습제 하나로 시작해요."}</p>
    <ul className="space-y-1">
      <li><strong>이마·코</strong> · 얇게 발라요.</li>
      <li><strong>볼</strong> · {comfortable ? "편안하게 느껴지는 양만 발라요." : "같은 제품을 바르고, 당김이 남는 곳에만 한 겹 더 발라요."}</li>
    </ul>
    {persistent && <DetailDisclosure title="볼만 계속 당기면">
      <p>같은 제품을 한 겹 더 발라도 계속 당긴다면 볼에만 더 보습감 있는 제형을 고려해요.</p>
      {richer && <div className="mt-3 max-w-xs"><RoutineProductScroller layout="routine" productsByCategory={{ cream: richer }}
        renderAfterProduct={renderedComparison} userContext={{ ...context, level: 3 }} /></div>}
    </DetailDisclosure>}
  </section>;
}

export function SimpleCareResult({ profile, routine, plan, onReviewRoutine, serumStatus, otherRetained = [], advice, recommendationContext, ownedIds, notes, routineHasIrritation, makeupCleansing, replacement, tracking, currentEntries }) {
  const heading = useScreenHeading("care-result");
  const concernFirst = plan.blockNewBasics || (plan.answers.concern !== "none" && !routineHasIrritation);
  const priority = concernFirst ? plan : advice;
  const fitNote = !concernFirst && advice?.slot && getRoutineFitSignals(advice.slot, recommendationContext)?.note;
  const firstCareAction = !concernFirst && !routineHasIrritation && profile.observationAssessment?.canRecommendBasics === false
    ? profile.observationAssessment.careActions?.[0] : null;
  const seasonalPair = getSeasonalMoisturizerPair(profile.hydrationLevel, recommendationContext, routine);
  const compareHydration = routine.isHistorical ? undefined : (slot, product) =>
    <>
      {slot === "toner" && recommendationContext?.supportTonerForSerum && <p className="mt-2 text-sm text-slate-700">
        세안 직후 당김을 가볍게 보완하는 선택 단계예요. {recommendationContext.supportTonerForSerum} 전에 사용하고 크림으로 마무리해요.
      </p>}
      <HydrationComparison slot={slot} product={product} entries={currentEntries} />
    </>;
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
        <dl className="grid gap-1 border-t border-stone-200 pt-2 text-sm">
          {(!plan.blockNewBasics && (otherRetained.length > 0 || serumStatus?.keep?.length > 0)) && <div><dt className="inline font-semibold">유지 · </dt><dd className="inline">편하게 쓰는 {[
            ...otherRetained.map(([slot]) => routineSlotNames[slot]), ...(serumStatus?.keep?.length ? ["세럼"] : []),
          ].join("·")}</dd></div>}
          {replacement && <div><dt className="inline font-semibold">교체 검토 · </dt><dd className="inline">{replacement.name}</dd></div>}
          {(plan.pharmacy || plan.separateBreakout?.pharmacy) && <div><dt className="inline font-semibold">트러블용 후보 · </dt><dd className="inline">{(plan.pharmacy ?? plan.separateBreakout.pharmacy).name} — 해당 부위와 주의사항은 아래에서 확인해요.</dd></div>}
          {plan.separateBreakout && !plan.separateBreakout.pharmacy && <div><dt className="inline font-semibold">같이 살펴볼 고민 · </dt><dd className="inline">{plan.separateBreakout.title}</dd></div>}
        </dl>
        {tracking && <button type="button" className="care-secondary" onClick={tracking}>이 관리 시작·변화 기록</button>}
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
      {plan.parallelCare ? <p className="text-sm text-slate-600">새 트러블 관리와 평평한 자국 관리는 함께 할 수 있어요. 아침에는 {plan.parallelCare.hasSunscreen ? "잘 맞는 선크림을 유지하고" : "위 선크림 후보로 자외선 차단을 챙기고"}, 트러블에 쓰는 제품은 해당 부위와 제품 안내에 맞춰 사용해요.</p>
        : !plan.separateBreakout && <p className="text-sm text-slate-600">지금은 위의 관리부터 살펴보고, 다른 고민에 새 제품을 한꺼번에 추가하지 않아요.</p>}
    </section>}
    {plan.separateBreakout && <section className="care-panel space-y-3" aria-label="지금 올라온 트러블 관리">
      <h2 className="text-lg font-bold">지금 올라온 트러블 관리{plan.separateBreakout.area && ` · ${plan.separateBreakout.area}`}</h2>
      <p className="font-semibold">{plan.separateBreakout.title}</p><p className="text-sm">{plan.separateBreakout.detail}</p>
      <ConcernProductOptions plan={plan.separateBreakout} />
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
      <RoutineProductScroller layout="routine" productsByCategory={routine.products} renderAfterProduct={compareHydration} optionalSlots={["toner", "serum"]} userContext={{ ...recommendationContext, level: profile.hydrationLevel, acneSupport: plan.answers.concern === "acne" }} />
      {!routine.isHistorical && <CombinationMoisturizerGuide profile={profile} product={routine.products.cream}
        context={recommendationContext} renderedComparison={compareHydration} />}
      {seasonalPair && <section className="care-panel space-y-3" aria-label="계절과 사용감에 따른 보습제 비교">
        <h3 className="font-bold">같은 피부 성향, 다른 날의 보습제</h3>
        <p className="text-sm text-slate-700">더울 때와 건조할 때 중 지금에 맞는 한 가지를 골라요. 두 제품을 함께 쓸 필요는 없어요.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[["더울 때 · 가벼운 사용감", seasonalPair.light], ["건조할 때 · 더 있는 보습감", seasonalPair.rich]].map(([label, product]) =>
            <div key={product.id} className="space-y-2"><p className="care-kicker">{label}</p>
              <RoutineProductScroller layout="routine" productsByCategory={{ cream: product }} renderAfterProduct={compareHydration} userContext={{ ...recommendationContext, level: profile.hydrationLevel }} />
            </div>)}
        </div>
      </section>}
      {!routine.isHistorical && Object.keys(routine.products).map(slot => {
        const comparison = getRoutineComparison(routine, slot, ownedIds);
        return comparison && <DetailDisclosure key={slot} title={`${routineSlotNames[slot]} 대안 비교`}>
          <p className="font-semibold">{comparison.alternative.name}</p><p>{comparison.reason}</p>
          {comparison.closeFit && <p className="mt-1 text-slate-600">두 후보 모두 비슷한 조건에 맞아요. 평소 선호하는 사용감으로 골라도 돼요.</p>}
          <div className="mt-3 max-w-xs"><RoutineProductScroller layout="routine" productsByCategory={{ [slot]: comparison.alternative }} renderAfterProduct={compareHydration} userContext={{ ...recommendationContext, level: profile.hydrationLevel }} /></div>
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

function updateCareAnswer(previous, id, value, options) {
  if (JSON.stringify(previous[id]) === JSON.stringify(value)) return previous;
  const next = { ...previous, [id]: value };
  const order = ["concern", "shapes", "primaryShape", "locations", "areaState", "stingingSlot", "breakoutSiteState", "breakoutExtent", "medicine", "duration", "response"];
  for (const downstream of order.slice(order.indexOf(id) + 1)) {
    if (downstream !== "locations" || id === "concern") delete next[downstream];
  }
  if (id === "concern" || id === "shapes") delete next.shape;
  return cleanSimpleCareAnswers(next, options);
}

export function SimpleCareScreen({ profile, surveyAnswers, initialRecord, onSave, onBack, onHome, onRestart, onReviewRoutine, currentRoutineEntries, routineReview, priorSerumPreference, personalProductFeedback, observation }) {
  const [legacyExtent, setLegacyExtent] = useState(() => Boolean(initialRecord &&
    initialRecord.symptomAssessment?.ruleVersion !== SIMPLE_CARE_VERSION && !initialRecord.additionalCare?.breakoutExtent));
  const priorReactionProduct = surveyAnswers?.reactionProduct ? getRoutineLookupProduct(surveyAnswers.reactionProductId) : null;
  const careQuestionOptions = { legacyExtent, knownReactionProduct: Boolean(priorReactionProduct) };
  const [answers, setAnswers] = useState(() => cleanSimpleCareAnswers(initialRecord?.additionalCare ?? {}, careQuestionOptions));
  const [index, setIndex] = useState(0);
  const [record, setRecord] = useState(initialRecord ?? null);
  const [showResult, setShowResult] = useState(() => Boolean(initialRecord));
  const [saveError, setSaveError] = useState(false);
  const intake = readRoutineSurveyContext(surveyAnswers?.routineIntake);
  const [legacySerumPreference, setSerumPreference] = useState(() => initialRecord?.routinePreferences?.serum ?? priorSerumPreference ?? "");
  const serumPreference = intake ? intake.serumPreference ?? "" : legacySerumPreference;
  const intakeUse = intake?.use, routineScope = intake?.routineScope;
  const activeRoutineEntries = useMemo(() => intakeUse && intakeUse !== "yes" ? emptyRoutine :
    getEntriesForSurveyScope(currentRoutineEntries, routineScope), [currentRoutineEntries, intakeUse, routineScope]);
  const reactionProduct = priorReactionProduct;
  const { formula: reactionFormula, pending: reactionPending } = useVerifiedProductFormula(showResult ? reactionProduct : null, currentRoutineEntries);
  const reactionClues = reactionFormula ? getReactionIngredientClues(reactionFormula.ingredients) : [];
  const reactionContext = { reactionProductId: reactionProduct?.id, reactionIngredientFamilies: reactionClues.map(({ family }) => family) };
  const reviewEntries = useMemo(() => reactionProduct
    ? activeRoutineEntries?.filter(entry => getCurrentRoutineProduct(entry)?.id !== reactionProduct.id)
    : activeRoutineEntries, [activeRoutineEntries, reactionProduct]);
  const entryCatalog = entry => getExactCatalogProduct(getCurrentRoutineProduct(entry));
  const ownedCatalog = (activeRoutineEntries ?? []).map(entryCatalog).filter(Boolean);
  const hasEarlierIrritation = entry => avoidPersonalProduct(entryCatalog(entry), personalProductFeedback);
  const comfortEntries = (reviewEntries ?? []).filter(entry => !hasEarlierIrritation(entry));
  const currentRoutine = useMemo(() => getCurrentRoutineContext(reviewEntries), [reviewEntries]);
  const comfortRoutine = getCurrentRoutineContext(comfortEntries);
  const removedUnsafeSerum = Boolean(currentRoutine.rowsBySlot.serum?.length && !comfortRoutine.rowsBySlot.serum?.length);
  const effectiveSerumPreference = removedUnsafeSerum ? "" : serumPreference;
  const serumStatus = getSerumRoutineSummary(comfortEntries, effectiveSerumPreference === "keep");
  const skipBasicSerum = (effectiveSerumPreference !== "compare" && serumStatus.skipBasicSerum) || serumStatus.hasIrritation;
  const [cosmeticAnswers, setCosmeticAnswers] = useState(() => initialRecord?.cosmeticAddOn?.answers ?? null);
  const questions = getSimpleCareQuestions(answers, careQuestionOptions);
  const question = questions[Math.min(index, questions.length - 1)];
  const plan = applyObservationToCarePlan(buildSimpleCarePlan(answers, careQuestionOptions), profile);
  const assessment = profile.observationAssessment;
  const observedSkin = assessment?.resolvedObservations;
  const preferences = getRoutinePreferences(comfortRoutine, observedSkin, effectiveSerumPreference);
  for (const slot of ["cleanser", "toner", "serum", "cream"]) {
    if (currentRoutine.rowsBySlot[slot]?.length && !comfortRoutine.rowsBySlot[slot]?.length) preferences.suppressedSlots.delete(slot);
  }
  const allowNewBasics = assessment?.canRecommendBasics !== false && !plan.blockNewBasics && !currentRoutine.irritated.length;
  const makeupCleansing = getMakeupCleansingPlan(surveyAnswers, {
    blocked: !allowNewBasics,
    sensitive: assessment?.isSensitive ?? true,
    cleanserDiscomfort: Boolean(currentRoutine.slotReactions.cleanser) || ["tight", "stings"].includes(observedSkin?.washResponse),
  });
  if (makeupCleansing?.skipNewCleanser) preferences.suppressedSlots.add("cleanser");
  const serumToKeep = effectiveSerumPreference !== "compare" ? getCurrentRoutineProduct(serumStatus.keep[0]) : null;
  const supportTonerForSerum = allowNewBasics && observedSkin?.drynessTiming !== "persistent" &&
    (observedSkin?.washResponse === "tight" || observedSkin?.drynessTiming === "wash") ? serumToKeep?.name : undefined;
  const recommendationContext = { ...currentRoutine, ...reactionContext, suppressedSlots: preferences.suppressedSlots, mainConcern: "none",
    supportTonerForSerum,
    pricePreference: readPricePreference(surveyAnswers),
    skinType: profile.skinType, careNeeds: profile.careNeeds, basicOnly: profile.surveyVersion === ADAPTIVE_SURVEY_VERSION,
    isSensitive: assessment?.isSensitive ?? true, observationKinds: getObservationKinds(profile),
    observationTracks: getBasicObservationTracks(profile), observedSkin, personalProductFeedback };
  const specificStinging = plan.answers.areaState === "product_stings";
  const replacementSlot = specificStinging
    ? (reactionProduct ? (reactionProduct.category === "moisturizer" ? "cream" : reactionProduct.category) : plan.answers.stingingSlot)
    : ["cleanser", "cream"].find(slot => !currentRoutine.rowsBySlot[slot]?.length);
  const mayCompareReplacement = (specificStinging || plan.answers.areaState === "irritated") &&
    !["worse", "irritated"].includes(plan.answers.response) && !["broken", "irritated"].includes(observedSkin?.surfaceObservation);
  const replacementContext = { ...recommendationContext, isSensitive: true, basicOnly: true,
    irritated: [], suppressedSlots: new Set(), pricePreference: null, supportTonerForSerum: undefined };
  const replacement = mayCompareReplacement && ["cleanser", "cream", "toner", "serum"].includes(replacementSlot)
    ? pickBestProductByCategory(replacementSlot, profile.hydrationLevel ?? 5, replacementContext) : null;
  const historical = !reactionProduct && initialRecord?.routine && initialRecord.recommendationAssessment?.ruleVersion !== RECOMMENDATION_RULE_VERSION &&
    JSON.stringify(cleanSimpleCareAnswers(initialRecord.additionalCare ?? {}, careQuestionOptions)) === JSON.stringify(answers) &&
    (initialRecord.routinePreferences?.serum ?? priorSerumPreference ?? "") === serumPreference &&
    Object.values(initialRecord.routine).some(Boolean) && !currentRoutine.ownedProductIds.size && !Object.keys(currentRoutine.rowsBySlot).length;
  const displayRoutine = !allowNewBasics ? { products: {} }
    : historical ? { products: Object.fromEntries(Object.entries(initialRecord.routine).map(([category, id]) => [category, getProductById(id) ?? null])),
      selectionEvidence: initialRecord.recommendationAssessment?.selectionEvidence ?? null, isHistorical: true }
    : buildDynamicRoutine(profile.hydrationLevel, recommendationContext);
  const otherRetained = Object.entries(preferences.retained).filter(([slot]) => slot !== "serum");
  const pastIrritationProduct = ownedCatalog.find(product => avoidPersonalProduct(product, personalProductFeedback));
  const advice = pastIrritationProduct && allowNewBasics ? {
    title: "이전에 불편했던 제품부터 점검해요.",
    detail: `${pastIrritationProduct.name} 사용 후 자극을 기록했어요. 해당 제품은 이번 유지 목록에서 빼고, 편하게 쓰는 나머지 제품은 유지해요.`,
  } : buildRoutineAdvice({ currentRoutine: comfortRoutine, routine: displayRoutine, assessment, plan, retained: preferences.retained });
  const visibleSerumStatus = { ...serumStatus, skipBasicSerum };
  const cosmeticContext = { profile, surveyAnswers, carePlan: plan, routine: displayRoutine, personalProductFeedback, currentRoutine: { ...currentRoutine, ...reactionContext } };
  const cosmeticPlan = cosmeticAnswers ? buildCosmeticAddOnPlan(cosmeticAnswers, cosmeticContext) : null;
  const applyCosmeticRoute = addon => addon?.suppressPharmacy ? { ...plan, pharmacy: null, title: "막힌 피지·거친 결은 선택한 화장품 후보로 살펴봐요.", detail: "아래 추가 화장품 영역에서 선택한 후보를 확인해요. 약품 후보 표시는 보류했어요.", productNote: "각질 관리 화장품과 여드름약을 같은 부위에 함께 새로 시작하지 않아요." } : plan;
  const appliedPlan = applyCosmeticRoute(cosmeticPlan);
  const breakoutReview = appliedPlan.separateBreakout;
  const canShowSeparatePharmacy = !cosmeticPlan?.suppressPharmacy && !["broken", "irritated"].includes(observedSkin?.surfaceObservation) &&
    (!assessment?.currentIrritation || breakoutReview?.separateComfortable);
  const baseDisplayPlan = { ...appliedPlan, separateBreakout: breakoutReview && !canShowSeparatePharmacy && breakoutReview.pharmacy
    ? { ...breakoutReview, pharmacy: null, title: "현재 피부 반응부터 확인해요.",
      detail: "자극이 있거나 진행 중인 관리와 겹칠 수 있어 새 약 후보는 표시하지 않아요." } : breakoutReview };
  const parallelMarks = plan.answers.shapes?.filter(shape => ["dark_mark", "red_mark"].includes(shape)) ?? [];
  const hasBreakout = plan.answers.shapes?.some(shape => ["closed", "blackhead", "red", "pus"].includes(shape));
  const parallelCare = allowNewBasics && hasBreakout && parallelMarks.length > 0 &&
    !plan.answers.shapes.includes("deep") && ["comfortable", "dry"].includes(plan.answers.areaState);
  const hasSunscreen = currentRoutine.hasSunscreen || ["with_sunscreen", "sunscreen_only"].includes(routineScope);
  const displayPlan = parallelCare ? { ...baseDisplayPlan, parallelCare: { hasSunscreen },
    ...(!hasSunscreen && { cosmetics: [...(baseDisplayPlan.cosmetics ?? []), {
      ...sunscreenOption,
      guidance: "잘 맞는 선크림이 없다면 자국 부위의 자외선 차단에 사용할 후보예요.",
    }] }),
  } : baseDisplayPlan;
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
    const canTrackThisResult = !saveError && observation?.surveyId && observation.surveyId === record?.id;
    const offers = canTrackThisResult ? observation.offers : [];
    const tracked = canTrackThisResult ? observation.history.filter(item => (item.productObservation ?? item.moisturizerObservation)?.surveyId === record.id) : [];
    const openTracking = offers.length === 1 && !tracked.length
      ? () => observation.start(offers[0].kind)
      : offers.length || tracked.length ? () => document.getElementById("care-result-tracking")?.scrollIntoView?.({ block: "center" }) : undefined;
    const personalActions = getPersonalRoutineActions({
      candidates: displayRoutine.isHistorical ? [] : [...Object.values(displayRoutine.products), replacement],
      current: ownedCatalog, level: profile.hydrationLevel, context: recommendationContext,
    });
    const notes = <>
    {personalActions.length > 0 && <section className="care-panel space-y-2" aria-label="지난 사용 기록 반영">
      <h2 className="font-bold">지난 사용 기록을 반영했어요</h2>
      <ul className="space-y-2 text-sm">{personalActions.map(({ product, action }) => <li key={product.id}>
        <strong>{product.name}</strong> · {{
          review_irritation: "지난번 사용 후 자극을 기록해 이번에는 유지 제품이나 새 추천에 넣지 않았어요. 지금도 불편한지 제품 점검에서 확인해요.",
          keep_if_comfortable: "비슷한 상태에서 피부 고민이 줄었다고 기록했어요. 지금도 편하게 쓰고 있다면 유지해요.",
          previous_improvement: "비슷한 상태에서 피부 고민이 줄었다고 기록해 이번 후보를 고를 때 참고했어요.",
          check_remaining_concern: "비슷한 상태에서 사용 후 개선이 기록되지 않았어요. 지금 남아 있는 고민과 사용감을 다시 확인해요.",
        }[action]}
      </li>)}</ul>
    </section>}
    <ProductChangeReview answers={surveyAnswers} entries={currentRoutineEntries} />
    {replacement && <section className="care-panel space-y-3" aria-label="불편했던 기본 제품 대안">
      <h2 className="font-bold">불편했던 기본 제품 대안</h2>
      <p className="text-sm">이 단계 하나만 비교해요. 이미 편하게 쓰는 다른 제품까지 바꿀 필요는 없어요. 전성분을 확인한 후보지만, 따가움이 없다고 보장할 수는 없어요.</p>
      <RoutineProductScroller layout="routine" productsByCategory={{ [replacementSlot]: replacement }} renderAfterProduct={(slot, product) => <HydrationComparison slot={slot} product={product} entries={activeRoutineEntries} />} userContext={{ ...replacementContext, level: profile.hydrationLevel ?? 5 }} />
    </section>}
    {surveyAnswers?.reactionProduct && <details className="rounded-xl border border-slate-200 p-4 text-sm">
      <summary className="cursor-pointer font-semibold">따갑거나 붉어진 제품을 추천에 어떻게 반영했나요?</summary>
      <div className="mt-3 space-y-2">
        {reactionProduct && <p>{reactionProduct.name}은 새로 추천하거나 유지할 제품으로 표시하지 않아요.</p>}
        {reactionPending ? <p role="status">공식 전성분을 확인하고 있어요.</p> : reactionClues.length ? <>
          <p>확인된 전성분 중 살펴볼 성분: {reactionClues.map(({ ingredient }) => ingredient).join(", ")}.</p>
          <p>같은 계열이 확인된 새 후보는 추천 순위를 낮췄어요. 성분표만으로 어떤 성분이 반응의 원인인지는 알 수 없어요.</p>
        </> : <p>{reactionFormula ? "전성분은 확인했지만 이번 반응과 연결해 볼 만한 성분을 찾지 못했어요." : "제품이나 전성분을 확인하지 못해 성분별 추천 조정은 하지 않았어요."}</p>}
        {reactionFormula?.sourceUrl && <a className="underline" href={reactionFormula.sourceUrl} target="_blank" rel="noreferrer">공식 제품 정보 보기</a>}
      </div>
    </details>}
    {recommendationContext.pricePreference === "important" && Object.values(displayRoutine.products).some(Boolean) && !historical && <p className="rounded-xl bg-slate-50 p-4 text-sm">가격을 중요하게 선택했어요. 피부에 비슷하게 맞는 제품 중 확인된 공식 기준가가 있는 제품을 우선해요. 실제 할인 가격과 배송비는 판매처에서 확인할 수 있어요.</p>}
    {displayRoutine.isHistorical && <p className="rounded-xl bg-slate-50 p-4 text-sm">저장 당시의 제품 후보를 보여드려요. 새 검수 기준으로 다시 추천받으려면 아래에서 다시 확인해요.</p>}
    {newReview && onRestart && <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
      <p>전에는 보습 특성을 알 수 없었던 단계에 검수된 제품 정보가 있어요. 지금도 쓰는 제품이라면 새 설문에서 반영할 수 있어요.</p>
      <button type="button" className="font-semibold text-emerald-900 underline" onClick={onRestart}>검수된 제품 정보로 다시 확인</button>
    </div>}
    </>;
    return <div className="space-y-6">
      <SimpleCareResult currentEntries={activeRoutineEntries} profile={profile} routine={displayRoutine} otherRetained={otherRetained} advice={advice} recommendationContext={recommendationContext} ownedIds={currentRoutine.ownedProductIds} plan={displayPlan} serumStatus={visibleSerumStatus} onReviewRoutine={saveError ? undefined : onReviewRoutine} notes={notes} replacement={replacement} tracking={openTracking} routineHasIrritation={currentRoutine.irritated.length > 0} makeupCleansing={makeupCleansing} />
    {(profile.surveyVersion !== ADAPTIVE_SURVEY_VERSION || displayRoutine.isHistorical) && onRestart && <button onClick={onRestart} className="rounded-xl border px-4 py-3">새 기준으로 다시 확인</button>}
    {allowNewBasics && <CosmeticAddOnSection context={cosmeticContext} initialAnswers={cosmeticAnswers} onApply={save} />}
    {(offers.length > 0 || tracked.length > 0) && <section id="care-result-tracking" className="care-panel space-y-3" aria-label="관리 변화 기록">
      <h2 className="font-bold">제품과 고민별로 변화 기록하기</h2>
      <p className="text-sm">실제로 사용했는지, 고민이 줄었는지, 자극이 있었는지를 따로 기록해요.</p>
      {offers.map(({ kind, config, product }) => <button type="button" key={kind} className="care-secondary mr-2" onClick={() => observation.start(kind)}>{config.symptom} · {product.name} 기록 시작</button>)}
      {tracked.length > 0 && <button type="button" className="care-secondary" onClick={observation.resume}>진행 중인 변화 기록 보기</button>}
    </section>}
    <ProcedureOptions plan={displayPlan} profile={profile} />
    {saveError && <div role="alert" className="rounded-xl bg-amber-50 p-4">결과는 표시했지만 저장하지 못했어요. <button className="underline" onClick={() => save()}>저장 다시 시도</button></div>}
    <div className="flex flex-wrap gap-3"><button type="button" className="care-secondary" onClick={() => { setShowResult(false); setLegacyExtent(false); setIndex(0); }}>추가 고민 답변 바꾸기</button><button type="button" className="care-secondary" onClick={onBack}>피부타입 답변 다시 보기</button><PrimaryButton onClick={onHome}>시작 화면</PrimaryButton></div>
    </div>;
  }
  const changeAnswer = (id, value) => {
    const next = updateCareAnswer(answers, id, value, careQuestionOptions);
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
