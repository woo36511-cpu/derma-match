import { getProductById } from "./productCatalog";
import { getProductCareProfile } from "./productCareProfile";

export const routineSlotNames = { cleanser: "세안제", toner: "토너", serum: "세럼", cream: "보습제" };
export const routineSlots = Object.keys(routineSlotNames);
const coreSlots = ["cleanser", "cream"];
const comfortable = row => ["comfortable", "later_oil"].includes(row.reaction);

export function getRoutinePreferences(currentRoutine, observation, serumPreference) {
  const suppressedSlots = new Set();
  const retained = {};
  for (const slot of routineSlots) {
    const rows = currentRoutine.rowsBySlot[slot] ?? [];
    const kept = rows.filter(comfortable);
    const comparison = slot === "serum" && serumPreference === "compare";
    if (kept.length && !comparison) retained[slot] = kept.map(row => row.name);
    if (!comparison && (kept.length || (rows.length && !currentRoutine.slotReactions[slot]))) suppressedSlots.add(slot);
    if (!rows.length && observation && slot !== "serum") {
      const comfortableCream = slot === "cream" && observation.moisturizerUse === "comfortable" &&
        !["day", "persistent"].includes(observation.drynessTiming);
      // The wash question alone does not tell us whether a cleanser was used.
      if (comfortableCream) suppressedSlots.add(slot);
    }
  }
  if (serumPreference === "keep") suppressedSlots.add("serum");
  return { suppressedSlots, retained };
}

export function buildRoutineAdvice({ currentRoutine, routine, assessment, plan, retained }) {
  const observation = assessment?.resolvedObservations;
  const chosen = routine.products;
  if (plan.blockNewBasics || currentRoutine.irritated.length) return {
    title: "새 화장품보다 자극이 있었던 제품부터 확인해요.",
    detail: currentRoutine.irritated.length ? `${currentRoutine.irritated.join(" · ")} 사용 뒤 불편했다고 답했어요. 따가웠던 새 화장품은 쉬고, 편했던 제품만 이어가요.`
      : "현재 피부가 불편하다고 답했어요. 편했던 세안·보습을 유지하고 새 화장품은 더하지 않아요.",
  };
  if (assessment?.canRecommendBasics === false) return { title: "편한 제품을 유지하고 필요한 답만 더 확인해요.", detail: "유분·당김이나 현재 자극 여부가 확인되면 새 화장품을 골라요." };
  const changeSlot = [...coreSlots, "serum", "toner"].find(slot => currentRoutine.slotReactions[slot] && !retained[slot]);
  if (changeSlot) {
    const row = currentRoutine.rowsBySlot[changeSlot].find(item => item.reaction === currentRoutine.slotReactions[changeSlot]);
    const replacement = chosen[changeSlot];
    const reason = { heavy: "바른 직후 무겁다", moisture_tight: "발라도 당김이 남는다", wash_tight: "세안 직후 당긴다" }[row.reaction];
    return {
      slot: changeSlot,
      title: `${routineSlotNames[changeSlot]}부터 한 가지만 점검해요.`,
      detail: `${row.name} 사용 뒤 ${reason}고 답했어요. ${replacement ? `${replacement.name}과 비교하고, 편했던 다른 제품은 유지해요.` : "지금 조건에 맞는 새 후보가 없어 다른 제품을 함께 바꾸지 않아요."}`,
    };
  }
  const pendingSlot = coreSlots.find(slot => currentRoutine.rowsBySlot[slot]?.some(row => !comfortable(row)) && !retained[slot]);
  if (pendingSlot) return { title: `${routineSlotNames[pendingSlot]} 사용감을 먼저 확인해요.`, detail: "지금 쓰는 제품의 반응이 아직 확실하지 않아요. 불편한 시점과 부위를 확인하면 유지할지 대체할지 고르기 쉬워요." };
  if (retained.cream || (observation?.moisturizerUse === "comfortable" && !["day", "persistent"].includes(observation.drynessTiming))) {
    return { title: "편하게 쓰는 보습제는 그대로 유지해요.", detail: "지금 관리가 편하면 토너나 세럼을 꼭 더할 필요는 없어요. 필요한 제품만 아래에서 비교할 수 있어요." };
  }
  const slot = observation?.washResponse === "tight" && chosen.cleanser ? "cleanser" : chosen.cream ? "cream" : chosen.cleanser ? "cleanser" : null;
  if (slot) return { slot, title: `${routineSlotNames[slot]}부터 한 가지 골라요.`, detail: `${chosen[slot].name}부터 비교해요. 토너·세럼은 필요할 때만 하나씩 추가해요.` };
  return { title: "편하게 쓰는 화장품을 그대로 유지해요.", detail: "새 제품을 추가할 필요가 있는지 먼저 살펴봐요." };
}

export function getRoutineComparison(routine, slot, ownedIds) {
  const selected = routine.products[slot];
  const alternatives = routine.selectionEvidence?.[slot]?.alternatives ?? [];
  const item = alternatives.find(entry => !ownedIds?.has(entry.productId));
  const alternative = item && getProductById(item.productId);
  if (!selected || !alternative) return null;
  const a = getProductCareProfile(selected), b = getProductCareProfile(alternative);
  const textureGap = b.lightweightFit - a.lightweightFit;
  const hydrationGap = b.hydrationSupport + b.barrierSupport - a.hydrationSupport - a.barrierSupport;
  const reason = slot === "cleanser" && selected.category !== alternative.category
    ? ({ gel_cleanser: "젤 타입 세안제를 비교하고 싶을 때", cleansing_milk: "밀크 타입 세안제를 비교하고 싶을 때", cleanser: "다른 거품형 세안제를 비교하고 싶을 때" }[alternative.category])
    : textureGap >= 1 ? "더 가벼운 사용감을 원할 때"
      : hydrationGap >= 2 && slot !== "cleanser" ? "보습감을 더 원할 때"
        : textureGap <= -1 && slot !== "cleanser" ? "덜 산뜻한 제형도 비교하고 싶을 때" : "비슷한 기준에서 다른 제품을 보고 싶을 때";
  return { alternative, reason, closeFit: Math.abs(routine.selectionEvidence[slot].total - item.total) < 2 };
}
