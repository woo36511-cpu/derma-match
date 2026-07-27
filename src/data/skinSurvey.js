export const skinSurveyQuestions = [
  {
    id: "afterWash",
    question: "세안 후 10분 안에 피부가 어떤가요?",
    options: [
      {
        label: "많이 당긴다",
        scores: {
          dryness: 2,
          oiliness: 0,
          sensitivity: 1,
          barrier: 1,
        },
      },
      {
        label: "조금 당긴다",
        scores: {
          dryness: 1,
          oiliness: 0,
          sensitivity: 0,
          barrier: 0,
        },
      },
      {
        label: "괜찮다",
        scores: {
          dryness: 0,
          oiliness: 0,
          sensitivity: 0,
          barrier: 0,
        },
      },
      {
        label: "금방 번들거린다",
        scores: {
          dryness: 0,
          oiliness: 2,
          sensitivity: 0,
          barrier: 0,
        },
      },
    ],
  },

  {
    id: "afternoonFeel",
    question: "오후가 되면 피부가 어떤가요?",
    options: [
      {
        label: "계속 건조하다",
        scores: {
          dryness: 2,
          oiliness: 0,
          dehydrated: 0,
        },
      },
      {
        label: "T존만 번들거린다",
        scores: {
          dryness: 0,
          oiliness: 1,
          dehydrated: 1,
        },
      },
      {
        label: "전체적으로 번들거린다",
        scores: {
          dryness: 0,
          oiliness: 2,
          dehydrated: 0,
        },
      },
      {
        label: "건조한데 기름도 올라온다",
        scores: {
          dryness: 1,
          oiliness: 1,
          dehydrated: 2,
        },
      },
    ],
  },

  {
    id: "creamFeel",
    question: "크림을 바르면 어떤 느낌인가요?",
    options: [
      {
        label: "금방 다시 건조해진다",
        scores: {
          dryness: 2,
          oiliness: 0,
          barrier: 1,
        },
      },
      {
        label: "적당하다",
        scores: {
          dryness: 0,
          oiliness: 0,
          barrier: 0,
        },
      },
      {
        label: "답답하고 무겁다",
        scores: {
          dryness: 0,
          oiliness: 2,
          clogged: 1,
        },
      },
      {
        label: "트러블이 나는 느낌이다",
        scores: {
          oiliness: 1,
          clogged: 2,
          acne: 1,
        },
      },
    ],
  },

  {
    id: "mainIssue",
    question: "현재 가장 신경 쓰이는 피부 고민은?",
    options: [
      {
        label: "붉고 아픈 여드름",
        issue: "inflammatory_acne",
        scores: {
          acne: 2,
          inflammation: 2,
        },
      },
      {
        label: "좁쌀처럼 오돌토돌함",
        issue: "closed_comedones",
        scores: {
          clogged: 2,
          acne: 1,
        },
      },
      {
        label: "블랙헤드 / 피지",
        issue: "blackhead_sebum",
        scores: {
          oiliness: 2,
          clogged: 1,
        },
      },
      {
        label: "속당김",
        issue: "dehydration",
        scores: {
          dryness: 1,
          dehydrated: 2,
        },
      },
      {
        label: "붉어짐 / 따가움",
        issue: "sensitivity_redness",
        scores: {
          sensitivity: 2,
          barrier: 1,
        },
      },
      {
        label: "특별한 문제 없음",
        issue: "none",
        scores: {},
      },
    ],
  },

  {
    id: "lifestyle",
    question: "최근 해당되는 생활습관이 있나요?",
    type: "multi",
    options: [
      {
        label: "수면 부족",
        lifestyle: "sleep_lack",
      },
      {
        label: "스트레스 많음",
        lifestyle: "stress",
      },
      {
        label: "단 음식 / 밀가루 자주 먹음",
        lifestyle: "high_glycemic_food",
      },
      {
        label: "유제품 자주 먹음",
        lifestyle: "dairy",
      },
      {
        label: "채소 섭취 부족",
        lifestyle: "low_vegetable",
      },
      {
        label: "변비 / 복부팽만 있음",
        lifestyle: "gut_discomfort",
      },
      {
        label: "운동 후 세안이 늦음",
        lifestyle: "sweat_delay",
      },
      {
        label: "해당 없음",
        lifestyle: "none",
      },
    ],
  },
];