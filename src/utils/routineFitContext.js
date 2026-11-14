const dryAreas = { cheeks: "볼·입 주변", tzone: "이마·코 주변", whole: "얼굴 전반" };

export function getRoutineFitSignals(category, context = {}) {
  const observation = context.observedSkin;
  const reaction = context.slotReactions?.[category];
  if (!observation && !reaction) return null;
  const needs = context.careNeeds ?? {};
  const isWash = category === "cleanser";
  const dryArea = dryAreas[observation?.drynessArea];
  const dry = Math.max(0, Math.min(10, needs.hydrationNeed ?? 0));
  const oil = Math.max(0, Math.min(10, needs.lightTextureNeed ?? 0));
  const washTight = isWash && (reaction === "wash_tight" || observation?.washResponse === "tight");
  const postMoistureTight = !isWash && (reaction === "moisture_tight" || (category === "cream" && observation?.moisturizerUse === "persistent"));
  const heavy = reaction === "heavy" || (category === "cream" && observation?.moisturizerUse === "heavy");
  const zonedOil = observation?.observedOil === "tzone";
  const dryAfterMoisturizer = observation?.drynessTiming === "persistent";
  const distinctAreas = zonedOil && observation?.drynessArea === "cheeks" && dry > 0;

  // Oil area sets the texture priority; it never subtracts hydration need.
  const texture = heavy ? 10 : isWash && washTight ? Math.min(oil, 3)
    : zonedOil ? Math.min(oil, isWash ? 2 : 4) : oil;
  const hydration = isWash ? (washTight ? Math.max(dry, 7) : dry * 0.75)
    : postMoistureTight || dryAfterMoisturizer ? Math.max(dry, 7) : dry;
  const barrier = Math.max(needs.barrierCareNeed ?? 0, !isWash && postMoistureTight ? 5 : 0);
  let note = null;
  if (isWash && washTight) note = "세안 직후 당김을 기준으로 골랐어요. 씻을 때 볼까지 세게 문지르지 않아요.";
  else if (heavy) note = "바른 직후 무거웠던 제품과 비교해, 더 가벼운 마무리를 우선했어요.";
  else if (!isWash && distinctAreas) note = "당기는 볼·입 주변에 보습을 먼저 하고, 이마·코는 얇게 발라 사용감을 비교해요.";
  else if (!isWash && dryArea && hydration >= 4) note = `${dryArea}의 당김을 기준으로 보습감을 골랐어요.`;
  else if (zonedOil) note = isWash ? "이마·코만 번들거려도 얼굴 전체의 세안 강도를 높이지 않아요." : "이마·코 주변만 번들거린다고 답했어요. 그 부위는 얇게 발라 비교해요.";
  else if (observation?.observedOil === "whole") note = isWash ? "얼굴 전반에 오후 유분이 느껴져, 세안 후 부담이 적은 제형을 비교했어요." : "얼굴 전반에 오후 유분이 느껴져 가볍게 마무리되는 제형을 우선했어요.";

  return { hydration, texture, barrier, washTight, heavy, postMoistureTight, zonedOil, distinctAreas, note };
}
