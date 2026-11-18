export const pricePreferenceQuestion = {
  id: "pricePreference",
  question: "화장품 추천에 가격을 얼마나 고려할까요?",
  hint: "비싼 제품을 피하고 싶다면, 피부에 비슷하게 맞는 후보 중 공식 가격이 낮은 제품을 우선해요.",
  options: [
    { value: "important", label: "비싼 제품은 피하고 싶어요" },
    { value: "any", label: "가격보다 피부에 잘 맞는 게 중요해요" },
  ],
};

export const readPricePreference = answers => {
  const label = answers?.pricePreference;
  if (label === "화장품 가격이 중요해요") return "important";
  if (label === "가격은 상관없어요") return "any";
  return pricePreferenceQuestion.options.find(option => option.label === label)?.value ?? null;
};
