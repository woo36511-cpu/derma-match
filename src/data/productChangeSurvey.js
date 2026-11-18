export const changedProductOptions = [
  { value: "cleanser", label: "세안제·클렌징" },
  { value: "toner", label: "토너·패드·미스트" },
  { value: "serum", label: "세럼·앰플·에센스" },
  { value: "moisturizer", label: "로션·크림·올인원 보습제" },
  { value: "sunscreen", label: "선크림" },
  { value: "multiple", label: "여러 제품을 바꿨어요" },
  { value: "unknown", label: "정확히 기억나지 않아요" },
];

export const productChangeQuestions = [
  { id: "changedProduct", question: "어떤 제품을 새로 쓰거나 바꿨어요?", supplemental: true,
    hint: "제품명을 알면 검색해서 골라주세요. 모르거나 여러 개를 한꺼번에 바꿨다면 아래에서 골라도 돼요.", options: changedProductOptions },
  { id: "changedReaction", question: "제품을 바꾼 뒤 어떤 변화가 있었어요?", type: "multi", supplemental: true,
    options: [
      ["dry", "당기거나 건조해졌어요"], ["oil", "더 번들거려요"], ["red", "붉어졌어요"], ["sting", "따갑거나 화끈거려요"],
      ["bumps", "좁쌀·뾰루지가 생기거나 늘었어요"], ["better", "오히려 편해졌어요"], ["unknown", "어떻게 달라졌는지 잘 모르겠어요"],
    ].map(([value, label]) => ({ value, label })) },
];
