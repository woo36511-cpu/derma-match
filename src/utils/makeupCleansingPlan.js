import { readMakeupCleansingAnswers } from "../data/makeupCleansingSurvey";
import { makeupCleansingProducts } from "../data/makeupCleansingProducts";

export function getMakeupCleansingPlan(answers, { blocked = false, sensitive = true, cleanserDiscomfort = false } = {}) {
  const { removal } = readMakeupCleansingAnswers(answers);
  if (blocked || !removal || removal === "unknown") return null;

  if (removal === "irritated" || cleanserDiscomfort) return {
    skipNewCleanser: true,
    title: "새 클렌징 제품보다 지울 때의 자극부터 줄여요.",
    detail: "지울 때 문지르거나 여러 번 씻는 건 줄이고, 최근 바꾼 제품에서 따가움이 시작됐다면 그 제품은 쉬어요.",
  };
  if (removal === "keep") return {
    skipNewCleanser: true,
    title: "지금 쓰는 클렌징 제품을 유지해요.",
    detail: "화장이 잘 지워지고 피부가 편하다면 리무버를 더 사거나 세안 단계를 늘릴 필요는 없어요.",
  };
  if (removal === "point" || removal === "both") return {
    skipNewCleanser: true,
    title: "눈·입술에 남는 화장부터 지워요.",
    detail: removal === "both" ? "눈·입술용 한 가지부터 확인해요. 얼굴 클렌징까지 동시에 바꾸지 않아요."
      : "얼굴 전체에 쓰는 제품까지 바꿀 필요는 없어요.",
    product: makeupCleansingProducts.point,
  };
  if (removal === "face_friction") return {
    title: "화장솜으로 반복해서 문지르는 횟수를 줄여요.",
    detail: sensitive ? "화장솜 대신 손으로 펴 바르고 물로 헹구는 제품이면 반복해서 닦는 단계를 줄일 수 있어요. 향에 대한 반응을 알기 전에는 새 제품을 특정하지 않아요."
      : "손으로 펴 바르고 헹구는 밀크 타입을 한 가지 비교해요.",
    product: sensitive ? null : makeupCleansingProducts.milk,
  };
  if (removal === "face") return {
    title: "얼굴에 남는 베이스만 따로 지워요.",
    detail: "얼굴용 리무버 한 가지부터 확인해요. 지금 세안제가 편하면 유지하고, 눈·입술용 리무버를 따로 추가하지 않아요.",
    product: makeupCleansingProducts.water,
  };
  return null;
}
