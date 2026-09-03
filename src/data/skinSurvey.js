export const skinSurveyQuestions = [
  {
    id: "afterWash",
    question: "세안하고 10분 정도 지나면 얼굴이 어떤가요?",
    options: [
      {
        label: "많이 당기고 건조하다",
        scores: { dryness: 3, oiliness: 0, sensitivity: 1, barrier: 1 },
      },
      {
        label: "조금 당기는 느낌이 있다",
        scores: { dryness: 2, oiliness: 0, sensitivity: 0, barrier: 0 },
      },
      {
        label: "별로 불편하지 않다",
        scores: { dryness: 0, oiliness: 0, sensitivity: 0, barrier: 0 },
      },
      {
        label: "금방 번들거리거나 기름진다",
        scores: { dryness: 0, oiliness: 3, sensitivity: 0, barrier: 0 },
      },
      {
        label: "잘 모르겠어요",
        scores: {},
      },
    ],
  },
  {
    id: "afternoonFeel",
    question: "오후가 되면 얼굴 상태가 보통 어떤가요?",
    options: [
      {
        label: "계속 건조하고 당긴다",
        scores: { dryness: 3, oiliness: 0, dehydrated: 0 },
      },
      {
        label: "코나 이마만 번들거린다",
        scores: { dryness: 0, oiliness: 2, dehydrated: 1 },
      },
      {
        label: "얼굴 전체가 번들거린다",
        scores: { dryness: 0, oiliness: 3, dehydrated: 0 },
      },
      {
        label: "기름은 올라오는데 피부는 편하지 않고 당긴다",
        scores: { dryness: 2, oiliness: 2, dehydrated: 3 },
      },
      {
        label: "잘 모르겠어요",
        scores: {},
      },
    ],
  },
  {
    id: "areaDifference",
    question: "얼굴 부위마다 차이가 느껴지나요?",
    options: [
      {
        label: "볼은 건조한데 코나 이마는 번들거린다",
        scores: { dryness: 2, oiliness: 2, dehydrated: 2 },
      },
      {
        label: "얼굴 전체가 건조한 편이다",
        scores: { dryness: 3, oiliness: 0, dehydrated: 1 },
      },
      {
        label: "얼굴 전체가 기름진 편이다",
        scores: { dryness: 0, oiliness: 3, dehydrated: 0 },
      },
      {
        label: "부위별 차이는 크게 모르겠다",
        scores: { dryness: 0, oiliness: 0, dehydrated: 0 },
      },
      {
        label: "잘 모르겠어요",
        scores: {},
      },
    ],
  },
  {
    id: "creamFeel",
    question: "크림이나 로션을 바르면 어떤 느낌인가요?",
    options: [
      {
        label: "발라도 금방 다시 건조해진다",
        scores: { dryness: 3, oiliness: 0, barrier: 2 },
      },
      {
        label: "적당히 편안하다",
        scores: { dryness: 0, oiliness: 0, barrier: 0 },
      },
      {
        label: "답답하거나 무겁게 느껴진다",
        scores: { dryness: 0, oiliness: 3, clogged: 1 },
      },
      {
        label: "바르면 좁쌀이나 트러블이 올라오는 느낌이다",
        scores: { dryness: 0, oiliness: 2, clogged: 3, acne: 1 },
      },
      {
        label: "잘 모르겠어요",
        scores: {},
      },
    ],
  },
  {
    id: "innerDryness",
    question: "기름은 올라오는데 이상하게 피부가 당기거나 불편한 느낌이 있나요?",
    options: [
      {
        label: "자주 그렇다",
        scores: { dryness: 1, oiliness: 2, dehydrated: 3 },
      },
      {
        label: "가끔 그렇다",
        scores: { dryness: 1, oiliness: 1, dehydrated: 2 },
      },
      {
        label: "거의 없다",
        scores: { dryness: 0, oiliness: 0, dehydrated: 0 },
      },
      {
        label: "기름보다는 그냥 건조한 느낌이 더 크다",
        scores: { dryness: 3, oiliness: 0, dehydrated: 1 },
      },
      {
        label: "잘 모르겠어요",
        scores: {},
      },
    ],
  },
  {
    id: "sensitivity",
    question: "세안하거나 화장품을 바른 뒤 따갑거나 붉어질 때가 있나요?",
    options: [
      {
        label: "자주 따갑고 붉어진다",
        scores: { sensitivity: 3, barrier: 2 },
      },
      {
        label: "가끔 컨디션이 안 좋을 때 그렇다",
        scores: { sensitivity: 2, barrier: 1 },
      },
      {
        label: "새 제품을 쓰면 가끔 그렇다",
        scores: { sensitivity: 1, barrier: 1 },
      },
      {
        label: "거의 없다",
        scores: { sensitivity: 0, barrier: 0 },
      },
      {
        label: "잘 모르겠어요",
        scores: {},
      },
    ],
  },
  {
    id: "mainIssue",
    question: "지금 가장 신경 쓰이는 피부 고민은 무엇인가요?",
    options: [
      {
        label: "붉고 아픈 여드름",
        issue: "inflammatory_acne",
        scores: { acne: 3, inflammation: 3 },
      },
      {
        label: "좁쌀처럼 오돌토돌한 것",
        issue: "closed_comedones",
        scores: { clogged: 3, acne: 1 },
      },
      {
        label: "코 주변 블랙헤드나 피지",
        issue: "blackhead_sebum",
        scores: { oiliness: 3, clogged: 2 },
      },
      {
        label: "피부가 건조하고 당기는 것",
        issue: "dehydration",
        scores: { dryness: 2, dehydrated: 3 },
      },
      {
        label: "붉어짐이나 따가움",
        issue: "sensitivity_redness",
        scores: { sensitivity: 3, barrier: 2 },
      },
      {
        label: "특별한 고민은 없다",
        issue: "none",
        scores: {},
      },
      {
        label: "잘 모르겠어요",
        issue: "unknown",
        scores: {},
      },
    ],
  },
  {
    id: "poreSebum",
    question: "코 주변이나 T존에 번들거림, 블랙헤드, 하얀 피지가 신경 쓰이나요?",
    options: [
      {
        label: "많이 신경 쓰인다",
        scores: { oiliness: 3, clogged: 2 },
      },
      {
        label: "조금 신경 쓰인다",
        scores: { oiliness: 2, clogged: 1, dehydrated: 1 },
      },
      {
        label: "거의 신경 쓰이지 않는다",
        scores: { oiliness: 0, clogged: 0 },
      },
      {
        label: "피지보다 건조함이 더 신경 쓰인다",
        scores: { dryness: 2, oiliness: 0 },
      },
      {
        label: "잘 모르겠어요",
        scores: {},
      },
    ],
  },
  {
    id: "routineLevel",
    question: "지금 스킨케어는 보통 어느 정도 하고 있나요?",
    options: [
      {
        label: "거의 안 한다",
        routine: "beginner",
        scores: { barrier: 1 },
      },
      {
        label: "토너나 크림 정도만 쓴다",
        routine: "basic",
        scores: {},
      },
      {
        label: "토너, 세럼, 크림 정도는 쓴다",
        routine: "normal",
        scores: {},
      },
      {
        label: "각질제거제, BHA, 레티놀 같은 기능성도 쓴다",
        routine: "active",
        scores: { sensitivity: 1, barrier: 1 },
      },
      {
        label: "잘 모르겠어요",
        routine: "unknown",
        scores: {},
      },
    ],
  },
  {
    id: "lifestyle",
    question: "최근에 해당되는 생활습관이 있나요? 여러 개 선택해도 돼요.",
    type: "multi",
    options: [
      {
        label: "잠을 부족하게 잔다",
        lifestyle: "sleep_lack",
        scores: { inflammation: 1 },
      },
      {
        label: "스트레스를 많이 받는다",
        lifestyle: "stress",
        scores: { inflammation: 1, acne: 1 },
      },
      {
        label: "단 음식이나 밀가루 음식을 자주 먹는다",
        lifestyle: "high_glycemic_food",
        scores: { acne: 1, inflammation: 1 },
      },
      {
        label: "우유, 치즈, 요거트 같은 유제품을 자주 먹는다",
        lifestyle: "dairy",
        scores: { acne: 1 },
      },
      {
        label: "채소나 과일을 적게 먹는다",
        lifestyle: "low_vegetable",
        scores: {},
      },
      {
        label: "운동하거나 땀 흘린 뒤 세안을 늦게 한다",
        lifestyle: "sweat_delay",
        scores: { clogged: 1, acne: 1 },
      },
      {
        label: "물을 적게 마시는 편이다",
        lifestyle: "low_water",
        scores: { dehydrated: 1 },
      },
      {
        label: "딱히 해당되는 게 없다",
        lifestyle: "none",
        scores: {},
      },
      {
        label: "잘 모르겠어요",
        lifestyle: "unknown",
        scores: {},
      },
    ],
  },
];