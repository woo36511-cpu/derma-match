import { getObservationCheckDays, isObservationValue } from "./moisturizerObservation";

export function getCosmeticNextStep(study, config) {
  if (!study || !config) return null;
  const full = study.followUp, early = study.earlyCheck;
  if ([early, full].some(report => ["irritation", "stopped_irritation"].includes(report?.reaction))) return {
    status: "irritation", title: "따갑거나 붉어졌다면 그 제품을 쉬어요.",
    detail: "수치가 좋아졌더라도 자극이 있었던 제품은 다시 추가하지 말고, 편했던 다른 단계는 유지해요.",
  };
  const report = full ?? early;
  if (report?.reaction === "stopped_other") return {
    status: "stopped", title: "중단한 이유를 기준으로 한 가지만 다시 골라요.",
    detail: "사용감이나 사용 빈도 때문에 중단했다면 같은 고민에 맞는 다른 제형 하나를 비교할 수 있어요.",
  };
  if (!full) return null;
  const before = config.cosmetic ? study.baselineValue : study.baselineDays;
  const after = config.cosmetic ? full.value : full.days;
  const comfortWorse = Number.isInteger(study.baselineComfort) && Number.isInteger(full.comfort) && full.comfort > study.baselineComfort;
  const daysEnough = !config.cosmetic || ["14_27", "28_plus"].includes(full.useDays) || (getObservationCheckDays(config) === 14 && full.useDays === "7_13");
  const useMatches = (study.choice === "start" && full.used === "recommended") || (study.choice === "keep" && full.used === "existing");
  if (!isObservationValue(config, before) || before === 0 || !isObservationValue(config, after) || !useMatches ||
      full.otherChanges !== "no" || full.frequency !== "daily" || !daysEnough) return {
    status: "uncompared", title: "지금 기록으로 제품 하나의 변화를 판단하기 어려워요.",
    detail: "여러 제품을 한꺼번에 바꾸기보다 현재 불편한 한 가지부터 다시 확인해요.",
  };
  if (comfortWorse || after > before) return {
    status: "worse", title: "불편해진 관리 단계부터 다시 점검해요.",
    detail: "새 기능성 제품을 더 얹기 전에 어떤 변화가 있었는지 확인해요. 편했던 다른 제품은 그대로 둘 수 있어요.",
  };
  if (after === 0) return { status: "resolved", title: "지금 편한 관리를 유지해요.", detail: "이번 기록에서는 그 고민이 없었어요. 같은 목적의 제품을 더 살 필요는 없어요." };
  if (after < before) return { status: "partial", title: "조금 나아졌어요. 한꺼번에 바꾸지 않아도 돼요.", detail: "불편이 계속 신경 쓰인다면 다음 추천에서 이 고민에 해당하는 한 단계만 다시 비교해요." };
  return { status: "unchanged", title: "그 고민에 해당하는 한 단계만 다시 비교해요.", detail: "같은 조건에서 변화가 없었다고 답했어요. 편했던 제품은 두고 보습감이나 사용감이 다른 후보를 골라볼 수 있어요." };
}
