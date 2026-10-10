export const skinConcernOptions = [
  {
    id: "inflammatory_acne",
    label: "염증성 여드름",
    desc: "붉고 아프거나 고름이 있는 트러블이 반복돼요.",
  },
  {
    id: "closed_comedones",
    label: "좁쌀 / 오돌토돌함",
    desc: "작은 좁쌀이나 피부결이 오돌토돌하게 느껴져요.",
  },
  {
    id: "blackhead_sebum",
    label: "블랙헤드 / 피지",
    desc: "코나 T존의 블랙헤드, 피지, 번들거림이 신경 쓰여요.",
  },
  {
    id: "dehydration",
    label: "속당김 / 건조함",
    desc: "겉은 괜찮거나 번들거리는데 피부 속이 당기는 느낌이 있어요.",
  },
  {
    id: "sensitivity_redness",
    label: "민감 / 붉어짐",
    desc: "화장품을 바르면 따갑거나 쉽게 붉어져요.",
  },
  {
    id: "oiliness",
    label: "번들거림",
    desc: "시간이 지나면 얼굴에 유분이 많이 올라와요.",
  },
  {
    id: "none",
    label: "특별한 고민 없음",
    desc: "현재 큰 피부 문제 없이 기본 루틴을 찾고 싶어요.",
  },
];

export const inflammatoryAcneQuestions = [
  {
    id: "area",
    q: "염증성 여드름이 주로 어디에 생기나요?",
    options: [
      { label: "이마", value: "forehead" },
      { label: "볼", value: "cheek" },
      { label: "코 주변", value: "nose" },
      { label: "턱 / 턱선", value: "chin_jaw" },
      { label: "여러 부위", value: "multiple" },
    ],
  },
  {
    id: "form",
    q: "트러블은 어떤 형태에 가장 가까운가요?",
    options: [
      { label: "붉게 올라오기만 함", value: "red" },
      { label: "노란 고름이 보임", value: "pustule" },
      { label: "속에서 딱딱하고 크게 만져짐", value: "nodule" },
      { label: "여러 개가 몰려서 올라옴", value: "cluster" },
    ],
  },
  {
    id: "pain",
    q: "트러블 부위에 통증이 있나요?",
    showIf: (answers) =>
      ["pustule", "nodule", "cluster"].includes(answers.form?.value),
    options: [
      { label: "거의 아프지 않음", value: "none" },
      { label: "누르면 조금 아픔", value: "mild" },
      { label: "가만히 있어도 아픔", value: "strong" },
    ],
  },
  {
    id: "recurring",
    q: "이런 트러블이 얼마나 자주 반복되나요?",
    options: [
      { label: "가끔 한두 개 생김", value: "sometimes" },
      { label: "같은 부위에 반복됨", value: "recurring" },
      { label: "거의 계속 새로운 트러블이 생김", value: "continuous" },
    ],
  },
  {
    id: "recentProduct",
    q: "최근 2~4주 안에 새로 사용한 화장품이 있나요?",
    options: [
      { label: "없음", value: "none" },
      { label: "클렌저를 바꿈", value: "cleanser" },
      { label: "토너 / 세럼을 바꿈", value: "serum" },
      { label: "크림을 바꿈", value: "cream" },
      { label: "여러 제품을 한꺼번에 바꿈", value: "multiple" },
    ],
  },
  {
    id: "shaving",
    q: "트러블이 나는 턱이나 턱선을 면도하나요?",
    showIf: (answers) => answers.area?.value === "chin_jaw",
    options: [
      { label: "거의 매일 면도함", value: "daily" },
      { label: "가끔 면도함", value: "sometimes" },
      { label: "면도하지 않음", value: "none" },
    ],
  },
  {
    id: "touching",
    q: "트러블 부위를 손으로 만지거나 짜는 편인가요?",
    options: [
      { label: "거의 안 만짐", value: "rare" },
      { label: "무의식적으로 자주 만짐", value: "often" },
      { label: "고름이 보이면 짜는 편", value: "squeeze" },
    ],
  },
];

export function getVisibleInflammatoryAcneQuestions(answers) {
  return inflammatoryAcneQuestions.filter((question) => {
    if (!question.showIf) return true;

    return question.showIf(answers);
  });
}

