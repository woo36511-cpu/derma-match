export const simpleConcernOptions = [
  { value: "none", label: "기본 화장품만 추천받을래요", detail: "추가 피부 고민 없이 피부타입에 맞는 루틴만 확인해요." },
  { value: "acne", label: "여드름·좁쌀·블랙헤드가 있어요", detail: "사진과 모양 설명을 보고 비슷한 유형을 골라요." },
  { value: "folliculitis", label: "모낭염 같은 돌기가 신경 쓰여요", detail: "여드름과 비슷한 돌기의 공통 관리와 원인별 약품을 살펴봐요." },
  { value: "unknown", label: "어떤 트러블인지 모르겠어요", detail: "대표적인 모습과 설명을 비교해봐요." },
];
export const acneShapes = [
  { value: "closed", label: "살색·하얀 좁쌀", detail: "붉거나 아프지 않고 작은 알갱이처럼 막혀 있어요.", photoLink: "https://www.aad.org/public/diseases/acne/really-acne/symptoms#whiteheads" },
  { value: "blackhead", label: "블랙헤드", detail: "모공에 검게 막힌 점이 보여요.", photoLink: "https://www.aad.org/public/diseases/acne/really-acne/symptoms#blackheads" },
  { value: "red", label: "고름 없는 작은 붉은 뾰루지", detail: "피부 표면에 작게 올라왔고 가운데 고름은 안 보여요.", photoLink: "https://www.aad.org/public/diseases/acne/really-acne/symptoms" },
  { value: "pus", label: "고름이 보이는 작은 뾰루지", detail: "가운데에 하얗거나 노란 고름이 보여요.", photoLink: "https://www.aad.org/public/diseases/acne/really-acne/symptoms" },
  { value: "deep", label: "피부 밑의 단단한 덩이", detail: "표면의 작은 뾰루지보다 깊게 만져지거나 아파요.", photoLink: "https://www.aad.org/public/diseases/acne/really-acne/symptoms" },
  { value: "unknown", label: "사진을 봐도 잘 모르겠어요", detail: "여드름과 모낭염 등 다른 양상을 비교해요." },
];
const option = (value, label) => ({ value, label });
export function getSimpleCareQuestions(answers = {}) {
  const qs = [{ id: "concern", q: "기본 루틴 외에 추가로 관리할 고민이 있나요?", options: simpleConcernOptions }];
  if (!answers.concern || answers.concern === "none") return qs;
  if (answers.concern === "acne") qs.push({ id: "shape", q: "어떤 모습과 가장 비슷한가요?", visual: true, options: acneShapes });
  qs.push({ id: "areaState", q: "지금 그 부위는 어떤 상태인가요?", options: [
    option("comfortable", "작은 부위에만 있고, 심한 통증·따가움은 없어요"),
    option("dry", "조금 건조하지만 따갑거나 벗겨지지는 않아요"),
    option("irritated", "평소 제품도 따갑거나 붉고 벗겨져요"),
    option("concerning", "붉은기가 빠르게 퍼지거나 붓기·통증이 심해요"),
    option("unknown", "잘 모르겠어요"),
  ] });
  if (answers.areaState === "concerning") return qs;
  qs.push({ id: "medicine", q: "그 부위에 이미 바르는 약이나 기능성 제품이 있나요?", options: [
    option("none", "없어요. 순한 세안제·보습제 정도만 써요"),
    option("patima", "파티마겔 같은 벤조일퍼옥사이드 제품"),
    option("acnon", "애크논크림"),
    option("salicylic", "클리어틴·AHA·BHA 같은 각질 제품"),
    option("prescribed", "처방받은 약"),
    option("other", "레티놀이나 그 밖의 기능성 제품"),
    option("unknown", "무슨 제품인지 잘 모르겠어요"),
  ] });
  if (answers.medicine && !["none", "unknown"].includes(answers.medicine)) qs.push(
    { id: "duration", q: "그 제품을 사용한 지 얼마나 됐나요?", options: [
      option("few_days", "1~3일"), option("few_weeks", "4일~4주 미만"), option("long", "4주 이상"), option("unknown", "잘 모르겠어요"),
    ] },
    { id: "response", q: "사용한 뒤 피부는 어떻게 달라졌나요?", options: [
      option("better", "조금 나아지고 있어요"), option("same", "크게 달라지지 않았어요"),
      option("irritated", "더 따갑거나 붉고 벗겨져요"), option("worse", "돌기나 통증이 늘었어요"), option("unknown", "잘 모르겠어요"),
    ] },
  );
  return qs;
}
export function cleanSimpleCareAnswers(answers) {
  return Object.fromEntries(getSimpleCareQuestions(answers)
    .filter(q => q.options.some(option => option.value === answers[q.id])).map(q => [q.id, answers[q.id]]));
}
export function isSimpleCareComplete(answers) {
  return getSimpleCareQuestions(answers).every(q => q.options.some(option => option.value === answers[q.id]));
}
