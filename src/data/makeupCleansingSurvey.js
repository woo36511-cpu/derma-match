export const makeupUseQuestion = {
  id: "makeupUse",
  question: "평소 어떤 메이크업을 해요?",
  hint: "화장하는 날을 기준으로 골라요. 톤업 선크림은 가벼운 베이스에 포함해요.",
  options: [
    { value: "none", label: "평소 메이크업은 하지 않아요" },
    { value: "light", label: "톤업 선크림·가벼운 베이스 위주예요" },
    { value: "base", label: "쿠션·파운데이션 등 얼굴 화장 위주예요" },
    { value: "point", label: "마스카라·틴트 등 눈이나 입술 위주예요" },
    { value: "both", label: "얼굴 화장과 눈·입술 화장을 모두 해요" },
    { value: "unknown", label: "잘 모르겠거나 답하지 않을래요" },
  ],
};

const removalOptions = [
  { value: "keep", label: "지금 쓰는 제품으로 잘 지워지고 피부도 편안해요" },
  { value: "face", label: "쿠션·베이스 같은 얼굴 화장이 남아요" },
  { value: "face_friction", label: "얼굴 화장을 지우려면 화장솜으로 여러 번 문질러야 해요" },
  { value: "point", label: "눈·입술 화장만 남아요" },
  { value: "both", label: "얼굴 화장과 눈·입술 화장이 둘 다 남아요" },
  { value: "irritated", label: "지우고 나면 당기거나 따가워요" },
  { value: "unknown", label: "아직 잘 모르겠어요" },
];

const shared = ["keep", "irritated", "unknown"];
const choicesByUse = {
  light: [...shared, "face", "face_friction"],
  base: [...shared, "face", "face_friction"],
  point: [...shared, "point"],
  both: removalOptions.map(option => option.value),
};

export function getMakeupCleansingQuestions(answers = {}) {
  const use = makeupUseQuestion.options.find(option => option.label === answers.makeupUse)?.value;
  const allowed = choicesByUse[use];
  if (!allowed) return [makeupUseQuestion];
  return [makeupUseQuestion, {
    id: "makeupRemoval",
    question: "지금 쓰는 방법으로 화장이 잘 지워져요?",
    hint: "화장이 남아도 지운 뒤 당기거나 따갑다면, 먼저 당김·따가움 항목을 골라주세요.",
    options: removalOptions.filter(option => allowed.includes(option.value)),
  }];
}

export function readMakeupCleansingAnswers(answers = {}) {
  const [useQuestion, removalQuestion] = getMakeupCleansingQuestions(answers);
  return {
    use: useQuestion.options.find(option => option.label === answers.makeupUse)?.value,
    removal: removalQuestion?.options.find(option => option.label === answers.makeupRemoval)?.value,
  };
}