export const closedComedoneQuestions = [
  {
    id: "area",
    q: "좁쌀이나 오돌토돌함이 주로 어디에 생기나요?",
    options: [
      { label: "이마", value: "forehead" },
      { label: "볼", value: "cheek" },
      { label: "턱 / 턱선", value: "chin_jaw" },
      { label: "코 주변", value: "nose" },
      { label: "여러 부위", value: "multiple" },
    ],
  },

  {
    id: "appearance",
    q: "가장 가까운 형태는 어떤가요?",
    options: [
      { label: "피부색 작은 돌기가 만져짐", value: "skin_colored" },
      { label: "하얗게 작은 알갱이처럼 보임", value: "white_bumps" },
      { label: "작은 피지가 촘촘하게 보임", value: "sebum_bumps" },
      { label: "붉은 트러블도 같이 섞여 있음", value: "mixed_inflammation" },
    ],
  },

  {
    id: "inflammation",
    q: "좁쌀 부위가 붉거나 아프기도 하나요?",
    options: [
      { label: "거의 붉지 않고 아프지도 않음", value: "none" },
      { label: "가끔 붉게 변함", value: "sometimes_red" },
      { label: "자주 붉어지고 누르면 아픔", value: "painful" },
    ],
  },

  {
    id: "duration",
    q: "이 상태가 얼마나 지속되고 있나요?",
    options: [
      { label: "최근 1~2주 사이 생김", value: "recent" },
      { label: "2~6주 정도", value: "weeks" },
      { label: "6주 이상 계속됨", value: "long" },
      { label: "몇 달째 반복됨", value: "chronic" },
    ],
  },

  {
    id: "recentProduct",
    q: "좁쌀이 늘기 전 새로 추가한 제품이 있나요?",
    options: [
      { label: "특별히 없음", value: "none" },
      { label: "크림 / 보습제를 바꿈", value: "cream" },
      { label: "선크림을 바꿈", value: "sunscreen" },
      { label: "오일류 제품을 추가함", value: "oil" },
      { label: "여러 제품을 한꺼번에 바꿈", value: "multiple" },
    ],
  },

  {
    id: "exfoliation",
    q: "현재 BHA나 각질 관리 제품을 사용하고 있나요?",
    options: [
      { label: "사용하지 않음", value: "none" },
      { label: "일주일에 1~2회", value: "low" },
      { label: "일주일에 3회 이상", value: "frequent" },
      { label: "여러 각질 관리 제품을 같이 사용함", value: "multiple" },
    ],
  },

  {
    id: "touching",
    q: "좁쌀을 손이나 도구로 짜는 편인가요?",
    options: [
      { label: "거의 건드리지 않음", value: "rare" },
      { label: "손으로 자주 짬", value: "squeeze" },
      { label: "압출기나 도구를 사용함", value: "tool" },
    ],
  },
];

export function getVisibleClosedComedoneQuestions() {
  return closedComedoneQuestions;
}

