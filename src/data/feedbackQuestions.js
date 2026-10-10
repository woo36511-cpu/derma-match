export const feedbackQuestions = [
  {
    id: "dry",
    q: "2주 사용 후 피부 당김은 어떤가요?",
    options: [
      { label: "여전히 많이 당김", value: -2 },
      { label: "조금 당김", value: -1 },
      { label: "거의 당기지 않음", value: 0 },
      { label: "오히려 촉촉함이 오래 감", value: 0 },
    ],
  },
  {
    id: "oil",
    q: "시간이 지나면서 번들거림은 어떤가요?",
    options: [
      { label: "거의 없음", value: 0 },
      { label: "적당함", value: 0 },
      { label: "조금 많이 올라옴", value: 1 },
      { label: "많이 번들거림", value: 2 },
    ],
  },
  {
    id: "feel",
    q: "제품을 바른 직후 느낌은 어땠나요?",
    options: [
      { label: "건조하거나 부족함", value: -2 },
      { label: "편안함", value: 0 },
      { label: "조금 무거움", value: 1 },
      { label: "답답하고 부담스러움", value: 2 },
    ],
  },
  {
    id: "trouble",
    q: "사용 후 붉은 트러블 변화는 어땠나요?",
    options: [
      { label: "없음", value: 0 },
      { label: "조금 생김", value: 1 },
      { label: "많이 생김", value: 2 },
      { label: "원래 있던 트러블이 더 심해짐", value: 2 },
    ],
  },
  {
    id: "irritation",
    q: "따가움이나 붉어짐은 있었나요?",
    options: [
      { label: "거의 없음", value: 0 },
      { label: "가끔 따가움", value: 0 },
      { label: "자주 따갑거나 붉어짐", value: 0 },
      { label: "바르면 바로 불편함", value: 0 },
    ],
  },
  {
    id: "clogged",
    q: "좁쌀이나 오돌토돌한 느낌은 어땠나요?",
    options: [
      { label: "거의 없음", value: 0 },
      { label: "조금 늘어난 느낌", value: 1 },
      { label: "확실히 늘어남", value: 2 },
      { label: "크림이나 오일 바르면 더 심한 느낌", value: 2 },
    ],
  },
  {
    id: "satisfaction",
    q: "이 루틴을 계속 쓰고 싶은 느낌인가요?",
    options: [
      { label: "계속 써보고 싶음", value: 0 },
      { label: "나쁘진 않은데 애매함", value: 0 },
      { label: "제품이 나랑 안 맞는 느낌", value: 0 },
      { label: "잘 모르겠음", value: 0 },
    ],
  },
  {
    id: "routineUsage",
    q: "추천받은 루틴을 실제로 어느 정도 사용했나요?",
    options: [
      { label: "대부분의 제품을 꾸준히 사용함", value: "consistent" },
      { label: "대부분 사용했지만 빠뜨린 날이 있음", value: "mostly" },
      { label: "일부 제품만 사용함", value: "partial" },
      { label: "거의 사용하지 못함", value: "rare" },
    ],
  },
  {
    id: "usageDuration",
    q: "이번 루틴을 실제로 사용한 기간은 어느 정도인가요?",
    options: [
      { label: "7일 미만", value: "under_7" },
      { label: "7~13일", value: "7_13" },
      { label: "14~27일", value: "14_27" },
      { label: "28일 이상", value: "28_plus" },
    ],
  },
  {
    id: "otherSkincareChange",
    q: "루틴을 사용하는 동안 다른 화장품도 새로 추가하거나 바꿨나요?",
    options: [
      { label: "바꾸지 않음", value: "none" },
      { label: "1개 정도 바꿈", value: "one" },
      { label: "여러 제품을 바꿈", value: "multiple" },
    ],
  },
  {
    id: "sleepStressChange",
    q: "최근 수면이나 스트레스 상태가 평소와 많이 달랐나요?",
    options: [
      { label: "평소와 비슷함", value: "stable" },
      { label: "조금 달라짐", value: "mild" },
      { label: "수면 부족이나 스트레스가 크게 늘어남", value: "major" },
    ],
  },
  {
    id: "dietChange",
    q: "최근 식사 패턴이나 음주 등 식생활이 평소와 달랐나요?",
    options: [
      { label: "평소와 비슷함", value: "stable" },
      { label: "조금 달라짐", value: "mild" },
      { label: "크게 달라짐", value: "major" },
    ],
  },
  {
    id: "medicationSupplementChange",
    q: "최근 새로 시작하거나 중단한 약 또는 영양제가 있나요?",
    options: [
      { label: "없음", value: "none" },
      { label: "있음", value: "changed" },
    ],
  },
  {
    id: "environmentChange",
    q: "여행, 계절 변화, 운동·땀 노출처럼 환경 변화가 컸나요?",
    options: [
      { label: "큰 변화 없음", value: "stable" },
      { label: "변화가 있었음", value: "changed" },
    ],
  },
];
