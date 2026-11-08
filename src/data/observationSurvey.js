// Separate from the historical survey: answer labels and scoring must stay versioned.
export const OBSERVATION_SURVEY_VERSION = "observed-skin-v2";
export const OBSERVATION_MEASUREMENT_VERSION = "observed-skin-axes-v2";
const q = (id, question, guidance, options) => {
  const [hint, ...detail] = guidance.split(". ");
  return { id, question, hint: `${hint}.`, helper: detail.join(". "), options: options.map(([value, label]) => ({ value, label })) };
};
export const observationQuestions = [
  q("skinChange", "최근 2주, 피부 상태가 평소와 비슷했나요?", "평소 세안·보습을 하며 관찰한 날을 떠올려요. 2주는 답변을 떠올리기 위한 기간이에요. 확인하려고 보습을 끊거나 기다릴 필요는 없어요.", [
    ["steady", "대체로 평소와 비슷했어요"], ["product", "제품을 바꾼 뒤 달라졌어요"], ["changed", "이유는 모르지만 최근 달라졌어요"], ["varies", "날마다 달라 한 가지로 말하기 어려워요"], ["unknown", "잘 모르겠어요"],
  ]),
  q("observedOil", "평소 관리 후 오후에 유분이 보이는 곳은 어디인가요?", "반짝임만으로 고르지 말고, 만졌을 때 기름기가 느껴지는 부위를 떠올려요. 선크림·메이크업 광택과 구분되지 않으면 그대로 답해요.", [
    ["none", "기름기가 거의 느껴지지 않아요"], ["tzone", "이마·코는 기름지고 볼은 그렇지 않아요"], ["whole", "이마·코·볼 모두 기름져요"], ["coating", "선크림·화장품 광택과 구분하기 어려워요"], ["unknown", "잘 모르겠어요"],
  ]),
  q("drynessArea", "피부가 당기거나 건조하게 느껴지는 곳이 있나요?", "기름기와 당김은 함께 있을 수 있어요. 모공 크기나 주름이 아니라 실제 불편한 느낌을 기준으로 골라요.", [
    ["none", "특별히 당기거나 건조하지 않아요"], ["cheeks", "주로 볼·입 주변이 당겨요"], ["whole", "얼굴 전반이 당겨요"], ["tzone", "주로 이마·코가 당겨요"], ["unknown", "잘 모르겠어요"],
  ]),
  q("drynessTiming", "그 당김은 언제까지 이어지나요?", "일부러 맨얼굴로 기다리지 말고, 평소 경험으로 답해요.", [
    ["wash", "세안 직후 잠깐이고 곧 편안해져요"], ["day", "낮에도 다시 당겨요"], ["persistent", "보습제를 발라도 당김이 계속돼요"], ["unknown", "언제까지인지 모르겠어요"],
  ]),
  q("moisturizerUse", "지금 쓰는 보습제를 바르면 어떤가요?", "여기서 보습제는 로션·크림 같은 제품이에요. 사용하지 않는다는 이유만으로 장벽이 약하다고 판단하지 않아요.", [
    ["comfortable", "바르고 나면 당김 없이 편안해요"], ["persistent", "발라도 당김이 남아요"], ["heavy", "따갑지는 않지만 무겁거나 끈적여요"], ["stings", "바르면 따갑거나 붉어져요"], ["none", "보습제를 쓰지 않아요"], ["unknown", "잘 모르겠어요"],
  ]),
  q("washResponse", "평소 세안을 마친 직후에는 어떤가요?", "쓰던 세안법을 기준으로 답해요. 답하려고 보습을 미룰 필요는 없어요. 세안 직후 당김만으로 평소 피부타입을 정하지 않아요.", [
    ["comfortable", "편안하고 따갑지 않아요"], ["tight", "당기지만 따갑거나 붉지는 않아요"], ["stings", "따갑고 붉은 느낌이 남아요"], ["unknown", "잘 모르겠어요"],
  ]),
  q("reactionPattern", "제품을 바를 때 따갑거나 붉어진 경험은 어떤가요?", "한 제품에서만 생긴 반응과 여러 제품에서 반복되는 반응을 구분해요. 이 답으로 알레르기나 민감성 질환을 확정하지 않아요.", [
    ["none", "사용하는 제품에서 이런 반응이 없어요"], ["one", "특정 제품 한 가지에서만 그랬어요"], ["repeated", "서로 다른 여러 제품에서 반복돼요"], ["untried", "제품을 거의 안 써서 판단하기 어려워요"], ["unknown", "잘 모르겠어요"],
  ]),
  q("surfaceObservation", "지금 당김 외에 눈에 보이는 변화가 있나요?", "여드름 한 개의 붉은 자국이 아니라, 주변 피부 표면을 봐요. 여러 개면 가장 불편한 상태를 골라요.", [
    ["normal", "각질·벗겨짐·넓은 붉어짐은 없어요"], ["flakes", "하얗게 일어나는 각질이 보여요"], ["irritated", "벗겨지면서 주변까지 붉고 따가워요"], ["broken", "헐거나 진물이 나는 곳이 있어요"], ["unknown", "잘 모르겠어요"],
  ]),
];
export const drynessClarification = q("drynessClarification", "보습 후 당김 답변이 달라요. 같은 날 기준으로 다시 골라주세요.", "당김이 이어지는 시점과 보습 후 느낌 답변이 서로 달라요. 서로 다른 날 이야기라면 그 답을 골라요.", [
  ["persistent", "같은 날에도 당김이 계속돼요"], ["comfortable", "같은 날에는 보습 후 편안해져요"], ["varies", "서로 다른 날이라 한 가지로 정하기 어려워요"], ["unknown", "잘 모르겠어요"],
]);
export function observationValue(answers, id) {
  const question = [...observationQuestions, drynessClarification].find(item => item.id === id);
  return question?.options.find(option => option.label === answers?.[id])?.value ?? "unknown";
}
export function needsDrynessClarification(answers) {
  return ["cheeks", "whole", "tzone"].includes(observationValue(answers, "drynessArea")) && ((observationValue(answers, "drynessTiming") === "persistent" && observationValue(answers, "moisturizerUse") === "comfortable") || (observationValue(answers, "drynessTiming") === "wash" && observationValue(answers, "moisturizerUse") === "persistent"));
}
export function getObservationQuestions(answers = {}) {
  const questions = observationQuestions.filter(item => item.id !== "drynessTiming" || ["cheeks", "whole", "tzone"].includes(observationValue(answers, "drynessArea")));
  return needsDrynessClarification(answers) ? [...questions, drynessClarification] : questions;
}
export function cleanObservationAnswers(answers) {
  const next = { ...answers };
  if (!["cheeks", "whole", "tzone"].includes(observationValue(next, "drynessArea"))) delete next.drynessTiming;
  if (!needsDrynessClarification(next)) delete next.drynessClarification;
  return next;
}
