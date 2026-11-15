export const pricePreferenceQuestion = {
  id: "pricePreference",
  question: "화장품을 추천할 때 가격도 중요해요?",
  hint: "가격이 중요하면 피부에 비슷하게 맞는 후보 중 확인된 공식 가격을 비교해요.",
  options: [
    { value: "important", label: "화장품 가격이 중요해요" },
    { value: "any", label: "가격은 상관없어요" },
  ],
};

export const readPricePreference = answers => pricePreferenceQuestion.options.find(option => option.label === answers?.pricePreference)?.value ?? null;