export const blackheadSebumQuestions = [
  {
    id: "area",
    q: "블랙헤드나 피지가 주로 어디에 보이나요?",
    options: [
      { label: "코", value: "nose" },
      { label: "코 주변 / 나비존", value: "nose_cheek" },
      { label: "이마 / T존", value: "tzone" },
      { label: "턱", value: "chin" },
      { label: "여러 부위", value: "multiple" },
    ],
  },

  {
    id: "appearance",
    q: "가장 신경 쓰이는 모습은 어떤가요?",
    options: [
      { label: "검은 점처럼 막힌 피지가 보임", value: "black_plug" },
      { label: "회색·노란 피지가 촘촘하게 보임", value: "sebaceous_filament" },
      { label: "하얀 피지가 올라옴", value: "white_sebum" },
      { label: "모공이 넓고 피지가 많이 차 보임", value: "pore_sebum" },
    ],
  },

  {
    id: "returnSpeed",
    q: "피지를 제거하거나 세안한 뒤 얼마나 빨리 다시 보여요?",
    options: [
      { label: "며칠 동안은 크게 안 보임", value: "slow" },
      { label: "1~2일이면 다시 보임", value: "fast" },
      { label: "세안 직후에도 금방 다시 보여요", value: "very_fast" },
      { label: "제거해본 적 없어서 모르겠어요", value: "unknown" },
    ],
  },

  {
    id: "oiliness",
    q: "시간이 지나면 해당 부위의 유분은 어떤가요?",
    options: [
      { label: "유분이 거의 없음", value: "low" },
      { label: "적당히 올라옴", value: "normal" },
      { label: "번들거림이 많은 편", value: "high" },
      { label: "금방 기름져짐", value: "very_high" },
    ],
  },

  {
    id: "afterWash",
    q: "세안 직후 피부 느낌은 어떤가요?",
    options: [
      { label: "편안함", value: "comfortable" },
      { label: "조금 당김", value: "mild_tight" },
      { label: "많이 당기거나 건조함", value: "tight" },
    ],
  },

  {
    id: "cleansingOil",
    q: "클렌징오일이나 클렌징밤을 사용하나요?",
    options: [
      { label: "사용하지 않음", value: "none" },
      { label: "사용하고 유화도 충분히 함", value: "proper" },
      { label: "사용하지만 유화는 잘 모르겠음", value: "unsure" },
      { label: "오래 마사지하는 편", value: "long_massage" },
    ],
  },

  {
    id: "exfoliation",
    q: "현재 BHA나 각질 관리 제품을 얼마나 사용하나요?",
    options: [
      { label: "사용하지 않음", value: "none" },
      { label: "일주일에 1~2회", value: "low" },
      { label: "일주일에 3회 이상", value: "frequent" },
      { label: "여러 각질 제품을 같이 사용함", value: "multiple" },
    ],
  },

  {
    id: "squeezing",
    q: "블랙헤드나 피지를 직접 짜거나 압출하나요?",
    options: [
      { label: "거의 안 건드림", value: "rare" },
      { label: "손으로 가끔 짬", value: "sometimes" },
      { label: "자주 짜는 편", value: "often" },
      { label: "압출기나 도구를 사용함", value: "tool" },
    ],
  },

  {
    id: "inflammation",
    q: "해당 부위에 붉거나 아픈 트러블도 같이 생기나요?",
    options: [
      { label: "거의 없음", value: "none" },
      { label: "가끔 붉은 트러블이 생김", value: "sometimes" },
      { label: "자주 붉고 아픈 트러블이 생김", value: "frequent" },
    ],
  },
];

export function getVisibleBlackheadSebumQuestions() {
  return blackheadSebumQuestions;
}

export const dehydrationQuestions = [
  {
    id: "afterWash",
    q: "세안 직후 피부 당김은 어느 정도인가요?",
    options: [
      { label: "거의 당기지 않음", value: "none" },
      { label: "조금 당김", value: "mild" },
      { label: "꽤 당김", value: "strong" },
      { label: "바로 보습하지 않으면 많이 불편함", value: "very_strong" },
    ],
  },

  {
    id: "daytimeTightness",
    q: "세안 후 시간이 지나도 속당김이 느껴지나요?",
    options: [
      { label: "거의 없음", value: "none" },
      { label: "가끔 느껴짐", value: "sometimes" },
      { label: "자주 느껴짐", value: "often" },
      { label: "하루 종일 계속 당기는 느낌", value: "continuous" },
    ],
  },

  {
    id: "oiliness",
    q: "속은 당기는데 겉에는 유분도 올라오나요?",
    options: [
      { label: "유분도 거의 없음", value: "low" },
      { label: "조금 올라옴", value: "normal" },
      { label: "오후가 되면 꽤 번들거림", value: "high" },
      { label: "금방 번들거리는데 속은 당김", value: "very_high" },
    ],
  },

  {
    id: "moisturizerResponse",
    q: "보습제를 바르면 당김이 얼마나 개선되나요?",
    options: [
      { label: "바르면 오래 편안함", value: "good" },
      { label: "처음엔 괜찮지만 금방 다시 당김", value: "short" },
      { label: "여러 번 발라도 계속 부족함", value: "poor" },
      { label: "보습제를 바르면 오히려 답답함", value: "heavy" },
    ],
  },

  {
    id: "flaking",
    q: "각질이나 거친 피부결도 같이 느껴지나요?",
    options: [
      { label: "거의 없음", value: "none" },
      { label: "조금 거칠게 느껴짐", value: "mild" },
      { label: "하얗게 각질이 일어나기도 함", value: "visible" },
      { label: "갈라지거나 심하게 벗겨지는 느낌", value: "severe" },
    ],
  },

  {
    id: "irritation",
    q: "화장품을 바를 때 따갑거나 붉어지기도 하나요?",
    options: [
      { label: "거의 없음", value: "none" },
      { label: "가끔 따가움", value: "mild" },
      { label: "자주 따갑거나 붉어짐", value: "frequent" },
      { label: "화끈거리거나 매우 불편함", value: "strong" },
    ],
  },

  {
    id: "cleansing",
    q: "평소 세안은 어떻게 하는 편인가요?",
    options: [
      { label: "순한 세안제로 짧게 세안", value: "gentle" },
      { label: "뽀득한 느낌이 날 때까지 세안", value: "strong" },
      { label: "하루 3번 이상 세안하기도 함", value: "frequent" },
      { label: "스크럽이나 강한 세정도 같이 함", value: "harsh" },
    ],
  },

  {
    id: "waterTemp",
    q: "세안할 때 물 온도는 어떤 편인가요?",
    options: [
      { label: "미지근한 물", value: "lukewarm" },
      { label: "조금 따뜻한 물", value: "warm" },
      { label: "뜨거운 물을 자주 사용함", value: "hot" },
    ],
  },
];

