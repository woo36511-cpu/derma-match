export function getLocalNoseCare(a) {
  const base = {
    urgency: "review",
    title: "작은 코 피부 밑 돌기는 약을 더하기 전에 변화를 봐요",
    nextAction: "짜거나 눌러서 확인하지 말고, 잘 맞던 순한 세안·보습은 유지해요. 새 여드름약이나 각질 제품을 겹치지 않아요. 커지거나 계속 아프거나 잘 낫지 않으면 확인받고, 코끝까지 아프게 붓거나 붉은기가 퍼지면 오늘 바로 진료받으세요.",
  };
  if (a.noseMedication === "patima") {
    if (a.noseMedicationResponse === "irritated") return {
      ...base, title: "바른 뒤 자극이 생겼다면 파티마겔을 쉬어요",
      nextAction: "파티마겔은 중단하고 새 여드름약으로 바로 바꾸지 마세요. 자극 부위를 문지르지 말고, 심한 붓기·통증이나 퍼지는 붉어짐이 생기면 오늘 진료받으세요. 자극이 이어지면 사용 재개 전에 확인받으세요.",
    };
    const early = a.noseMedicationDuration === "few_days" && a.noseMedicationResponse === "unchanged";
    return {
      ...base,
      title: early ? "파티마겔을 며칠 쓴 것만으로 약을 바꾸지 않아요" : "현재 반응과 사용 기간을 보고 다음 관리를 정해요",
      nextAction: (early ? "사용 1~3일만으로는 효과가 없다고 판단하기 어려워요. " : "") +
        "양이나 횟수를 늘리거나 애크논·각질 제품을 같은 자리에 추가하지 마세요. 설명서에 맞는 부위인지 확인하고, 바른 뒤 따가움·벗겨짐·붓기가 생기면 중단해요. 하루 한 번만 크기·통증을 비교하고, 커지거나 계속 아프거나 잘 낫지 않으면 확인받으세요. 코끝까지 아프게 붓거나 붉은기가 퍼지면 오늘 바로 진료받으세요.",
    };
  }
  if (a.noseMedication === "prescribed") return {
    ...base, title: "처방약 안내를 따르면서 새 약은 겹치지 않아요",
  };
  if (a.noseMedication === "other" || a.noseMedication === "unknown") return {
    ...base, title: "현재 바르는 제품명을 확인한 뒤 새 약을 골라요",
    nextAction: "지금 쓰는 제품 포장에서 이름과 성분을 먼저 확인해요. 피부 밑 돌기라고 해서 항생제나 항진균제로 바꾸지 않아요. " + base.nextAction,
  };
  return base;
}