export function getVisibleDehydrationQuestions() {
  return dehydrationQuestions;
}

export const sensitivityRednessQuestions = [
  {
    id: "trigger",
    q: "붉어짐이나 따가움은 주로 언제 생기나요?",
    options: [
      { label: "새 화장품을 쓴 뒤 생김", value: "new_product" },
      { label: "세안 후 잘 생김", value: "after_wash" },
      { label: "기능성 제품을 바른 뒤 생김", value: "active_product" },
      { label: "특정 계기 없이 자주 생김", value: "random" },
    ],
  },

  {
    id: "sensation",
    q: "가장 가까운 느낌은 어떤가요?",
    options: [
      { label: "붉어지기만 함", value: "redness" },
      { label: "따끔거리거나 따가움", value: "stinging" },
      { label: "화끈거리거나 열감이 남", value: "burning" },
      { label: "가렵기도 함", value: "itching" },
    ],
  },

  {
    id: "duration",
    q: "붉어짐이나 불편감은 얼마나 지속되나요?",
    options: [
      { label: "몇 분 안에 금방 가라앉음", value: "minutes" },
      { label: "30분~몇 시간 정도", value: "hours" },
      { label: "반나절 이상 지속됨", value: "half_day" },
      { label: "며칠씩 계속되거나 반복됨", value: "days" },
    ],
  },

  {
    id: "skinDamage",
    q: "피부 표면에도 변화가 있나요?",
    options: [
      { label: "붉은 것 외에는 거의 없음", value: "none" },
      { label: "건조하고 거칠어짐", value: "dry" },
      { label: "각질이 일어나거나 갈라짐", value: "flaking" },
      { label: "물집·진물·벗겨진 부위가 있음", value: "blister_oozing" },
    ],
  },

  {
    id: "swelling",
    q: "붓기가 같이 나타나나요?",
    options: [
      { label: "붓기는 없음", value: "none" },
      { label: "피부가 약간 부어 보임", value: "mild" },
      { label: "눈 주변이나 입술까지 붓기도 함", value: "eyes_lips" },
    ],
  },

  {
    id: "breathing",
    q: "붓기와 함께 숨쉬기나 삼키기가 불편했던 적이 있나요?",
    showIf: (answers) => answers.swelling?.value === "eyes_lips",
    options: [
      { label: "없음", value: "none" },
      { label: "숨쉬기 또는 삼키기가 불편했던 적 있음", value: "difficulty" },
    ],
  },

  {
    id: "recentProduct",
    q: "최근 2~4주 안에 새로 추가한 제품이 있나요?",
    options: [
      { label: "없음", value: "none" },
      { label: "클렌저", value: "cleanser" },
      { label: "토너 / 세럼 / 크림", value: "skincare" },
      { label: "선크림", value: "sunscreen" },
      { label: "여러 제품을 한꺼번에 바꿈", value: "multiple" },
    ],
  },

  {
    id: "actives",
    q: "현재 자극 가능성이 있는 기능성 제품을 사용하나요?",
    options: [
      { label: "사용하지 않음", value: "none" },
      { label: "BHA / AHA 각질 관리", value: "acid" },
      { label: "레티놀 / 레티노이드 계열", value: "retinoid" },
      { label: "여드름 기능성 제품", value: "acne_active" },
      { label: "여러 기능성 제품을 같이 사용함", value: "multiple" },
    ],
  },

  {
    id: "moisturizerSting",
    q: "평소 쓰던 순한 보습제를 발라도 따갑나요?",
    options: [
      { label: "보습제는 편안함", value: "none" },
      { label: "가끔 따가움", value: "sometimes" },
      { label: "보습제도 자주 따가움", value: "frequent" },
    ],
  },
];

export function getVisibleSensitivityRednessQuestions(answers) {
  return sensitivityRednessQuestions.filter((question) => {
    if (!question.showIf) return true;
    return question.showIf(answers);
  });
}

export const oilinessQuestions = [
  {
    id: "area",
    q: "번들거림이 주로 어디에 나타나나요?",
    options: [
      { label: "이마 / 코 같은 T존 위주", value: "tzone" },
      { label: "코 주변 위주", value: "nose" },
      { label: "볼까지 전체적으로 번들거림", value: "whole_face" },
      { label: "부위마다 차이가 큼", value: "combination" },
    ],
  },

  {
    id: "timing",
    q: "세안 후 얼마나 지나면 번들거림이 느껴지나요?",
    options: [
      { label: "오후쯤 조금 올라옴", value: "late" },
      { label: "3~4시간 안에 번들거림", value: "medium" },
      { label: "1~2시간 안에 금방 번들거림", value: "fast" },
      { label: "세안 직후부터 유분감이 느껴짐", value: "very_fast" },
    ],
  },

  {
    id: "afterWash",
    q: "세안 직후 피부는 어떤 느낌인가요?",
    options: [
      { label: "편안함", value: "comfortable" },
      { label: "약간 당기지만 금방 괜찮아짐", value: "mild_tight" },
      { label: "속은 꽤 당기는데 나중에 번들거림", value: "tight_oily" },
      { label: "많이 건조하고 당김", value: "very_tight" },
    ],
  },

  {
    id: "moisturizer",
    q: "보습제를 바른 뒤 느낌은 어떤가요?",
    options: [
      { label: "적당하고 편안함", value: "comfortable" },
      { label: "조금 무겁게 느껴짐", value: "heavy" },
      { label: "금방 번들거리거나 답답함", value: "very_heavy" },
      { label: "보습제를 거의 사용하지 않음", value: "none" },
    ],
  },

  {
    id: "cleansing",
    q: "유분 때문에 세안을 강하게 하는 편인가요?",
    options: [
      { label: "순한 세안제로 짧게 세안", value: "gentle" },
      { label: "뽀득한 느낌이 날 때까지 세안", value: "strong" },
      { label: "하루 3번 이상 세안하기도 함", value: "frequent" },
      { label: "스크럽이나 강한 클렌징도 같이 함", value: "harsh" },
    ],
  },

  {
    id: "clogged",
    q: "번들거림과 함께 모공 막힘이나 좁쌀도 느껴지나요?",
    options: [
      { label: "거의 없음", value: "none" },
      { label: "가끔 좁쌀이나 피지가 보임", value: "mild" },
      { label: "좁쌀이나 막힘이 자주 생김", value: "frequent" },
      { label: "블랙헤드와 피지가 많이 신경 쓰임", value: "blackhead" },
    ],
  },

  {
    id: "inflammation",
    q: "붉거나 아픈 트러블도 같이 생기나요?",
    options: [
      { label: "거의 없음", value: "none" },
      { label: "가끔 한두 개 생김", value: "sometimes" },
      { label: "자주 붉은 트러블이 생김", value: "frequent" },
    ],
  },
];

export function getVisibleOilinessQuestions() {
  return oilinessQuestions;
}
