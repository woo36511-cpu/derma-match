import { skinSurveyQuestions } from "./data/skinSurvey";
import {
  analyzeSkinSurvey,
  adjustCareNeedsForIssue,
} from "./utils/analyzeSkinSurvey";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { products } from "./data/products";
import { starterRoutineByLevel } from "./data/routines";
import { ingredientsInfo } from "./data/ingredients";

const SAVED_SURVEY_KEY = "dearsince_saved_survey_result";
const JOURNEY_HISTORY_KEY = "dearsince_skin_journey_history";

// ===== 단계별 설명용 정보 =====
const routineMap = {
  1: {
    label: "1단계 · 매우 촉촉하게",
    summary: "아주 건조한 쪽에 가까운 루틴",
  },
  2: {
    label: "2단계 · 촉촉하게",
    summary: "건조함이 강한 편에 맞는 루틴",
  },
  3: {
    label: "3단계 · 약간 촉촉하게",
    summary: "건성 쪽에 가까운 기본 루틴",
  },
  4: {
    label: "4단계 · 중간보다 촉촉하게",
    summary: "약건성 쪽에 맞는 루틴",
  },
  5: {
    label: "5단계 · 기본 시작 단계",
    summary: "처음 시작하기 좋은 중간 루틴",
  },
  6: {
    label: "6단계 · 중간보다 가볍게",
    summary: "약지성 쪽에 맞는 루틴",
  },
  7: {
    label: "7단계 · 약간 가볍게",
    summary: "지성 경향에 맞는 루틴",
  },
  8: {
    label: "8단계 · 가볍게",
    summary: "유분감이 강한 편에 맞는 루틴",
  },
  9: {
    label: "9단계 · 매우 가볍게",
    summary: "매우 지성 쪽에 가까운 루틴",
  },
  10: {
    label: "10단계 · 가장 가볍게",
    summary: "유분이 매우 많은 편에 맞는 루틴",
  }
};

const feedbackQuestions = [
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
const skinConcernOptions = [
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

const inflammatoryAcneQuestions = [
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
      ["pustule", "nodule", "cluster"].includes(
        answers.form?.value
      ),
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
    showIf: (answers) =>
      answers.area?.value === "chin_jaw",
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

function getVisibleInflammatoryAcneQuestions(answers) {
  return inflammatoryAcneQuestions.filter((question) => {
    if (!question.showIf) return true;

    return question.showIf(answers);
  });
}
const closedComedoneQuestions = [
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

function getVisibleClosedComedoneQuestions() {
  return closedComedoneQuestions;
}

const blackheadSebumQuestions = [
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

function getVisibleBlackheadSebumQuestions() {
  return blackheadSebumQuestions;
}

const dehydrationQuestions = [
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

function getVisibleDehydrationQuestions() {
  return dehydrationQuestions;
}

const sensitivityRednessQuestions = [
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
    showIf: (answers) =>
      answers.swelling?.value === "eyes_lips",
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

function getVisibleSensitivityRednessQuestions(answers) {
  return sensitivityRednessQuestions.filter((question) => {
    if (!question.showIf) return true;
    return question.showIf(answers);
  });
}

const oilinessQuestions = [
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

function getVisibleOilinessQuestions() {
  return oilinessQuestions;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getFeedbackValue(answers, id) {
  const answer = answers[id];

  if (typeof answer === "number") {
    return answer;
  }

  if (answer && typeof answer.value === "number") {
    return answer.value;
  }

  return 0;
}

function calculateNextLevel(currentLevel, answers) {
  let adjustment = 0;

  Object.values(answers).forEach((answer) => {
    if (typeof answer === "number") {
      adjustment += answer;
      return;
    }

    if (answer && typeof answer.value === "number") {
      adjustment += answer.value;
    }
  });

  // 피드백 한 번으로 단계가 너무 크게 튀지 않게 제한
  adjustment = clamp(adjustment, -3, 3);

  return clamp(currentLevel + adjustment, 1, 10);
}

function getRecommendedIngredients(
  level,
  feedbackContext = {}
) {
  const list = [];

  if (level <= 3) {
    list.push(
      "세라마이드",
      "판테놀",
      "히알루론산"
    );
  } else if (level <= 5) {
    list.push(
      "히알루론산",
      "판테놀"
    );
  } else if (level <= 7) {
    list.push(
      "판테놀",
      "나이아신아마이드"
    );
  } else {
    list.push("나이아신아마이드");
  }

  const clogged = feedbackContext.clogged ?? 0;
  const trouble = feedbackContext.trouble ?? 0;
  const irritated = feedbackContext.irritated ?? false;

  // 좁쌀·막힘이 늘었지만
  // 붉은 트러블이나 자극은 없는 경우에만 BHA 고려
  if (
    clogged >= 1 &&
    trouble === 0 &&
    !irritated &&
    !list.includes("BHA")
  ) {
    list.push("BHA");
  }

  return list;
}

function getProductEvidenceSnapshot(
  product
) {
  const evidence =
    product?.evidence || {};

  return {
    evidenceLevel:
      evidence.evidenceLevel ??
      "unverified",

    officialProductVerified:
      evidence.officialProductVerified ??
      false,

    fullIngredientsVerified:
      evidence.fullIngredientsVerified ??
      false,

    concentrationDisclosure:
      evidence.concentrationDisclosure ??
      "unknown",

    lastVerifiedAt:
      evidence.lastVerifiedAt ??
      null,
  };
}

function buildProductUsagePlan(
  productsByCategory = {},
  skinType = "",
  startedAt = null
) {
  return Object.entries(
    productsByCategory
  )
    .filter(([, product]) => !!product)
    .map(([category, product]) => {
      let recommendedAmount =
        product.usageAmount?.normal ??
        null;

      if (
        skinType.includes("지성") ||
        skinType.includes("수부지")
      ) {
        recommendedAmount =
          product.usageAmount?.oily ??
          recommendedAmount;
      } else if (
        skinType.includes("건성")
      ) {
        recommendedAmount =
          product.usageAmount?.dry ??
          recommendedAmount;
      }

      return {
        productId: product.id,

        productNameSnapshot:
          product.name,

        category,
        startedAt,

        recommendationSnapshot: {
          hydrationLevel:
            product.hydrationLevel ??
            null,

          careProfile:
            getProductCareProfile(
              product
            ),

          evidence:
            getProductEvidenceSnapshot(
              product
            ),

          recommendedAmount,

          recommendedTiming:
            product.usage?.when ??
            null,
        },

        // 실제 사용 데이터는
        // 사용자가 답하기 전까지 추정하지 않음
        actualUsage: {
          amount: null,
          frequency: null,
          stoppedEarly: null,
          stopReason: null,
        },
      };
    });
}

function getFeedbackOptionValue(
  feedbackAnswers = {},
  id
) {
  return (
    feedbackAnswers[id]?.value ??
    null
  );
}

function buildFeedbackConfounders(
  feedbackAnswers = {}
) {
  return {
    otherSkincareChange:
      getFeedbackOptionValue(
        feedbackAnswers,
        "otherSkincareChange"
      ),

    sleepStressChange:
      getFeedbackOptionValue(
        feedbackAnswers,
        "sleepStressChange"
      ),

    dietChange:
      getFeedbackOptionValue(
        feedbackAnswers,
        "dietChange"
      ),

    medicationSupplementChange:
      getFeedbackOptionValue(
        feedbackAnswers,
        "medicationSupplementChange"
      ),

    environmentChange:
      getFeedbackOptionValue(
        feedbackAnswers,
        "environmentChange"
      ),
  };
}

function buildFeedbackUsageReport(
  feedbackAnswers = {}
) {
  return {
    routineUsage:
      getFeedbackOptionValue(
        feedbackAnswers,
        "routineUsage"
      ),

    usageDuration:
      getFeedbackOptionValue(
        feedbackAnswers,
        "usageDuration"
      ),
  };
}

function buildFeedbackDataQuality(
  feedbackAnswers = {}
) {
  const confounders =
    buildFeedbackConfounders(
      feedbackAnswers
    );

  const usage =
    buildFeedbackUsageReport(
      feedbackAnswers
    );

  let score = 1;

  if (usage.routineUsage === "mostly") {
    score -= 0.1;
  }

  if (usage.routineUsage === "partial") {
    score -= 0.3;
  }

  if (usage.routineUsage === "rare") {
    score -= 0.55;
  }

  if (usage.usageDuration === "under_7") {
    score -= 0.35;
  } else if (
    usage.usageDuration === "7_13"
  ) {
    score -= 0.2;
  } else if (
    usage.usageDuration === "14_27"
  ) {
    score -= 0.05;
  }

  if (
    confounders.otherSkincareChange ===
    "one"
  ) {
    score -= 0.15;
  }

  if (
    confounders.otherSkincareChange ===
    "multiple"
  ) {
    score -= 0.3;
  }

  if (
    confounders.sleepStressChange ===
    "mild"
  ) {
    score -= 0.08;
  }

  if (
    confounders.sleepStressChange ===
    "major"
  ) {
    score -= 0.2;
  }

  if (
    confounders.dietChange === "mild"
  ) {
    score -= 0.05;
  }

  if (
    confounders.dietChange === "major"
  ) {
    score -= 0.12;
  }

  if (
    confounders
      .medicationSupplementChange ===
    "changed"
  ) {
    score -= 0.2;
  }

  if (
    confounders.environmentChange ===
    "changed"
  ) {
    score -= 0.1;
  }

  score = Math.max(
    0,
    Math.min(1, score)
  );

  const majorConfounderCount = [
    confounders.otherSkincareChange ===
      "multiple",
    confounders.sleepStressChange ===
      "major",
    confounders.dietChange ===
      "major",
    confounders
      .medicationSupplementChange ===
      "changed",
    confounders.environmentChange ===
      "changed",
  ].filter(Boolean).length;

  return {
    confidenceScore:
      Number(score.toFixed(2)),

    confidenceLevel:
      score >= 0.8
        ? "high"
        : score >= 0.55
        ? "medium"
        : "low",

    majorConfounderCount,

    // 아직 제품별 실제 사용 여부를
    // 구분해서 받지 않으므로 개별 제품의
    // 인과 효과를 단정하는 데이터로는 사용하지 않음
    productAttributionReady: false,
  };
}

function getProductById(id) {
  return products.find((product) => product.id === id);
}
function getRoutineProducts(level) {
  const routineData = starterRoutineByLevel[level];
  if (!routineData) return null;

  const routineIds = routineData.products;

  return {
    label: routineData.label,
    description: routineData.description,
    focus: routineData.focus,
    products: {
      cleanser: getProductById(routineIds.cleanser),
      toner: getProductById(routineIds.toner),
      serum: getProductById(routineIds.serum),
      cream: getProductById(routineIds.cream),
    }
  };
}

function getCategoryLabel(key) {
  const map = {
    cleanser: "클렌저",
    toner: "토너",
    serum: "세럼",
    cream: "크림",

    cleansing_oil: "클렌징 오일",
cleansing_milk: "클렌징 밀크",
gel_cleanser: "젤 클렌저",
bha_cleanser: "BHA 클렌저",
enzyme_cleanser: "효소 클렌저"
  };

  return map[key] || key;
}

function isProductAvailable(product) {
  return (
    !!product &&
    product.isAvailable !== false
  );
}
function isValidProductLink(link) {
  return !!link && link !== "#";
}
function clampProductCareScore(value) {
  return Math.max(
    0,
    Math.min(
      10,
      Math.round(value)
    )
  );
}

function getProductCareProfile(product) {
  if (!product) {
    return {
      hydrationSupport: 0,
      lightweightFit: 0,
      soothingSupport: 0,
      congestionSupport: 0,
      barrierSupport: 0,
    };
  }

  const concerns =
    product.concerns || [];

  const texture =
    String(
      product.texture || ""
    ).toLowerCase();

  const ingredientText =
    (product.ingredients || [])
      .join(" ")
      .toLowerCase();

  const hasConcern = (...tags) =>
    tags.some((tag) =>
      concerns.includes(tag)
    );

  const hasIngredient = (
    ...keywords
  ) =>
    keywords.some((keyword) =>
      ingredientText.includes(
        String(keyword).toLowerCase()
      )
    );

  // =========================
  // 1. 수분 / 보습 지원
  // =========================

  let hydrationSupport = 0;

  if (hasConcern("hydration")) {
    hydrationSupport += 5;
  }

  if (hasConcern("barrier")) {
    hydrationSupport += 2;
  }

  if (
    hasIngredient(
      "히알루론산",
      "hyaluronic"
    )
  ) {
    hydrationSupport += 1;
  }

  if (
    hasIngredient(
      "글리세린",
      "glycerin"
    )
  ) {
    hydrationSupport += 1;
  }

  if (
    hasIngredient(
      "판테놀",
      "panthenol"
    )
  ) {
    hydrationSupport += 1;
  }

  // =========================
  // 2. 가벼운 제형 적합도
  // =========================

  let lightweightFit = 5;

  if (
    [
      "light",
      "gel",
      "watery",
      "fresh",
    ].includes(texture)
  ) {
    lightweightFit = 9;
  }

  if (
    [
      "lotion",
      "emulsion",
    ].includes(texture)
  ) {
    lightweightFit = 6;
  }

  if (
    [
      "rich",
      "heavy",
      "balm",
    ].includes(texture)
  ) {
    lightweightFit = 2;
  }

  // =========================
  // 3. 진정 지원
  // =========================

  let soothingSupport = 0;

  if (hasConcern("soothing")) {
    soothingSupport += 5;
  }

  if (product.sensitivitySafe) {
    soothingSupport += 2;
  }

  if (
    hasIngredient(
      "판테놀",
      "panthenol",
      "병풀",
      "시카",
      "centella",
      "마데카소사이드",
      "알란토인"
    )
  ) {
    soothingSupport += 2;
  }

  if (hasConcern("barrier")) {
    soothingSupport += 1;
  }

  // =========================
  // 4. 피지 / 모공 막힘 지원
  // =========================

  let congestionSupport = 0;

  if (
    hasConcern(
      "closed_comedones"
    )
  ) {
    congestionSupport += 7;
  }

  if (hasConcern("blackhead")) {
    congestionSupport += 7;
  }

  if (hasConcern("pores")) {
    congestionSupport += 5;
  }

  if (hasConcern("sebum")) {
    congestionSupport += 4;
  }

  if (hasConcern("acne")) {
    congestionSupport += 2;
  }

  if (
    hasIngredient(
      "bha",
      "살리실산",
      "베타인살리실레이트"
    )
  ) {
    congestionSupport += 2;
  }

  // =========================
  // 5. 장벽 지원
  // =========================

  let barrierSupport = 0;

  if (hasConcern("barrier")) {
    barrierSupport += 6;
  }

  if (
    hasIngredient(
      "세라마이드",
      "ceramide"
    )
  ) {
    barrierSupport += 2;
  }

  if (
    hasIngredient(
      "스쿠알란",
      "squalane"
    )
  ) {
    barrierSupport += 1;
  }

  if (
    hasIngredient(
      "판테놀",
      "panthenol"
    )
  ) {
    barrierSupport += 1;
  }

  const inferredProfile = {
    hydrationSupport:
      clampProductCareScore(
        hydrationSupport
      ),

    lightweightFit:
      clampProductCareScore(
        lightweightFit
      ),

    soothingSupport:
      clampProductCareScore(
        soothingSupport
      ),

    congestionSupport:
      clampProductCareScore(
        congestionSupport
      ),

    barrierSupport:
      clampProductCareScore(
        barrierSupport
      ),
  };

  // 나중에 products.js에서
  // 제품별 수동 보정 가능
  return {
    ...inferredProfile,
    ...(product.careProfile || {}),
  };
}
function getCareNeedMatchScore(
  product,
  careNeeds = {}
) {
  if (!product) return 0;

  const {
    hydrationNeed = 0,
    lightTextureNeed = 0,
    soothingNeed = 0,
    congestionCareNeed = 0,
    inflammationCareNeed = 0,
  } = careNeeds || {};

  const profile =
    getProductCareProfile(product);

  const recoveryNeed =
    Math.max(
      soothingNeed,
      inflammationCareNeed
    );

  let score = 0;

  // 필요한 정도가 높을수록
  // 해당 제품 능력치의 영향도도 커짐
  score +=
    hydrationNeed *
    profile.hydrationSupport *
    0.28;

  score +=
    lightTextureNeed *
    profile.lightweightFit *
    0.22;

  score +=
    soothingNeed *
    profile.soothingSupport *
    0.2;

  score +=
    congestionCareNeed *
    profile.congestionSupport *
    0.2;

  // 피부가 예민하거나 염증 신호가 높으면
  // 장벽 지원 능력도 중요하게 반영
  score +=
    recoveryNeed *
    profile.barrierSupport *
    0.1;

  // 염증 신호가 높은 사람에게
  // 각질 기능성 제품을 화장품 기본 루틴으로
  // 과하게 밀어주지 않도록 패널티
  if (
    inflammationCareNeed >= 6 &&
    hasExfoliatingActive(product)
  ) {
    score -= 25;
  }

  // 염증/민감 신호가 높은데
  // 민감 안전 제품이 아니라면 추가 패널티
  if (
    inflammationCareNeed >= 6 &&
    !product.sensitivitySafe
  ) {
    score -= 15;
  }

  return score;
}

function getConcernMatchScore(product, mainConcern) {
  const concerns = product.concerns || [];

  const has = (...tags) =>
    tags.some((tag) => concerns.includes(tag));

  const texture = String(product.texture || "").toLowerCase();

  const isLightTexture = [
    "light",
    "gel",
    "watery",
    "fresh",
  ].includes(texture);

  let score = 0;

  // 염증성 여드름
  if (mainConcern === "inflammatory_acne") {
    if (has("acne")) score += 6;
    if (has("soothing")) score += 3;
    if (has("barrier")) score += 1;
  }

  // 좁쌀 / 막힘
  if (mainConcern === "closed_comedones") {
    if (has("closed_comedones")) score += 6;
    if (has("pores")) score += 4;
    if (has("sebum")) score += 2;
    if (isLightTexture) score += 3;
    if (has("acne")) score += 1;
  }

  // 블랙헤드 / 피지
  if (mainConcern === "blackhead_sebum") {
    if (has("blackhead")) score += 6;
    if (has("pores")) score += 5;
    if (has("sebum")) score += 4;
    if (isLightTexture) score += 2;
  }

  // 속당김 / 건조함
  if (mainConcern === "dehydration") {
    if (has("hydration")) score += 6;
    if (has("barrier")) score += 4;
    if (has("soothing")) score += 1;
  }

  // 민감 / 붉어짐
  if (mainConcern === "sensitivity_redness") {
    if (has("soothing")) score += 6;
    if (product.sensitivitySafe) score += 4;
    if (has("barrier")) score += 3;
    if (has("hydration")) score += 1;
  }

  // 번들거림
  if (mainConcern === "oiliness") {
    if (has("sebum")) score += 6;
    if (isLightTexture) score += 5;
    if (has("pores")) score += 2;
    if (has("blackhead")) score += 1;
  }

  return score;
}

function getRecommendationScore(
  product,
  currentLevel,
  userContext = {}
) {
  const careScore =
    getCareNeedMatchScore(
      product,
      userContext.careNeeds
    );

  const concernScore =
    getConcernMatchScore(
      product,
      userContext.mainConcern
    );

  const hydrationDifference =
    Math.abs(
      (product.hydrationLevel ?? 5) -
        currentLevel
    );

  let score = 0;

  // careScore는 최대 약 100 범위라
  // 0~10 정도로 정규화해서 사용
  score += (careScore / 10) * 5.5;

  // 사용자가 직접 선택한 주요 고민을
  // 충분히 크게 반영
  score += concernScore * 3.5;

  // 현재 수분감 단계와 너무 멀면 감점
  score -= hydrationDifference * 2.5;

  if (
    userContext.isSensitive &&
    product.sensitivitySafe
  ) {
    score += 4;
  }

  if (product.beginnerFriendly) {
    score += 1.5;
  }

  return score;
}

function sortProductsForRecommendation(
  productList,
  currentLevel,
  userContext = {}
) {
  return [...productList].sort((a, b) => {
    const aScore =
      getRecommendationScore(
        a,
        currentLevel,
        userContext
      );

    const bScore =
      getRecommendationScore(
        b,
        currentLevel,
        userContext
      );

    if (aScore !== bScore) {
      return bScore - aScore;
    }

    // 동점일 때 주요 고민 적합도를 다시 우선
    const aConcernScore =
      getConcernMatchScore(
        a,
        userContext.mainConcern
      );

    const bConcernScore =
      getConcernMatchScore(
        b,
        userContext.mainConcern
      );

    if (aConcernScore !== bConcernScore) {
      return bConcernScore - aConcernScore;
    }

    const aDiff = Math.abs(
      (a.hydrationLevel ?? 5) -
        currentLevel
    );

    const bDiff = Math.abs(
      (b.hydrationLevel ?? 5) -
        currentLevel
    );

    if (aDiff !== bDiff) {
      return aDiff - bDiff;
    }

    if (userContext.isSensitive) {
      const aSensitive =
        a.sensitivitySafe ? 1 : 0;

      const bSensitive =
        b.sensitivitySafe ? 1 : 0;

      if (aSensitive !== bSensitive) {
        return bSensitive - aSensitive;
      }
    }

    const aBeginner =
      a.beginnerFriendly ? 1 : 0;

    const bBeginner =
      b.beginnerFriendly ? 1 : 0;

    return bBeginner - aBeginner;
  });
}

function sortProductsForDisplay(productList, currentLevel) {
  return [...productList].sort((a, b) => {
    const aBeginner = a.beginnerFriendly ? 1 : 0;
    const bBeginner = b.beginnerFriendly ? 1 : 0;

    if (aBeginner !== bBeginner) {
      return bBeginner - aBeginner;
    }

    const aDiff = Math.abs((a.hydrationLevel ?? 5) - currentLevel);
    const bDiff = Math.abs((b.hydrationLevel ?? 5) - currentLevel);

    if (aDiff !== bDiff) {
      return aDiff - bDiff;
    }

    const aSensitive = a.sensitivitySafe ? 1 : 0;
    const bSensitive = b.sensitivitySafe ? 1 : 0;

    if (aSensitive !== bSensitive) {
      return bSensitive - aSensitive;
    }

    return 0;
  });
}

function filterByLevel(productList, level) {
  let filtered = productList.filter((product) => {
    const productLevel = product.hydrationLevel ?? 5;
    return Math.abs(productLevel - level) <= 1;
  });

  if (filtered.length === 0) {
    filtered = productList.filter((product) => {
      const productLevel = product.hydrationLevel ?? 5;
      return Math.abs(productLevel - level) <= 2;
    });
  }

  return filtered;
}

function pickBestProductByCategory(
  category,
  level,
  userContext = {}
) {
  let targetCategory = category;

  let allowedCategories = [category];

  // 클렌저는 한 종류로 고정하지 않고
  // 현재 단계에 맞는 여러 세안제 중에서 비교
  if (category === "cleanser") {
    if (level <= 3) {
      allowedCategories = [
        "cleansing_milk",
        "cleanser",
        "gel_cleanser",
      ];
    } else if (level >= 7) {
      allowedCategories = [
        "gel_cleanser",
        "cleanser",
      ];
    } else {
      allowedCategories = [
        "cleanser",
        "gel_cleanser",
        "cleansing_milk",
      ];
    }
  }

  let categoryProducts = products.filter(
    (product) =>
      allowedCategories.includes(
        product.category
      ) &&
      isProductAllowedForContext(
        product,
        category,
        userContext
      )
  );

  // 단순 번들거림이 고민일 때는
// AHA / BHA / 살리실산 같은 각질 기능성 제품을 기본 추천에서 제외
if (
  userContext.mainConcern === "oiliness" &&
  (
    targetCategory === "toner" ||
    targetCategory === "serum" ||
    targetCategory === "cream"
  )
) {
  const nonExfoliatingProducts = categoryProducts.filter(
    (product) => !hasExfoliatingActive(product)
  );

  if (nonExfoliatingProducts.length > 0) {
    categoryProducts = nonExfoliatingProducts;
  }
}

const levelMatchedProducts = filterByLevel(
  categoryProducts,
  level
);

// 현재 고민과 잘 맞는 제품은
// 수분 단계가 최대 3단계 정도 차이나도 추가 후보로 허용
const concernMatchedProducts =
  userContext.mainConcern &&
  category !== "cleanser"
    ? categoryProducts.filter((product) => {
        const concernScore = getConcernMatchScore(
          product,
          userContext.mainConcern
        );

        const levelDifference = Math.abs(
          (product.hydrationLevel ?? level) - level
        );

        return (
          concernScore >= 5 &&
          levelDifference <= 3
        );
      })
    : [];

// 기존 수분 단계 후보 + 고민 적합 후보 합치기
let candidateProducts = [
  ...levelMatchedProducts,
  ...concernMatchedProducts.filter(
    (product) =>
      !levelMatchedProducts.some(
        (matched) => matched.id === product.id
      )
  ),
];

// 가까운 단계나 고민 적합 후보가 하나도 없으면
// 안전 게이트를 통과한 같은 카테고리 전체로 fallback
if (candidateProducts.length === 0) {
  candidateProducts = [
    ...categoryProducts,
  ];
}

// 특별한 고민이 없거나 빠른 추천일 때는
// 초보자용 + 각질 기능성이 없는 제품을 우선
const isDefaultMode =
  !userContext.mainConcern ||
  userContext.mainConcern === "none";

if (isDefaultMode) {
  const isLeaveOnCategory = [
    "toner",
    "serum",
    "cream",
  ].includes(category);

  const generalBeginnerCandidates =
    candidateProducts.filter(
      (product) =>
        product.beginnerFriendly &&
        !hasExfoliatingActive(product) &&
        (
          !isLeaveOnCategory ||
          !isSpecializedTreatmentProduct(
            product
          )
        )
    );

  if (
    generalBeginnerCandidates.length > 0
  ) {
    candidateProducts =
      generalBeginnerCandidates;
  } else {
    const broaderBeginnerSafe =
      categoryProducts.filter(
        (product) =>
          product.beginnerFriendly &&
          !hasExfoliatingActive(product)
      );

    if (
      broaderBeginnerSafe.length > 0
    ) {
      candidateProducts =
        broaderBeginnerSafe;
    }
  }
}

// 민감 피부라면 sensitivitySafe 제품을 먼저 후보군으로 제한
const sensitiveSafeProducts = userContext.isSensitive
  ? candidateProducts.filter(
      (product) => product.sensitivitySafe
    )
  : candidateProducts;

// 현재 수분 단계 안에 민감 안전 제품이 없다면
// 같은 카테고리 전체에서 민감 안전 제품을 다시 탐색
const broaderSensitiveProducts =
  userContext.isSensitive &&
  sensitiveSafeProducts.length === 0
    ? categoryProducts.filter(
        (product) => product.sensitivitySafe
      )
    : [];

const safePool = userContext.isSensitive
  ? sensitiveSafeProducts.length > 0
    ? sensitiveSafeProducts
    : broaderSensitiveProducts.length > 0
    ? broaderSensitiveProducts
    : candidateProducts
  : candidateProducts;

// 실제 구매 링크가 있는 제품 우선
const linkedProducts = safePool.filter(
  (product) => isValidProductLink(product.link)
);

// 링크 있는 제품이 하나라도 있으면 그 안에서 추천
const recommendationPool =
  linkedProducts.length > 0
    ? linkedProducts
    : safePool;

const sortedProducts = sortProductsForRecommendation(
  recommendationPool,
  level,
  userContext
);

return sortedProducts[0] || null;
}

function hasExfoliatingActive(product) {
  if (!product) return false;

  const ingredients = product.ingredients || [];

  return ingredients.some((ingredient) => {
    const normalized = String(ingredient).toLowerCase();

    return (
      normalized.includes("bha") ||
      normalized.includes("살리실산") ||
      normalized.includes("베타인살리실레이트") ||
      normalized.includes("aha") ||
      normalized.includes("글라이콜릭애씨드") ||
      normalized.includes("만델릭애씨드")
    );
  });
}

function isSpecializedTreatmentProduct(
  product
) {
  if (!product) return false;

  const concerns =
    product.concerns || [];

  const specializedConcerns = [
    "acne",
    "closed_comedones",
    "blackhead",
    "pores",
    "sebum",
    "deadskin",
  ];

  return (
    hasExfoliatingActive(product) ||
    specializedConcerns.some(
      (concern) =>
        concerns.includes(concern)
    )
  );
}

function isProductAllowedForContext(
  product,
  category,
  userContext = {}
) {
  if (!isProductAvailable(product)) {
    return false;
  }

  const {
    inflammationCareNeed = 0,
    soothingNeed = 0,
  } = userContext.careNeeds || {};

  const isLeaveOn = [
    "toner",
    "serum",
    "cream",
  ].includes(category);

  // AHA/BHA 같은 각질 기능성은
  // 기본 루틴이 아니라 별도 치료/옵션 단계에서 다룸
  if (
    isLeaveOn &&
    hasExfoliatingActive(product)
  ) {
    return false;
  }

  // 염증/민감 필요도가 매우 높은 경우에는
  // 민감 안전 표기가 없는 leave-on 제품도 기본 후보에서 제외
  if (
    isLeaveOn &&
    (
      inflammationCareNeed >= 8 ||
      soothingNeed >= 9
    ) &&
    !product.sensitivitySafe
  ) {
    return false;
  }

  return true;
}

function pickAlternativeNonExfoliatingProduct(
  category,
  level,
  userContext = {},
  excludedIds = []
) {
  // 각질 기능성이 없는 같은 카테고리 제품만 후보
  let candidates = products.filter(
  (product) =>
    product.category === category &&
    isProductAvailable(product) &&
    !excludedIds.includes(product.id) &&
    !hasExfoliatingActive(product)
);

  // 현재 수분 단계와 가까운 제품 우선
  let levelMatched = filterByLevel(
    candidates,
    level
  );

  // 가까운 단계에 제품이 없으면 전체 후보 사용
  if (levelMatched.length === 0) {
    levelMatched = candidates;
  }

  // 민감 피부라면 민감 안전 제품 우선
  if (userContext.isSensitive) {
    const sensitiveSafe = levelMatched.filter(
      (product) => product.sensitivitySafe
    );

    if (sensitiveSafe.length > 0) {
      levelMatched = sensitiveSafe;
    }
  }

  // 실제 링크가 있는 제품 우선
  const linkedProducts = levelMatched.filter(
    (product) =>
      isValidProductLink(product.link)
  );

  if (linkedProducts.length > 0) {
    levelMatched = linkedProducts;
  }

  const sorted = sortProductsForRecommendation(
    levelMatched,
    level,
    userContext
  );

  return sorted[0] || null;
}

function buildDynamicRoutine(
  level,
  userContext = {}
) {
  const cleanser = pickBestProductByCategory(
    "cleanser",
    level,
    userContext
  );

  const toner = pickBestProductByCategory(
    "toner",
    level,
    userContext
  );

let serum = pickBestProductByCategory(
  "serum",
  level,
  userContext
);

  let cream = pickBestProductByCategory(
    "cream",
    level,
    userContext
  );

 // 토너와 세럼에 각질 기능성이 동시에 들어가면
// 세럼을 순한 대체 제품으로 변경
if (
  hasExfoliatingActive(toner) &&
  hasExfoliatingActive(serum)
) {
  const alternativeSerum =
    pickAlternativeNonExfoliatingProduct(
      "serum",
      level,
      userContext,
      [serum.id]
    );

  if (alternativeSerum) {
    serum = alternativeSerum;
  }
}

// 토너 또는 세럼에 이미 각질 기능성이 있다면
// 크림까지 각질 기능성이 겹치지 않도록 변경
if (
  (
    hasExfoliatingActive(toner) ||
    hasExfoliatingActive(serum)
  ) &&
  hasExfoliatingActive(cream)
) {
  const alternativeCream =
    pickAlternativeNonExfoliatingProduct(
      "cream",
      level,
      userContext,
      [cream.id]
    );

  if (alternativeCream) {
    cream = alternativeCream;
  }
}

  return {
    label: `${level}단계 맞춤 루틴`,
    description:
      "현재 피부 상태와 주요 고민을 반영해 구성한 추천 루틴입니다.",

    products: {
      cleanser,
      toner,
      serum,
      cream,
    },
  };
}

function buildRoutineReason(level) {
  if (level <= 3) {
    return [
      "현재 피부가 건조한 상태라 수분과 장벽 중심으로 루틴을 구성했습니다.",
      "보습을 충분히 유지하는 것이 중요한 단계입니다.",
      "자극이 적은 제품 위주로 피부를 안정시키는 것이 좋습니다.",
    ];
  }

  if (level <= 6) {
    return [
      "수분과 유분 밸런스를 맞추는 방향으로 루틴을 구성했습니다.",
      "과하게 바르기보다 현재 상태를 유지하는 것이 중요합니다.",
      "안정적인 조합으로 피부 컨디션을 유지하는 단계입니다.",
    ];
  }

  return [
    "유분과 피지 관리가 필요한 상태라 가벼운 루틴으로 구성했습니다.",
    "무거운 제품은 줄이고 산뜻한 제품 위주로 선택했습니다.",
    "트러블과 막힘을 줄이는 방향으로 관리하는 단계입니다.",
  ];
}
function getLevelChangeMessage(starterLevel, nextLevel) {
  if (nextLevel < starterLevel) {
    return "현재 반응 기준으로는 조금 더 촉촉한 루틴 쪽이 잘 맞을 가능성이 높아요.";
  }

  if (nextLevel > starterLevel) {
    return "현재 반응 기준으로는 조금 더 가벼운 루틴 쪽이 잘 맞을 가능성이 높아요.";
  }

  return "현재 반응 기준으로는 지금 단계의 밸런스가 가장 무난해 보여요.";
}

function getFeedbackMainConcern(
  answers = {},
  fallbackConcern = ""
) {
  const irritationLabel =
    answers.irritation?.label || "";

  const trouble =
    getFeedbackValue(answers, "trouble");

  const clogged =
    getFeedbackValue(answers, "clogged");

  const irritated =
    irritationLabel.includes("따가움") ||
    irritationLabel.includes("붉어짐") ||
    irritationLabel.includes("불편함");

  // 1순위: 자극 반응
  if (irritated) {
    return "sensitivity_redness";
  }

  // 2순위: 새로 생기거나 악화된 붉은 트러블
  if (trouble >= 1) {
    return "inflammatory_acne";
  }

  // 3순위: 좁쌀 / 막힘 증가
  if (clogged >= 1) {
    return "closed_comedones";
  }

  // 새 문제가 없으면 기존 고민 유지
  return fallbackConcern || "none";
}

function getFeedbackAdvice(answers) {
  const dry = getFeedbackValue(answers, "dry");
  const oil = getFeedbackValue(answers, "oil");
  const feel = getFeedbackValue(answers, "feel");
  const trouble = getFeedbackValue(answers, "trouble");
  const clogged = getFeedbackValue(answers, "clogged");

  const irritationLabel = answers.irritation?.label || "";
  const satisfactionLabel = answers.satisfaction?.label || "";

  const advice = [];

  if (dry <= -1) {
    advice.push("아직 당김이 남아 있어 다음 루틴은 조금 더 촉촉한 보습 쪽으로 조정하는 게 좋아요.");
  }

  if (oil >= 1) {
    advice.push("번들거림이 느껴졌다면 무거운 제품보다 산뜻한 토너, 세럼, 젤크림 위주가 더 잘 맞을 수 있어요.");
  }

  if (feel >= 1) {
    advice.push("바른 직후 답답했다면 크림 양을 줄이거나 더 가벼운 제형으로 바꿔보는 게 좋아요.");
  }

  if (trouble >= 1) {
    advice.push("붉은 트러블이 생겼다면 새 제품을 한 번에 여러 개 쓰기보다 루틴을 단순하게 줄여서 확인해보세요.");
  }

  if (clogged >= 1) {
    advice.push("좁쌀이나 오돌토돌함이 늘었다면 오일, 무거운 크림, 과한 레이어링을 먼저 의심해볼 수 있어요.");
  }

  if (
    irritationLabel.includes("따가움") ||
    irritationLabel.includes("붉어짐") ||
    irritationLabel.includes("불편함")
  ) {
    advice.push("따가움이나 붉어짐이 있었다면 BHA, 레티놀, 고함량 기능성 제품은 잠시 줄이고 진정·장벽 제품 위주로 가는 게 안전해요.");
  }

  if (satisfactionLabel.includes("안 맞는")) {
    advice.push("제품이 전체적으로 안 맞는 느낌이라면 같은 단계 안에서도 제형이나 성분을 바꿔보는 방향이 좋아요.");
  }

  if (advice.length === 0) {
    advice.push("전체적으로 큰 불편감이 없다면 현재 단계의 루틴을 조금 더 유지해도 괜찮아 보여요.");
  }

  return advice.slice(0, 5);
}
function getJourneyChangeReasons(
  feedbackAnswers = {},
  previousState = {},
  nextState = {}
) {
  const reasons = [];

  const dry = getFeedbackValue(
    feedbackAnswers,
    "dry"
  );

  const oil = getFeedbackValue(
    feedbackAnswers,
    "oil"
  );

  const feel = getFeedbackValue(
    feedbackAnswers,
    "feel"
  );

  const trouble = getFeedbackValue(
    feedbackAnswers,
    "trouble"
  );

  const clogged = getFeedbackValue(
    feedbackAnswers,
    "clogged"
  );

  const irritationLabel =
    feedbackAnswers.irritation?.label || "";

  if (dry <= -1) {
    reasons.push(
      "사용 후에도 피부 당김이 남아 더 촉촉한 방향을 고려했어요."
    );
  }

  if (oil >= 1) {
    reasons.push(
      "시간이 지나면서 번들거림이 올라와 조금 더 가벼운 방향을 고려했어요."
    );
  }

  if (feel >= 1) {
    reasons.push(
      "제품을 바른 뒤 무겁거나 답답한 느낌이 있어 제형을 가볍게 조정했어요."
    );
  }

  if (trouble >= 1) {
    reasons.push(
      "붉은 트러블이 새로 생기거나 심해져 트러블 관리 비중을 높였어요."
    );
  }

  if (clogged >= 1) {
    reasons.push(
      "좁쌀이나 오돌토돌함이 늘어 모공 막힘을 고려해 루틴을 조정했어요."
    );
  }

  if (
    irritationLabel.includes("따가움") ||
    irritationLabel.includes("붉어짐") ||
    irritationLabel.includes("불편함")
  ) {
    reasons.push(
      "따가움이나 붉어짐 반응이 있어 자극을 줄이는 방향을 우선했어요."
    );
  }

  if (
    previousState.mainConcern &&
    nextState.mainConcern &&
    previousState.mainConcern !==
      nextState.mainConcern
  ) {
    const nextConcernLabel =
      skinConcernOptions.find(
        (concern) =>
          concern.id === nextState.mainConcern
      )?.label;

    if (nextConcernLabel) {
      reasons.push(
        `피드백을 반영해 현재 주요 고민을 '${nextConcernLabel}' 쪽으로 다시 잡았어요.`
      );
    }
  }

  if (reasons.length === 0) {
    if (
      previousState.hydrationLevel ===
      nextState.hydrationLevel
    ) {
      reasons.push(
        "큰 불편감이 없어 현재 수분감 단계를 유지했어요."
      );
    } else {
      reasons.push(
        "전체 피드백을 반영해 현재 피부 반응에 가까운 단계로 조정했어요."
      );
    }
  }

  return reasons.slice(0, 3);
}
function getFeedbackConditionSnapshot(
  feedbackAnswers = {}
) {
  const dry =
    getFeedbackValue(
      feedbackAnswers,
      "dry"
    );

  const oil =
    getFeedbackValue(
      feedbackAnswers,
      "oil"
    );

  const trouble =
    getFeedbackValue(
      feedbackAnswers,
      "trouble"
    );

  const clogged =
    getFeedbackValue(
      feedbackAnswers,
      "clogged"
    );

  const irritationLabel =
    feedbackAnswers.irritation?.label || "";

  let irritationSeverity = 0;

  if (
    irritationLabel.includes("자주") ||
    irritationLabel.includes("바르면 바로") ||
    irritationLabel.includes("불편함")
  ) {
    irritationSeverity = 2;
  } else if (
    irritationLabel.includes("가끔")
  ) {
    irritationSeverity = 1;
  }

  const drynessSeverity =
    dry <= -2
      ? 2
      : dry <= -1
      ? 1
      : 0;

  return [
    {
      id: "dryness",
      label: "속당김",
      severity: drynessSeverity,
    },
    {
      id: "oiliness",
      label: "번들거림",
      severity: Math.max(
        0,
        Math.min(oil, 2)
      ),
    },
    {
      id: "trouble",
      label: "붉은 트러블",
      severity: Math.max(
        0,
        Math.min(trouble, 2)
      ),
    },
    {
      id: "clogged",
      label: "좁쌀 · 막힘",
      severity: Math.max(
        0,
        Math.min(clogged, 2)
      ),
    },
    {
      id: "irritation",
      label: "따가움 · 붉어짐",
      severity: irritationSeverity,
    },
  ];
}

function compareFeedbackConditions(
  currentAnswers = {},
  previousAnswers = null
) {
  const current =
    getFeedbackConditionSnapshot(
      currentAnswers
    );

  const previous = previousAnswers
    ? getFeedbackConditionSnapshot(
        previousAnswers
      )
    : [];

  return current.map((currentItem) => {
    const previousItem =
      previous.find(
        (item) =>
          item.id === currentItem.id
      );

    const stateLabel =
      currentItem.severity === 0
        ? "거의 없음"
        : currentItem.severity === 1
        ? "약간 있음"
        : "뚜렷함";

    if (!previousItem) {
      return {
        ...currentItem,
        status: "현재",
        stateLabel,
      };
    }

    const difference =
      currentItem.severity -
      previousItem.severity;

    return {
      ...currentItem,

      status:
        difference < 0
          ? "개선"
          : difference > 0
          ? "악화"
          : "유지",

      stateLabel,
    };
  });
}
function buildUserTags(context) {
  const tags = [];

  if (context.skinType) {
    tags.push(context.skinType);
  }

  if (context.isSensitive) {
    tags.push("민감피부");
  }

  if (context.troubleScore >= 1) {
    tags.push("트러블↑");
  }

  if (context.season === "spring") tags.push("봄");
  if (context.season === "summer") tags.push("여름");
  if (context.season === "autumn") tags.push("가을");
  if (context.season === "winter") tags.push("겨울");

  if (context.goal) {
    tags.push(context.goal);
  }

  return tags;
}

function buildRecommendationReasons(product, userContext = {}) {
  const reasons = [];

  const currentLevel = userContext.level ?? 5;
  const mainConcern = userContext.mainConcern;

  const productConcerns = product.concerns || [];

  const hasConcern = (...tags) =>
    tags.some((tag) => productConcerns.includes(tag));

  const texture = String(product.texture || "").toLowerCase();

  const isLightTexture = [
    "light",
    "gel",
    "watery",
    "fresh",
  ].includes(texture);

  // ===== 1순위: 현재 피부 고민과 직접 연결된 이유 =====

  if (mainConcern === "inflammatory_acne") {
    if (hasConcern("acne")) {
      reasons.push(
        "현재 고민인 염증성 트러블 관리 방향과 잘 맞는 제품"
      );
    }

    if (hasConcern("soothing")) {
      reasons.push(
        "붉고 예민해진 피부를 진정시키는 방향으로 보기 좋음"
      );
    }
  }

  if (mainConcern === "closed_comedones") {
    if (hasConcern("closed_comedones", "pores")) {
      reasons.push(
        "현재 고민인 좁쌀·모공 막힘 관리 방향과 잘 맞는 제품"
      );
    }

    if (isLightTexture) {
      reasons.push(
        "무겁고 답답한 제형을 줄이고 싶을 때 보기 좋은 편"
      );
    }
  }

  if (mainConcern === "blackhead_sebum") {
    if (hasConcern("blackhead", "pores")) {
      reasons.push(
        "현재 고민인 블랙헤드와 모공 관리 방향에 잘 맞는 제품"
      );
    }

    if (hasConcern("sebum")) {
      reasons.push(
        "피지와 번들거림 관리가 필요한 피부에 잘 맞는 편"
      );
    }
  }

  if (mainConcern === "dehydration") {
    if (hasConcern("hydration")) {
      reasons.push(
        "현재 고민인 속당김을 줄이기 위한 수분 보충에 잘 맞는 제품"
      );
    }

    if (hasConcern("barrier")) {
      reasons.push(
        "수분이 쉽게 날아가는 피부의 장벽 보완에 보기 좋은 제품"
      );
    }
  }

  if (mainConcern === "sensitivity_redness") {
    if (
      hasConcern("soothing", "redness") ||
      product.sensitivitySafe
    ) {
      reasons.push(
        "현재 고민인 붉어짐과 예민함을 고려한 진정 제품"
      );
    }

    if (hasConcern("barrier")) {
      reasons.push(
        "자극받은 피부의 장벽 관리 방향과 잘 맞는 편"
      );
    }
  }

  if (mainConcern === "oiliness") {
    if (hasConcern("sebum")) {
      reasons.push(
        "현재 고민인 번들거림과 유분 관리에 잘 맞는 제품"
      );
    }

    if (isLightTexture) {
      reasons.push(
        "무겁고 답답한 사용감을 피하고 싶은 피부에 적합한 편"
      );
    }
  }

  // ===== 2순위: 수분감 단계 =====

  const hydrationDiff = Math.abs(
    (product.hydrationLevel ?? 5) - currentLevel
  );

  if (hydrationDiff === 0) {
    reasons.push("현재 수분감 단계와 잘 맞음");
  } else if (hydrationDiff === 1) {
    reasons.push(
      "현재 수분감 단계와 크게 벗어나지 않는 제품"
    );
  }

  // ===== 3순위: 추가 적합성 =====

  if (
    userContext.isSensitive &&
    product.sensitivitySafe
  ) {
    reasons.push(
      "민감 경향을 고려했을 때 비교적 부담이 적은 편"
    );
  }

  if (product.beginnerFriendly) {
    reasons.push(
      "초보자도 시작하기 부담이 적은 제품"
    );
  }

  if (hasConcern("hydration")) {
    reasons.push(
      "기본 수분 보충용으로 활용하기 좋음"
    );
  }

  if (hasConcern("soothing")) {
    reasons.push(
      "진정 관리가 필요할 때 같이 보기 좋음"
    );
  }

  if (hasConcern("barrier")) {
    reasons.push(
      "장벽 보완이 필요한 피부에 보기 좋은 편"
    );
  }

  return [...new Set(reasons)].slice(0, 3);
}

function getRecommendedAmount(product, userContext) {
  if (!product?.usageAmount || !userContext) return null;

  const skinType = userContext.skinType || "";

  if (
    skinType.includes("지성") ||
    skinType.includes("수부지")
  ) {
    return product.usageAmount.oily;
  }

  if (skinType.includes("건성")) {
    return product.usageAmount.dry;
  }

  return product.usageAmount.normal;
}
function PrimaryButton({ children, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-2xl text-sm sm:text-base font-medium transition ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-black text-white hover:opacity-85 active:scale-95"
      }`}
    >
      {children}
    </button>
  );
}
function formatSavedAt(savedAt) {
  if (!savedAt) return "최근 저장됨";

  try {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(savedAt));
  } catch {
    return "최근 저장됨";
  }
}
function SectionTitle({ title, desc }) {
  return (
    <div className="text-center mb-8 sm:mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 break-keep leading-relaxed">
        {title}
      </h2>
      <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed break-keep">
        {desc}
      </p>
    </div>
  );
}

function ProductCard({ product, categoryKey, userContext }) {
  const [openInfo, setOpenInfo] = useState(null);

  if (!product) return null;

  const clickable = isValidProductLink(product.link);
  const tags = userContext ? buildUserTags(userContext) : [];
const reasons = userContext
  ? buildRecommendationReasons(product, userContext)
  : [];
    
const recommendedAmount = getRecommendedAmount(product, userContext);
const cardInner = (
    <>
      <img
  src={product.image}
  alt={product.name}
  className="w-full h-36 sm:h-44 object-cover rounded-2xl mb-4"
/>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-block text-[11px] tracking-wider text-gray-400 bg-gray-100 rounded-full px-2 py-1">
          {getCategoryLabel(categoryKey)}
        </span>

        {product.volume && (
          <span className="text-[11px] text-gray-400">
            {product.volume}
          </span>
        )}
      </div>

      <p className="text-base font-semibold leading-relaxed break-keep mb-1">
        {product.name}
      </p>

      <p className="text-sm text-gray-500 leading-relaxed break-keep mb-2">
        {product.description}
      </p>
      {tags.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-3">
    {tags.map((tag) => (
      <span
        key={tag}
        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
      >
        {tag}
      </span>
    ))}
  </div>
)}



      {product.shortReason && (
        <p className="text-sm text-gray-700 leading-relaxed break-keep mb-3">
          {product.shortReason}
        </p>
      )}

      {product.ratingTags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {product.ratingTags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 mb-3">
  {reasons.length > 0 && (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setOpenInfo(openInfo === "reason" ? null : "reason");
      }}
      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-2 transition"
    >
      추천 이유
    </button>
  )}

  {product.usage && (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setOpenInfo(openInfo === "usage" ? null : "usage");
      }}
      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-3 py-2 transition"
    >
      사용법
    </button>
  )}
</div>

{openInfo === "reason" && (
  <div className="mb-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
    <p className="text-xs font-semibold text-gray-500 mb-2">추천 이유</p>

    <ul className="space-y-1">
      {reasons.map((reason) => (
        <li
          key={reason}
          className="text-sm text-gray-700 leading-relaxed break-keep"
        >
          · {reason}
        </li>
      ))}
    </ul>
  </div>
)}

{openInfo === "usage" && product.usage && (
  <div className="mb-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
    <p className="text-xs font-semibold text-gray-500 mb-3">사용법</p>

    <div className="mb-3">
      <p className="text-xs text-gray-400 mb-1">사용 시점</p>
      <p className="text-sm text-gray-700 leading-relaxed break-keep">
        {product.usage.when}
      </p>
    </div>

    {product.usageAmount && (
      <div className="mb-3">
        {recommendedAmount && (
  <div className="mb-3 bg-blue-50 rounded-xl p-3">
    <p className="text-xs text-blue-500 mb-1">
      현재 피부 기준 추천 사용량
    </p>

    <p className="text-sm font-medium text-blue-800">
      {recommendedAmount}
    </p>
  </div>
)}
        <p className="text-xs text-gray-400 mb-2">추천 사용량</p>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1">
            지성 · {product.usageAmount.oily}
          </span>
          <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1">
            중성 · {product.usageAmount.normal}
          </span>
          <span className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1">
            건성 · {product.usageAmount.dry}
          </span>
        </div>
      </div>
    )}

    <div className="mb-3">
      <p className="text-xs text-gray-400 mb-2">사용 순서</p>

      <ul className="space-y-1">
        {product.usage.howToUse.map((item, index) => (
          <li
            key={index}
            className="text-sm text-gray-700 leading-relaxed break-keep"
          >
            {index + 1}. {item}
          </li>
        ))}
      </ul>
    </div>

    {product.usage.caution?.length > 0 && (
      <div>
        <p className="text-xs text-gray-400 mb-2">주의사항</p>

        <ul className="space-y-1">
          {product.usage.caution.map((item) => (
            <li
              key={item}
              className="text-sm text-amber-700 leading-relaxed break-keep"
            >
              · {item}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}

      <div className="flex items-center justify-between gap-3 mt-auto">
        <div className="text-sm text-gray-500">
          {product.price ? `${product.price.toLocaleString()}원` : ""}
        </div>

        <div
          className={`text-sm font-medium ${
            clickable ? "text-black" : "text-gray-400"
          }`}
        >
          {clickable ? "쿠팡에서 보기" : "링크 준비중"}
        </div>
      </div>

      {product.caution?.length > 0 && (
        <div className="mt-3 bg-amber-50 rounded-2xl p-3 text-sm text-amber-800 leading-relaxed break-keep">
          주의: {product.caution[0]}
        </div>
      )}
      </>
      );

  if (!clickable) {
    return (
      <div className="group bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col">
        {cardInner}
      </div>
    );
  }

  return (
    <a
      href={product.link}
      target="_blank"
      rel="noreferrer"
      className="group bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col"
    >
      {cardInner}
    </a>
  );
}

function RoutineProductScroller({ productsByCategory, userContext }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:gap-6 sm:overflow-visible">
      {Object.entries(productsByCategory)
        .filter(([, item]) => !!item)
        .map(([key, item]) => (
          <div
            key={key}
            className="min-w-[82%] max-w-[82%] snap-start sm:min-w-0 sm:max-w-none"
          >
            <ProductCard
              categoryKey={key}
              product={item}
              userContext={userContext}
            />
          </div>
        ))}
    </div>
  );
}
function getLevelDescription(level) {
  if (level <= 3) {
    return {
      title: "건조감이 큰 편이에요",
      desc: "수분을 채우는 것보다, 채운 수분이 날아가지 않게 잡아주는 보습·장벽 루틴이 중요해요.",
    };
  }

  if (level <= 6) {
    return {
      title: "유수분 밸런스를 맞추는 구간이에요",
      desc: "너무 무겁지도, 너무 가볍지도 않은 루틴으로 피부 반응을 보면서 조정하는 게 좋아요.",
    };
  }

  return {
    title: "번들거림과 답답함을 줄이는 구간이에요",
    desc: "무거운 크림보다는 산뜻한 수분 제품과 피지 관리 중심의 루틴이 잘 맞을 수 있어요.",
  };
}

function getCareDirections(result) {
  const skinType = result?.skinType || "";
  const mainIssue = result?.mainIssue || "none";

  const directions = [];

  if (skinType.includes("건성")) {
    directions.push("세안 후 바로 수분 제품을 바르고, 마지막에는 보습 크림으로 수분이 날아가지 않게 잡아주세요.");
  }

  if (skinType.includes("수부지")) {
    directions.push("기름을 없애는 것보다, 가벼운 수분을 채우고 무거운 크림 사용량을 줄이는 방향이 좋아요.");
  }

  if (skinType.includes("지성")) {
    directions.push("산뜻한 토너, 가벼운 세럼, 젤크림처럼 답답함이 적은 제품 위주로 시작해보세요.");
  }

  if (skinType.includes("민감")) {
    directions.push("따가움이나 붉어짐이 있다면 기능성 제품보다 진정·장벽 제품을 먼저 추천해요.");
  }

  if (mainIssue === "inflammatory_acne") {
    directions.push("붉고 아픈 트러블이 반복되면 화장품만으로 해결하기 어려울 수 있어 피부과 상담도 고려해보세요.");
  }

  if (mainIssue === "closed_comedones") {
    directions.push("좁쌀이 신경 쓰이면 무거운 크림, 오일 제품, 과한 레이어링을 먼저 줄여보는 게 좋아요.");
  }

  if (mainIssue === "blackhead_sebum") {
    directions.push("블랙헤드와 피지는 강한 세안보다 꾸준한 피지 관리와 산뜻한 보습이 더 중요해요.");
  }

  if (mainIssue === "dehydration") {
    directions.push("속당김이 있다면 세안 후 오래 방치하지 말고, 토너나 세럼을 빠르게 발라주세요.");
  }

  if (mainIssue === "sensitivity_redness") {
    directions.push("붉어짐과 따가움이 있으면 BHA, 레티놀, 고함량 기능성은 잠시 줄이는 편이 안전해요.");
  }
  if (mainIssue === "oiliness") {
  directions.push(
    "번들거림이 많아도 세안을 지나치게 강하게 하기보다 가벼운 수분과 산뜻한 제형으로 유수분 밸런스를 맞춰보세요."
  );
}


  if (directions.length === 0) {
    directions.push("현재는 큰 문제보다 기본 루틴을 안정적으로 유지하는 게 좋아 보여요.");
  }

  return directions.slice(0, 4);
}

function getResultCautions(result) {
  const skinType = result?.skinType || "";
  const mainIssue = result?.mainIssue || "none";

  const cautions = [
    "새 제품은 한 번에 여러 개 바꾸지 말고, 하나씩 추가하는 게 좋아요.",
    "처음 3~5일은 양을 적게 사용하면서 따가움, 붉어짐, 트러블 변화를 확인하세요.",
  ];

  if (skinType.includes("민감")) {
    cautions.push("민감함이 느껴질 때는 각질 제거 제품보다 보습·진정 제품을 우선하세요.");
  }

  if (mainIssue === "inflammatory_acne") {
    cautions.push("통증, 고름, 흉터가 있으면 자가 관리보다 피부과 상담이 더 안전할 수 있어요.");
  }

  if (mainIssue === "blackhead_sebum" || mainIssue === "closed_comedones") {
    cautions.push("피지가 고민이어도 세안을 너무 강하게 하면 오히려 건조함과 번들거림이 심해질 수 있어요.");
  }

  return cautions;
}
function analyzeInflammatoryAcneGuide(answers = {}) {
  const area = answers.area?.value || "";
  const form = answers.form?.value || "";
  const pain = answers.pain?.value || "";
  const recurring = answers.recurring?.value || "";
  const recentProduct = answers.recentProduct?.value || "";
  const shaving = answers.shaving?.value || "";
  const touching = answers.touching?.value || "";

  const reasons = [];

  if (area === "chin_jaw") {
    reasons.push("턱·턱선 중심으로 트러블이 나타남");
  }

  if (area === "multiple") {
    reasons.push("여러 부위에서 동시에 트러블이 나타남");
  }

  if (form === "pustule") {
    reasons.push("노란 고름이 보이는 염증성 형태");
  }

  if (form === "nodule") {
    reasons.push("속에서 딱딱하고 크게 만져지는 형태");
  }

  if (form === "cluster") {
    reasons.push("여러 개의 염증이 몰려서 나타나는 형태");
  }

  if (pain === "mild") {
    reasons.push("누르면 통증이 있음");
  }

  if (pain === "strong") {
    reasons.push("가만히 있어도 통증이 있음");
  }

  if (recurring === "recurring") {
    reasons.push("같은 부위에 반복적으로 발생함");
  }

  if (recurring === "continuous") {
    reasons.push("새로운 트러블이 거의 계속 발생함");
  }

  if (recentProduct !== "" && recentProduct !== "none") {
    reasons.push("최근 2~4주 사이 화장품 변경이 있었음");
  }

  if (shaving === "daily") {
    reasons.push("트러블 부위를 거의 매일 면도함");
  }

  if (touching === "often") {
    reasons.push("트러블 부위를 자주 만지는 편");
  }

  if (touching === "squeeze") {
    reasons.push("고름이 보이면 직접 짜는 편");
  }

  // 진료를 우선해서 생각할 신호
  const clinicPriority =
    (form === "nodule" && pain === "strong") ||
    (form === "cluster" && pain === "strong") ||
    (
      recurring === "continuous" &&
      ["nodule", "cluster"].includes(form)
    ) ||
    (
      recurring === "continuous" &&
      area === "multiple"
    );

  if (clinicPriority) {
    return {
      careLevel: "clinic_priority",
      badge: "🔴 진료 우선",
      title: "자가 관리만 계속하기보다 진료를 우선해서 고려해보세요.",
      summary:
        "깊은 형태, 강한 통증, 넓은 범위 또는 지속적인 염증이 함께 나타나는 경우 화장품이나 약국 제품만 추가하기보다 현재 상태를 정확히 확인하는 편이 좋아요.",
      reasons,
      pharmacyGuide: null,
    };
  }

  // 약국 일반의약품을 고려해볼 수 있는 신호
  const pharmacyConsider =
    form === "pustule" ||
    pain === "mild" ||
    recurring === "recurring" ||
    recurring === "continuous";

  if (pharmacyConsider) {
    return {
      careLevel: "pharmacy_consider",
      badge: "🟡 약국 관리 고려",
      title: "기본 루틴과 함께 여드름 일반의약품을 고려해볼 수 있어요.",
      summary:
        "현재 답변에서는 단순 보습 관리만 하기보다 염증성 여드름에 사용되는 일반의약품을 추가로 알아볼 수 있는 상태로 보여요.",
      reasons,

      pharmacyGuide: {
        ingredient: "과산화벤조일 2.5%",
        example: "벤작에이씨겔 2.5%",
        type: "일반의약품",

        purpose:
          "보통여드름 치료에 사용하는 외용 일반의약품이에요.",

        directions: [
          "환부를 깨끗이 씻은 뒤 사용하는 외용제예요.",
          "치료를 시작할 때는 보통 취침 전 하루 1회부터 사용해 적응 여부를 확인해요.",
          "잘 적응하는 경우 허가사항에서는 아침·저녁 하루 2회까지 늘릴 수 있도록 안내하고 있어요.",
          "민감한 피부는 하루 1회 취침 전 사용이 권장돼요.",
        ],

        routineExample: [
          "순한 세안",
          "피부가 편안한 상태인지 확인",
          "과산화벤조일 제품 사용",
          "필요하면 자극이 적은 보습제로 마무리",
        ],

        cautions: [
          "눈에 들어가지 않도록 주의하고 사용 후 손을 씻어주세요.",
          "외용으로만 사용해야 해요.",
          "처음 사용할 때 건조함이나 자극감이 생길 수 있어요.",
          "자극이 지속되거나 심해지면 사용을 중단하고 상태를 확인하세요.",
          "깊고 심하게 아픈 트러블이나 넓게 반복되는 염증에는 약국 제품만 계속 추가하지 않는 편이 좋아요.",
        ],
      },
    };
  }



  return {
    careLevel: "basic_care",
    badge: "🟢 기본 관리 우선",
    title: "우선은 기본 루틴을 단순하게 유지하면서 변화를 확인해보세요.",
    summary:
      "현재 답변에서는 강한 통증이나 지속적으로 악화되는 신호가 두드러지지 않아 기본적인 세안·보습과 생활 습관부터 정리해보는 방향이 좋아 보여요.",
    reasons,
    pharmacyGuide: null,
  };
}
function analyzeClosedComedoneGuide(
  answers = {},
  skinResult = {}
) {
  const area = answers.area?.value || "";
  const appearance = answers.appearance?.value || "";
  const inflammation = answers.inflammation?.value || "";
  const duration = answers.duration?.value || "";
  const recentProduct = answers.recentProduct?.value || "";
  const exfoliation = answers.exfoliation?.value || "";
  const touching = answers.touching?.value || "";

  const reasons = [];

  if (area === "forehead") {
    reasons.push("이마 중심으로 좁쌀이 나타남");
  }

  if (area === "cheek") {
    reasons.push("볼 중심으로 오돌토돌함이 나타남");
  }

  if (area === "chin_jaw") {
    reasons.push("턱·턱선 중심으로 좁쌀이 나타남");
  }

  if (area === "multiple") {
    reasons.push("여러 부위에서 동시에 나타남");
  }

  if (appearance === "skin_colored") {
    reasons.push("피부색의 작은 돌기 형태");
  }

  if (appearance === "white_bumps") {
    reasons.push("하얀 작은 돌기 형태");
  }

  if (appearance === "mixed_inflammation") {
    reasons.push("좁쌀과 붉은 트러블이 함께 나타남");
  }

  if (inflammation === "sometimes_red") {
    reasons.push("일부가 가끔 붉게 변함");
  }

  if (inflammation === "painful") {
    reasons.push("붉어짐과 통증이 함께 나타남");
  }

  if (duration === "long") {
    reasons.push("6주 이상 지속되고 있음");
  }

  if (duration === "chronic") {
    reasons.push("몇 달째 반복되고 있음");
  }

  if (
    ["cream", "sunscreen", "oil", "multiple"].includes(
      recentProduct
    )
  ) {
    reasons.push("좁쌀이 늘기 전 제품 변경이 있었음");
  }

  if (exfoliation === "frequent") {
    reasons.push("각질 관리 제품을 자주 사용 중");
  }

  if (exfoliation === "multiple") {
    reasons.push("여러 각질 관리 제품을 동시에 사용 중");
  }

  if (touching === "squeeze" || touching === "tool") {
    reasons.push("좁쌀을 직접 압출하는 편");
  }

  const sensitive =
    skinResult.skinType?.includes("민감") ||
    (skinResult.scores?.sensitivity ?? 0) >= 2;

  // 🔴 진료 우선
  const clinicPriority =
    (
      inflammation === "painful" &&
      ["long", "chronic"].includes(duration)
    ) ||
    (
      inflammation === "painful" &&
      area === "multiple"
    );

  if (clinicPriority) {
    return {
      careLevel: "clinic_priority",

      badge: "🔴 진료 우선",

      title:
        "단순한 좁쌀 관리보다 염증성 트러블 여부를 먼저 확인하는 게 좋아요.",

      summary:
        "좁쌀처럼 보이는 병변에 붉어짐과 통증이 반복되거나 여러 부위에서 오래 지속된다면 단순한 각질·피지 문제만으로 보기 어려울 수 있어요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 각질 관리 과사용
  const overExfoliating =
    exfoliation === "frequent" ||
    exfoliation === "multiple";

  if (overExfoliating) {
    return {
      careLevel: "basic_care",

      badge: "🟢 루틴 정리 우선",

      title:
        "각질 관리 제품을 더 추가하기보다 현재 사용 빈도를 먼저 줄여보세요.",

      summary:
        "이미 BHA나 각질 관리 제품을 자주 사용하고 있다면 추가적인 살리실산 사용보다 피부 자극과 건조 여부를 먼저 확인하는 편이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 새 제품 추가 직후 발생
  const productChange =
    ["cream", "sunscreen", "oil", "multiple"].includes(
      recentProduct
    );

  if (
    productChange &&
    duration === "recent"
  ) {
    return {
      careLevel: "basic_care",

      badge: "🟢 루틴 조정 우선",

      title:
        "최근 추가한 제품과 발생 시점의 관계부터 확인해보세요.",

      summary:
        "최근 제품을 바꾼 뒤 좁쌀이 늘었다면 새 기능성 제품을 바로 추가하기보다 변경한 제품을 하나씩 확인하는 편이 원인을 좁히기 쉬워요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 민감 + 붉어짐
  if (
    sensitive &&
    inflammation !== "none"
  ) {
    return {
      careLevel: "basic_care",

      badge: "🟢 자극 최소화 우선",

      title:
        "현재는 각질 제거보다 피부를 편안하게 만드는 게 먼저예요.",

      summary:
        "민감도가 높은 피부에서 붉어짐까지 있다면 살리실산 같은 각질 관리 제품을 바로 추가하기보다 자극을 줄이고 피부 상태를 먼저 안정시키는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟡 살리실산 고려
  const pharmacyConsider =
    inflammation === "none" &&
    (
      duration === "weeks" ||
      duration === "long" ||
      duration === "chronic"
    );

  if (pharmacyConsider) {
    return {
      careLevel: "pharmacy_consider",

      badge: "🟡 약국 관리 고려",

      title:
        "막힘과 좁쌀이 지속된다면 살리실산 계열 일반의약품을 알아볼 수 있어요.",

      summary:
        "붉거나 아픈 염증보다는 피부색 또는 하얀 좁쌀이 지속되는 형태라면 각질화된 피부를 연화시키는 살리실산 계열 여드름 치료제를 고려할 수 있어요.",

      reasons,

      pharmacyGuide: {
        ingredient: "살리실산 2%",

        example: "애크린겔",

        type: "일반의약품",

        purpose:
          "각질화된 피부를 연화시켜 여드름 치료에 사용하는 외용 일반의약품이에요.",

        directions: [
          "환부와 주변을 깨끗하게 한 뒤 외용으로 사용해요.",
          "허가사항상 아침·저녁 하루 2회 사용하도록 되어 있어요.",
          "과도한 피부 건조를 줄이기 위해 처음에는 하루 1회로 시작하도록 안내돼 있어요.",
          "건조하거나 피부가 벗겨지면 이틀에 한 번으로 사용 횟수를 줄일 수 있어요.",
        ],

        routineExample: [
          "순한 세안",
          "피부를 편안하게 건조",
          "살리실산 제품",
          "가벼운 보습",
        ],

        cautions: [
          "눈 주위와 점막에는 사용하지 않아요.",
          "붉거나 염증·자극이 있는 부위에는 사용하지 않아요.",
          "외용으로만 사용하고 사용 후에는 손을 씻어주세요.",
          "건조, 벗겨짐 또는 자극이 지속되면 사용을 줄이거나 중단하세요.",
          "이미 BHA나 다른 각질 제거 제품을 많이 사용 중이라면 겹쳐서 추가하지 않는 편이 좋아요.",
        ],
      },
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 기본 관리 우선",

    title:
      "우선은 제품 수와 사용량을 단순하게 유지하면서 피부 반응을 확인해보세요.",

    summary:
      "최근 발생한 가벼운 오돌토돌함이라면 바로 각질 제거제를 추가하기보다 현재 루틴을 단순하게 유지하면서 변화를 확인하는 방향이 좋아요.",

    reasons,

    pharmacyGuide: null,
  };
}

function analyzeBlackheadSebumGuide(
  answers = {},
  skinResult = {}
) {
  const area = answers.area?.value || "";
  const appearance = answers.appearance?.value || "";
  const returnSpeed = answers.returnSpeed?.value || "";
  const oiliness = answers.oiliness?.value || "";
  const afterWash = answers.afterWash?.value || "";
  const cleansingOil = answers.cleansingOil?.value || "";
  const exfoliation = answers.exfoliation?.value || "";
  const squeezing = answers.squeezing?.value || "";
  const inflammation = answers.inflammation?.value || "";

  const reasons = [];

  if (area === "nose") {
    reasons.push("코 중심으로 피지가 보임");
  }

  if (area === "nose_cheek") {
    reasons.push("코와 나비존 중심으로 피지가 보임");
  }

  if (area === "tzone") {
    reasons.push("T존 중심으로 피지가 많음");
  }

  if (area === "multiple") {
    reasons.push("여러 부위에서 피지가 신경 쓰임");
  }

  if (appearance === "black_plug") {
    reasons.push("검은 점처럼 막힌 형태가 보임");
  }

  if (appearance === "sebaceous_filament") {
    reasons.push("촘촘한 회색·노란 피지 형태가 보임");
  }

  if (appearance === "pore_sebum") {
    reasons.push("모공과 피지가 함께 신경 쓰임");
  }

  if (
    returnSpeed === "fast" ||
    returnSpeed === "very_fast"
  ) {
    reasons.push("제거하거나 세안해도 피지가 빠르게 다시 보임");
  }

  if (
    oiliness === "high" ||
    oiliness === "very_high"
  ) {
    reasons.push("유분이 빠르게 올라오는 편");
  }

  if (
    afterWash === "mild_tight" ||
    afterWash === "tight"
  ) {
    reasons.push("세안 후 당김이 있음");
  }

  if (cleansingOil === "unsure") {
    reasons.push("클렌징오일 유화 방법이 불확실함");
  }

  if (cleansingOil === "long_massage") {
    reasons.push("클렌징오일을 오래 마사지하는 편");
  }

  if (exfoliation === "frequent") {
    reasons.push("각질 관리 빈도가 높은 편");
  }

  if (exfoliation === "multiple") {
    reasons.push("여러 각질 관리 제품을 동시에 사용함");
  }

  if (
    squeezing === "often" ||
    squeezing === "tool"
  ) {
    reasons.push("피지를 자주 직접 압출하는 편");
  }

  if (inflammation === "frequent") {
    reasons.push("붉고 아픈 트러블이 자주 동반됨");
  }

  const sensitive =
    skinResult.skinType?.includes("민감") ||
    (skinResult.scores?.sensitivity ?? 0) >= 2;

  // 🔴 블랙헤드보다 염증 문제가 우선
  if (inflammation === "frequent") {
    return {
      careLevel: "clinic_priority",

      badge: "🔴 염증 관리 우선",

      title:
        "현재는 블랙헤드보다 반복되는 염증성 트러블을 먼저 확인하는 게 좋아요.",

      summary:
        "피지나 모공 문제와 함께 붉고 아픈 트러블이 자주 생긴다면 각질 제거 제품을 계속 추가하기보다 염증 상태를 먼저 관리하는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 과한 각질 관리
  if (
    exfoliation === "frequent" ||
    exfoliation === "multiple"
  ) {
    return {
      careLevel: "basic_care",

      badge: "🟢 각질 관리 줄이기",

      title:
        "BHA를 더 추가하기보다 현재 각질 관리 빈도를 먼저 줄여보세요.",

      summary:
        "각질 관리 제품을 이미 자주 사용하고 있다면 추가적인 산 성분보다 건조함과 자극 여부를 먼저 확인하는 게 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 세안 후 심한 당김
  if (
    afterWash === "tight" ||
    (
      sensitive &&
      afterWash === "mild_tight"
    )
  ) {
    return {
      careLevel: "basic_care",

      badge: "🟢 세안·보습 조정 우선",

      title:
        "피지를 더 제거하기보다 세안 후 당김부터 줄이는 게 좋아요.",

      summary:
        "피지가 보여도 세안 후 피부가 많이 당긴다면 강한 세정이나 각질 관리를 추가하기 전에 세안 강도와 보습 밸런스를 먼저 조정해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 피지실에 가까운 패턴
  const filamentPattern =
    appearance === "sebaceous_filament" &&
    (
      returnSpeed === "fast" ||
      returnSpeed === "very_fast"
    );

  if (filamentPattern) {
    return {
      careLevel: "basic_care",

      badge: "🟢 피지 관리 우선",

      title:
        "완전히 제거하려 하기보다 눈에 덜 띄게 관리하는 방향이 좋아 보여요.",

      summary:
        "촘촘한 피지가 제거 후 빠르게 다시 보이는 패턴은 피지실에 가까울 가능성도 있어요. 반복 압출보다는 과도한 피지를 줄이고 피부를 자극하지 않는 관리가 더 적합할 수 있어요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 클렌징오일 사용법 조정
  if (
    cleansingOil === "unsure" ||
    cleansingOil === "long_massage"
  ) {
    return {
      careLevel: "basic_care",

      badge: "🟢 클렌징 방법 점검",

      title:
        "새 제품을 추가하기 전에 클렌징오일 사용 방법부터 조정해보세요.",

      summary:
        "클렌징오일은 오래 문지르기보다 짧게 사용하고, 물을 묻혀 충분히 유화한 뒤 헹구는 방식으로 사용하는 편이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟡 막힌 블랙헤드가 지속될 때 살리실산 고려
  const salicylicConsider =
    appearance === "black_plug" &&
    inflammation === "none" &&
    exfoliation === "none";

  if (salicylicConsider) {
    return {
      careLevel: "pharmacy_consider",

      badge: "🟡 약국 관리 고려",

      title:
        "막힌 형태의 블랙헤드가 지속된다면 살리실산 계열 여드름 치료제를 알아볼 수 있어요.",

      summary:
        "검은 점처럼 막힌 피지가 반복되고 붉거나 아픈 염증은 없다면 살리실산 계열 외용 일반의약품을 하나의 선택지로 볼 수 있어요.",

      reasons,

      pharmacyGuide: {
        ingredient: "살리실산 2%",
        example: "애크린겔",
        type: "일반의약품",

        purpose:
          "각질화된 피부를 연화시켜 여드름 치료에 사용하는 외용 일반의약품이에요.",

        directions: [
          "환부와 주변을 깨끗하게 한 뒤 외용으로 사용해요.",
          "허가사항상 아침·저녁 하루 2회 사용하도록 되어 있어요.",
          "과도한 건조 가능성 때문에 처음에는 하루 1회로 시작하도록 안내돼 있어요.",
          "피부 건조나 벗겨짐이 나타나면 이틀에 한 번으로 사용 횟수를 줄일 수 있어요.",
        ],

        routineExample: [
          "순한 세안",
          "피부를 편안하게 건조",
          "살리실산 제품",
          "가벼운 보습",
        ],

        cautions: [
          "눈 주위와 점막에는 사용하지 않아요.",
          "붉거나 염증·자극이 있는 부위에는 사용하지 않아요.",
          "다른 BHA나 강한 각질 제거 제품과 겹쳐 쓰는 것은 피하는 편이 좋아요.",
          "건조함이나 자극이 지속되면 사용을 줄이거나 중단하세요.",
          "증상이 계속 악화되면 블랙헤드만의 문제인지 다시 확인하는 게 좋아요.",
        ],
      },
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 기본 피지 관리",

    title:
      "우선은 과하게 제거하지 않고 피지와 수분 밸런스를 맞춰보세요.",

    summary:
      "현재 답변에서는 강한 각질 관리나 반복적인 압출보다 순한 세안, 적절한 보습, 피지 관리 습관부터 조정하는 방향이 좋아 보여요.",

    reasons,

    pharmacyGuide: null,
  };
}
function analyzeDehydrationGuide(
  answers = {},
  skinResult = {}
) {
  const afterWash = answers.afterWash?.value || "";
  const daytimeTightness =
    answers.daytimeTightness?.value || "";
  const oiliness = answers.oiliness?.value || "";
  const moisturizerResponse =
    answers.moisturizerResponse?.value || "";
  const flaking = answers.flaking?.value || "";
  const irritation = answers.irritation?.value || "";
  const cleansing = answers.cleansing?.value || "";
  const waterTemp = answers.waterTemp?.value || "";

  const reasons = [];

  if (
    afterWash === "strong" ||
    afterWash === "very_strong"
  ) {
    reasons.push("세안 직후 당김이 강함");
  }

  if (
    daytimeTightness === "often" ||
    daytimeTightness === "continuous"
  ) {
    reasons.push("시간이 지나도 속당김이 지속됨");
  }

  if (
    oiliness === "high" ||
    oiliness === "very_high"
  ) {
    reasons.push("속당김과 번들거림이 함께 나타남");
  }

  if (moisturizerResponse === "short") {
    reasons.push("보습 후에도 당김이 빠르게 다시 나타남");
  }

  if (moisturizerResponse === "poor") {
    reasons.push("보습제를 발라도 건조감이 충분히 줄지 않음");
  }

  if (moisturizerResponse === "heavy") {
    reasons.push("보습제를 많이 바르면 답답하게 느껴짐");
  }

  if (flaking === "visible") {
    reasons.push("눈에 보이는 각질이 동반됨");
  }

  if (flaking === "severe") {
    reasons.push("심한 각질이나 갈라짐이 동반됨");
  }

  if (irritation === "frequent") {
    reasons.push("따가움이나 붉어짐이 자주 있음");
  }

  if (irritation === "strong") {
    reasons.push("강한 화끈거림이나 불편감이 있음");
  }

  if (
    cleansing === "strong" ||
    cleansing === "frequent" ||
    cleansing === "harsh"
  ) {
    reasons.push("세안 강도가 높은 편");
  }

  if (waterTemp === "hot") {
    reasons.push("뜨거운 물로 세안하는 편");
  }

  // 🔴 강한 자극/손상 신호
  const irritationPriority =
    irritation === "strong" ||
    (
      flaking === "severe" &&
      irritation === "frequent"
    );

  if (irritationPriority) {
    return {
      careLevel: "clinic_priority",

      badge: "🔴 피부 자극 확인 우선",

      title:
        "단순한 수분 부족보다 피부 자극이나 손상 신호를 먼저 확인하는 게 좋아요.",

      summary:
        "심한 화끈거림, 반복되는 붉어짐, 갈라짐이나 심한 벗겨짐이 함께 있다면 기능성 제품을 추가하기보다 피부를 자극하는 요소를 줄이고 상태를 먼저 확인하는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟢 세안 과다
  const overCleansing =
    cleansing === "strong" ||
    cleansing === "frequent" ||
    cleansing === "harsh" ||
    waterTemp === "hot";

  if (overCleansing) {
    return {
      careLevel: "basic_care",

      badge: "🟢 세안 조정 우선",

      title:
        "보습제를 더 추가하기 전에 세안 습관부터 부드럽게 바꿔보세요.",

      summary:
        "강한 세안, 잦은 세안, 뜨거운 물은 세안 후 당김을 더 크게 느끼게 할 수 있어요. 우선 세안 강도를 줄이고 미지근한 물을 사용하면서 피부 반응을 확인해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟢 속은 건조 + 겉은 유분
  const dehydratedOilyPattern =
    (
      daytimeTightness === "often" ||
      daytimeTightness === "continuous"
    ) &&
    (
      oiliness === "high" ||
      oiliness === "very_high"
    );

  if (dehydratedOilyPattern) {
    return {
      careLevel: "basic_care",

      badge: "🟢 가벼운 수분 보충 우선",

      title:
        "속은 당기지만 겉은 번들거리는 패턴이에요.",

      summary:
        "유분이 많다고 보습을 완전히 줄이기보다 가벼운 토너나 세럼으로 수분을 채우고, 무거운 크림은 사용량을 조절하는 방향이 잘 맞을 수 있어요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟢 보습 유지력이 부족한 경우
  const needsBarrierSupport =
    moisturizerResponse === "short" ||
    moisturizerResponse === "poor" ||
    flaking === "visible";

  if (needsBarrierSupport) {
    return {
      careLevel: "basic_care",

      badge: "🟢 보습·장벽 보강",

      title:
        "수분을 넣는 것뿐 아니라 수분이 날아가지 않게 잡아주는 단계가 필요해 보여요.",

      summary:
        "토너나 세럼만 여러 번 바르기보다 마지막 단계에서 보습제를 충분히 사용하고, 피부가 편안한 범위에서 장벽 중심 제품을 함께 보는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🟢 보습제가 너무 무거운 경우
  if (moisturizerResponse === "heavy") {
    return {
      careLevel: "basic_care",

      badge: "🟢 가벼운 보습 조정",

      title:
        "보습이 필요하지만 현재 사용하는 제형은 조금 무거울 수 있어요.",

      summary:
        "속당김 때문에 크림을 많이 바르다 답답해진다면 크림 양만 늘리기보다 가벼운 수분 세럼과 적당량의 크림으로 나누어 보습하는 방법을 고려해볼 수 있어요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 기본 수분 관리",

    title:
      "현재는 기본적인 수분 보충과 보습 유지부터 맞춰보는 게 좋아요.",

    summary:
      "세안 후 너무 오래 피부를 방치하지 말고 수분 제품을 바른 뒤, 피부 타입에 맞는 보습제로 마무리하면서 당김 변화를 확인해보세요.",

    reasons,

    pharmacyGuide: null,
  };
}

function analyzeOilinessGuide(
  answers = {},
  skinResult = {}
) {
  const area = answers.area?.value || "";
  const timing = answers.timing?.value || "";
  const afterWash = answers.afterWash?.value || "";
  const moisturizer = answers.moisturizer?.value || "";
  const cleansing = answers.cleansing?.value || "";
  const clogged = answers.clogged?.value || "";
  const inflammation = answers.inflammation?.value || "";

  const reasons = [];

  if (area === "tzone") {
    reasons.push("T존 중심으로 번들거림이 나타남");
  }

  if (area === "whole_face") {
    reasons.push("얼굴 전체적으로 유분이 많이 올라옴");
  }

  if (
    timing === "fast" ||
    timing === "very_fast"
  ) {
    reasons.push("세안 후 비교적 빠르게 유분이 올라옴");
  }

  if (
    afterWash === "tight_oily" ||
    afterWash === "very_tight"
  ) {
    reasons.push("세안 직후에는 당기는데 이후 번들거림이 나타남");
  }

  if (
    moisturizer === "heavy" ||
    moisturizer === "very_heavy"
  ) {
    reasons.push("현재 보습제가 무겁거나 답답하게 느껴짐");
  }

  if (
    cleansing === "strong" ||
    cleansing === "frequent" ||
    cleansing === "harsh"
  ) {
    reasons.push("유분 때문에 세안을 강하게 하는 편");
  }

  if (clogged === "frequent") {
    reasons.push("번들거림과 함께 좁쌀·막힘이 자주 생김");
  }

  if (clogged === "blackhead") {
    reasons.push("블랙헤드와 피지도 함께 신경 쓰임");
  }

  if (inflammation === "frequent") {
    reasons.push("붉은 트러블도 자주 동반됨");
  }

  const baselineSensitive =
    skinResult.skinType?.includes("민감") ||
    (skinResult.scores?.sensitivity ?? 0) >= 2;

  // 염증성 트러블이 더 중요한 경우
  if (inflammation === "frequent") {
    return {
      careLevel: "basic_care",

      badge: "🟢 트러블 상태 확인 우선",

      title:
        "현재는 단순한 유분 조절보다 반복되는 붉은 트러블을 함께 확인하는 게 좋아요.",

      summary:
        "번들거림과 함께 붉은 트러블이 자주 생긴다면 무조건 피지를 제거하는 방향보다 염증성 여드름 상태를 별도로 확인하고 루틴을 조정하는 편이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 과도한 세안
  const overCleansing =
    cleansing === "strong" ||
    cleansing === "frequent" ||
    cleansing === "harsh";

  if (overCleansing) {
    return {
      careLevel: "basic_care",

      badge: "🟢 세안 강도 조정",

      title:
        "유분을 줄이려고 너무 강하게 세안하고 있지는 않은지 먼저 확인해보세요.",

      summary:
        "뽀득한 세안이나 지나치게 잦은 세안은 피부를 불편하게 만들 수 있어요. 순한 세안제로 짧게 씻고 이후 번들거림이 어떻게 변하는지 보는 방향이 좋아요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 속건조 + 유분
  const dehydratedOiliness =
    (
      afterWash === "tight_oily" ||
      afterWash === "very_tight"
    ) &&
    (
      timing === "fast" ||
      timing === "very_fast"
    );

  if (dehydratedOiliness) {
    return {
      careLevel: "basic_care",

      badge: "🟢 수분 밸런스 우선",

      title:
        "유분은 많지만 속당김도 함께 있는 패턴이에요.",

      summary:
        "유분 때문에 보습을 완전히 줄이기보다 가벼운 수분 제품을 사용하고, 무거운 크림의 양을 줄이는 식으로 유수분 밸런스를 맞춰보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 보습제가 너무 무거움
  if (
    moisturizer === "heavy" ||
    moisturizer === "very_heavy"
  ) {
    return {
      careLevel: "basic_care",

      badge: "🟢 제형 가볍게 조정",

      title:
        "현재 사용하는 보습 제품이 피부에 조금 무거울 수 있어요.",

      summary:
        "크림을 아예 빼기보다 사용량을 줄이거나 더 가벼운 젤크림·로션 제형으로 바꾸면서 번들거림 변화를 확인해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 모공 막힘/블랙헤드 쪽이 더 뚜렷함
  if (
    clogged === "frequent" ||
    clogged === "blackhead"
  ) {
    return {
      careLevel: "basic_care",

      badge: "🟢 피지·막힘 관리",

      title:
        "단순 번들거림보다 피지와 모공 막힘을 함께 관리하는 방향이 좋아 보여요.",

      summary:
        "강한 세안이나 반복 압출보다는 가벼운 보습을 유지하면서 블랙헤드·피지 관리 방향을 함께 확인해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 민감 피부
  if (baselineSensitive) {
    return {
      careLevel: "basic_care",

      badge: "🟢 산뜻한 진정 관리",

      title:
        "유분을 줄이더라도 피부 자극을 최소화하는 방향이 중요해요.",

      summary:
        "민감 경향이 있다면 강한 피지 제거 제품보다 순한 세안과 가벼운 수분·진정 제품으로 번들거림을 조절해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 기본 유분 밸런스 관리",

    title:
      "현재는 제품 제형과 사용량을 가볍게 조정하는 것부터 시작해보세요.",

    summary:
      "유분이 많다고 보습을 완전히 없애기보다 산뜻한 수분 제품을 유지하고, 무거운 제품과 과도한 세안을 줄이면서 피부 반응을 확인해보세요.",

    reasons,

    pharmacyGuide: null,
  };
}

function analyzeSensitivityRednessGuide(
  answers = {}
) {
  const trigger = answers.trigger?.value || "";
  const sensation = answers.sensation?.value || "";
  const duration = answers.duration?.value || "";
  const skinDamage = answers.skinDamage?.value || "";
  const swelling = answers.swelling?.value || "";
  const breathing = answers.breathing?.value || "";
  const recentProduct = answers.recentProduct?.value || "";
  const actives = answers.actives?.value || "";
  const moisturizerSting =
    answers.moisturizerSting?.value || "";

  const reasons = [];

  if (trigger === "new_product") {
    reasons.push("새 제품 사용 후 증상이 시작됨");
  }

  if (trigger === "after_wash") {
    reasons.push("세안 후 붉어짐이나 따가움이 나타남");
  }

  if (trigger === "active_product") {
    reasons.push("기능성 제품 사용 후 불편감이 나타남");
  }

  if (sensation === "stinging") {
    reasons.push("따끔거리거나 따가운 느낌이 있음");
  }

  if (sensation === "burning") {
    reasons.push("화끈거림이나 열감이 있음");
  }

  if (sensation === "itching") {
    reasons.push("가려움이 함께 나타남");
  }

  if (
    duration === "half_day" ||
    duration === "days"
  ) {
    reasons.push("붉어짐이나 불편감이 오래 지속됨");
  }

  if (skinDamage === "dry") {
    reasons.push("피부가 건조하고 거칠어짐");
  }

  if (skinDamage === "flaking") {
    reasons.push("각질이나 갈라짐이 동반됨");
  }

  if (skinDamage === "blister_oozing") {
    reasons.push("물집·진물·벗겨짐이 동반됨");
  }

  if (swelling === "mild") {
    reasons.push("붓기가 동반됨");
  }

  if (swelling === "eyes_lips") {
    reasons.push("눈 주변 또는 입술 붓기가 동반됨");
  }

  if (breathing === "difficulty") {
    reasons.push("호흡 또는 삼킴 불편감이 있었음");
  }

  if (recentProduct !== "" && recentProduct !== "none") {
    reasons.push("최근 새 화장품을 추가함");
  }

  if (actives === "multiple") {
    reasons.push("여러 기능성 제품을 함께 사용 중");
  }

  if (moisturizerSting === "frequent") {
    reasons.push("순한 보습제도 자주 따가움");
  }

  // 🚨 응급 평가가 필요한 신호
  if (breathing === "difficulty") {
    return {
      careLevel: "clinic_priority",

      badge: "🚨 즉시 진료 필요",

      title:
        "화장품 사용을 계속하면서 지켜볼 상황은 아니에요.",

      summary:
        "눈이나 입술의 붓기와 함께 숨쉬기 또는 삼키기가 불편했다면 심한 알레르기 반응 가능성을 포함해 즉시 의료 평가가 필요한 신호예요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 🔴 피부과 진료 우선
  const clinicPriority =
    skinDamage === "blister_oozing" ||
    (
      swelling === "eyes_lips" &&
      duration !== "minutes"
    ) ||
    (
      sensation === "burning" &&
      duration === "days"
    );

  if (clinicPriority) {
    return {
      careLevel: "clinic_priority",

      badge: "🔴 진료 우선",

      title:
        "단순한 민감 피부 관리보다 피부 상태를 먼저 확인하는 편이 좋아요.",

      summary:
        "물집, 진물, 벗겨진 피부, 지속적인 심한 화끈거림 또는 눈·입술 주변 붓기가 있다면 새 기능성 제품을 추가하기보다 현재 상태를 확인하는 게 우선이에요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 새 제품 이후 증상
  const recentProductReaction =
    trigger === "new_product" ||
    recentProduct === "multiple" ||
    (
      recentProduct !== "none" &&
      duration !== "minutes"
    );

  if (recentProductReaction) {
    return {
      careLevel: "basic_care",

      badge: "🟢 새 제품 점검 우선",

      title:
        "최근 추가한 제품부터 하나씩 확인하는 게 좋아요.",

      summary:
        "새 제품을 사용한 뒤 붉어짐이나 따가움이 시작됐다면 기능성 제품을 추가하기보다 최근 변경한 제품을 우선 중단하고, 피부가 편안해진 뒤 제품을 하나씩 다시 확인하는 방향이 원인을 좁히기 쉬워요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 기능성 과사용
  const activeOverload =
    actives === "multiple" ||
    (
      ["acid", "retinoid", "acne_active"].includes(actives) &&
      ["stinging", "burning"].includes(sensation)
    );

  if (activeOverload) {
    return {
      careLevel: "basic_care",

      badge: "🟢 기능성 줄이기",

      title:
        "현재는 기능성 제품을 더 추가하기보다 자극을 줄이는 게 먼저예요.",

      summary:
        "각질 관리, 레티놀, 여드름 기능성 제품을 사용하는 중 따가움이나 화끈거림이 있다면 기능성 사용을 잠시 줄이고 순한 세안과 보습 중심으로 루틴을 단순하게 만들어보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  // 장벽 자극 가능성
  const barrierIrritation =
    moisturizerSting === "frequent" ||
    skinDamage === "flaking" ||
    (
      sensation === "stinging" &&
      duration !== "minutes"
    );

  if (barrierIrritation) {
    return {
      careLevel: "basic_care",

      badge: "🟢 진정·장벽 관리 우선",

      title:
        "현재는 기능성보다 피부가 편안해지는 기본 루틴이 더 중요해 보여요.",

      summary:
        "평소 사용하던 보습제까지 따갑거나 각질·갈라짐이 함께 있다면 자극적인 성분을 줄이고 순한 세안, 보습, 자외선 차단 중심으로 단순하게 관리해보세요.",

      reasons,

      pharmacyGuide: null,
    };
  }

  return {
    careLevel: "basic_care",

    badge: "🟢 민감 자극 최소화",

    title:
      "현재는 자극 요소를 줄이면서 피부 반응을 관찰해보세요.",

    summary:
      "일시적인 붉어짐 위주라면 새 제품을 한꺼번에 여러 개 추가하지 말고 순한 세안과 보습 중심으로 유지하면서 어떤 상황에서 붉어지는지 확인해보는 게 좋아요.",

    reasons,

    pharmacyGuide: null,
  };
}

function SurveyResultOverview({ result }) {
  if (!result) return null;

  const levelInfo = getLevelDescription(result.hydrationLevel);
  const directions = getCareDirections(result);
  const cautions = getResultCautions(result);
 const reasons =
  result.issueGuide?.reasons?.length
    ? result.issueGuide.reasons.slice(0, 6)
    : Array.isArray(result.reasons)
    ? result.reasons.slice(0, 6)
    : [];

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] bg-slate-950 text-white p-6 sm:p-7 shadow-lg">
        <p className="text-sm text-slate-300 mb-2">설문 분석 결과</p>
        <h2 className="text-2xl sm:text-3xl font-black leading-tight">
          지금 피부는{" "}
          <span className="text-emerald-300">{result.skinType}</span> 쪽에 가까워요
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
          답변을 기준으로 피부타입, 수분감 단계, 주요 고민을 함께 봤어요.
          아래 루틴은 처음 시작해도 부담이 적은 방향으로 구성했어요.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">피부 상태</p>
            <p className="mt-1 font-bold">{result.skinType}</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">수분감 단계</p>
            <p className="mt-1 font-bold">{result.hydrationLevel}단계</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">주요 고민</p>
            <p className="mt-1 font-bold">{result.issueLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-[1.7rem] bg-white p-5 sm:p-6 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 mb-2">현재 단계 해석</p>
          <h3 className="text-xl font-black text-slate-900">{levelInfo.title}</h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {levelInfo.desc}
          </p>
        </div>

        <div className="rounded-[1.7rem] bg-white p-5 sm:p-6 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 mb-2">추천 사용 순서</p>
          <h3 className="text-xl font-black text-slate-900">
            클렌저 → 토너 → 세럼 → 크림
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            처음에는 양을 적게 시작하고, 피부가 편안하면 2~3일 간격으로 사용량을 조금씩 맞춰보세요.
          </p>
        </div>
      </div>

      <div className="rounded-[1.7rem] bg-white p-5 sm:p-6 border border-slate-100 shadow-sm">
        <p className="text-xs font-bold text-emerald-600 mb-2">왜 이렇게 판단했나요?</p>
        <h3 className="text-xl font-black text-slate-900 mb-4">
          선택한 답변에서 이런 신호가 보였어요
        </h3>

        {reasons.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <span
                key={reason}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700"
              >
                {reason}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            선택한 답변이 충분하지 않아 기본 루틴 중심으로 추천했어요.
          </p>
        )}
      </div>

      <div className="rounded-[1.7rem] bg-emerald-50 p-5 sm:p-6 border border-emerald-100">
        <p className="text-xs font-bold text-emerald-700 mb-2">관리 방향</p>
        <h3 className="text-xl font-black text-slate-900 mb-4">
          앞으로는 이렇게 관리해보세요
        </h3>

        <div className="space-y-3">
          {directions.map((item) => (
            <div key={item} className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.7rem] bg-amber-50 p-5 sm:p-6 border border-amber-100">
        <p className="text-xs font-bold text-amber-700 mb-2">주의할 점</p>
        <h3 className="text-xl font-black text-slate-900 mb-4">
          처음 2주는 피부 반응을 꼭 확인하세요
        </h3>

        <div className="space-y-3">
          {cautions.map((item) => (
            <div key={item} className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkinIssueGuideCard({ guide }) {
  if (!guide) return null;

  const theme =
    guide.careLevel === "clinic_priority"
      ? {
          box: "bg-rose-50 border-rose-200",
          badge: "text-rose-700 bg-rose-100",
          title: "text-rose-950",
        }
      : guide.careLevel === "pharmacy_consider"
      ? {
          box: "bg-amber-50 border-amber-200",
          badge: "text-amber-700 bg-amber-100",
          title: "text-amber-950",
        }
      : {
          box: "bg-emerald-50 border-emerald-200",
          badge: "text-emerald-700 bg-emerald-100",
          title: "text-emerald-950",
        };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div
        className={`rounded-[2rem] border p-5 sm:p-7 ${theme.box}`}
      >
        <span
          className={`inline-flex rounded-full px-3 py-2 text-sm font-bold mb-4 ${theme.badge}`}
        >
          {guide.badge}
        </span>

        <h3
          className={`text-xl sm:text-2xl font-black leading-relaxed break-keep ${theme.title}`}
        >
          {guide.title}
        </h3>

        <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed break-keep">
          {guide.summary}
        </p>

        {guide.reasons.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-gray-700 mb-3">
              이렇게 판단한 이유
            </p>

            <div className="flex flex-wrap gap-2">
              {guide.reasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-white/80 border border-white px-3 py-2 text-xs sm:text-sm text-gray-700"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {guide.pharmacyGuide && (
        <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-5 sm:p-7">
          <p className="text-sm font-bold text-blue-600 mb-2">
            약국에서 알아볼 수 있는 선택지
          </p>

          <h3 className="text-2xl font-black text-gray-900 break-keep">
            {guide.pharmacyGuide.ingredient}
          </h3>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
              {guide.pharmacyGuide.type}
            </span>

            <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-xs font-semibold">
              예: {guide.pharmacyGuide.example}
            </span>
          </div>

          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            {guide.pharmacyGuide.purpose}
          </p>

          <div className="mt-6">
            <p className="text-sm font-bold text-gray-900 mb-3">
              허가사항 기준 사용법
            </p>

            <div className="space-y-2">
              {guide.pharmacyGuide.directions.map((item) => (
                <p
                  key={item}
                  className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
                >
                  · {item}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-bold text-gray-900 mb-3">
              루틴에 넣는다면
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {guide.pharmacyGuide.routineExample.map(
                (item, index) => (
                  <React.Fragment key={item}>
                    <span className="rounded-full bg-white border border-gray-200 px-3 py-2 text-xs sm:text-sm">
                      {item}
                    </span>

                    {index <
                      guide.pharmacyGuide.routineExample.length -
                        1 && (
                      <span className="text-gray-400">→</span>
                    )}
                  </React.Fragment>
                )
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-100 p-4">
            <p className="text-sm font-bold text-amber-800 mb-3">
              사용 전 꼭 확인
            </p>

            <div className="space-y-2">
              {guide.pharmacyGuide.cautions.map((item) => (
                <p
                  key={item}
                  className="text-sm text-amber-900 leading-relaxed break-keep"
                >
                  · {item}
                </p>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400 leading-relaxed break-keep">
            의약품의 실제 사용은 제품 설명서의 최신 허가사항을 우선해서 확인해주세요.
          </p>
        </div>
      )}
    </div>
  );
}

function FeedbackAdviceCard({ advice }) {
  if (!advice || advice.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="bg-emerald-50 rounded-3xl p-5 sm:p-6 border border-emerald-100">
        <p className="text-sm font-semibold text-emerald-800 mb-3">
          피드백 분석
        </p>

        <ul className="space-y-2">
          {advice.map((item) => (
            <li
              key={item}
              className="text-sm sm:text-base text-emerald-900 leading-relaxed break-keep"
            >
              · {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
function SeoContentSection() {
  const skinTypeGuides = [
    {
      title: "건성 피부 루틴",
      desc: "세안 후 당김이 크고 보습감이 오래가지 않는다면 건성 피부 쪽에 가까울 수 있어요. 이 경우에는 수분을 채우는 것뿐 아니라 크림으로 수분이 날아가지 않게 잡아주는 루틴이 중요해요.",
    },
    {
      title: "수부지 피부 루틴",
      desc: "속은 당기는데 오후가 되면 번들거림이 올라온다면 수부지 피부일 수 있어요. 무조건 유분을 없애기보다 가벼운 수분 제품으로 밸런스를 맞추는 방향이 좋아요.",
    },
    {
      title: "지성 피부 루틴",
      desc: "피지와 번들거림이 많고 무거운 크림이 답답하게 느껴진다면 지성 피부 쪽에 가까울 수 있어요. 산뜻한 토너, 가벼운 세럼, 젤크림 중심의 루틴이 잘 맞을 수 있어요.",
    },
    {
      title: "민감성 피부 루틴",
      desc: "화장품을 바른 뒤 따가움, 붉어짐, 화끈거림이 자주 느껴진다면 민감성 피부일 가능성이 있어요. 기능성 제품보다 진정, 보습, 장벽 관리 위주로 시작하는 것이 좋아요.",
    },
    {
      title: "여드름 피부 루틴",
      desc: "붉은 트러블이나 좁쌀이 반복된다면 제품을 한 번에 여러 개 바꾸기보다 루틴을 단순하게 유지하면서 어떤 제품이 맞지 않는지 확인하는 것이 중요해요.",
    },
    {
      title: "화장품 입문자 루틴",
      desc: "화장품을 처음 시작한다면 클렌저, 토너, 세럼, 크림 순서로 기본 루틴을 잡는 것이 좋아요. 처음부터 기능성 제품을 많이 쓰기보다 피부 반응을 보면서 하나씩 추가하는 것이 안전해요.",
    },
  ];

  const faqList = [
    {
      q: "피부타입을 몰라도 사용할 수 있나요?",
      a: "네. DearSince는 건성, 지성, 수부지 같은 피부타입을 정확히 몰라도 세안 후 당김, 오후 번들거림, 트러블 상태 같은 답변을 바탕으로 현재 피부 상태를 추정해요.",
    },
    {
      q: "추천 루틴은 어떤 기준으로 나오나요?",
      a: "설문 답변을 바탕으로 수분감 단계와 주요 피부 고민을 분석한 뒤 클렌저, 토너, 세럼, 크림 루틴을 추천해요.",
    },
    {
      q: "2주 후 피드백은 왜 필요한가요?",
      a: "피부는 제품을 실제로 사용해봐야 당김, 번들거림, 답답함, 트러블 변화를 알 수 있어요. 그래서 DearSince는 사용 후 피드백을 기준으로 다음 루틴 방향을 조정해요.",
    },
  ];

  return (
    <section className="mt-14 max-w-4xl w-full text-left">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
        <p className="text-sm font-semibold text-gray-400 mb-3">
          Skincare Guide
        </p>

        <h2 className="text-2xl sm:text-3xl font-black leading-relaxed break-keep mb-4">
          피부타입을 몰라도 화장품 루틴을 시작할 수 있어요
        </h2>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep mb-8">
          DearSince는 피부타입 테스트처럼 복잡한 진단보다, 실제로 느끼는
          당김, 번들거림, 답답함, 트러블 반응을 기준으로 스킨케어 루틴을
          추천하는 서비스입니다. 건성, 수부지, 지성, 민감성 피부처럼
          자신의 피부 상태를 정확히 모르더라도 간단한 설문으로 시작할 수
          있어요.
        
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skinTypeGuides.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl bg-gray-50 border border-gray-100 p-5"
            >
              <h3 className="text-lg font-bold mb-3 break-keep">
                {item.title}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed break-keep">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
        <p className="text-sm font-semibold text-gray-400 mb-3">
          자주 묻는 질문
        </p>

        <h2 className="text-2xl sm:text-3xl font-black leading-relaxed break-keep mb-6">
          화장품 추천과 피부 루틴이 헷갈릴 때
        </h2>

        <div className="space-y-4">
          {faqList.map((item) => (
            <div
              key={item.q}
              className="rounded-3xl bg-gray-50 border border-gray-100 p-5"
            >
              <h3 className="text-base sm:text-lg font-bold mb-2 break-keep">
                {item.q}
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed break-keep">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const starterLevel = 5;

const [step, setStep] = useState("start");
const [answers, setAnswers] = useState({});
const [quickLevel, setQuickLevel] = useState(5);
const isBrowserBackRef = useRef(false);
const [baseLevel, setBaseLevel] = useState(5);
const [surveyAnswers, setSurveyAnswers] = useState({});
const [surveyIndex, setSurveyIndex] = useState(0);
const [savedSurvey, setSavedSurvey] = useState(null);
const [journeyHistory, setJourneyHistory] = useState([]);
const [activeJourneyId, setActiveJourneyId] =
  useState(null);
  const [viewJourneyId, setViewJourneyId] =
  useState(null);
const [mainConcern, setMainConcern] = useState("");
const [issueAnswers, setIssueAnswers] = useState({});
const [issueIndex, setIssueIndex] = useState(0);
 
const isComplete = feedbackQuestions.every((q) => answers[q.id] !== undefined);

  useEffect(() => {
  window.history.replaceState({ step: "start" }, "", window.location.href);

  const handlePopState = (event) => {
    isBrowserBackRef.current = true;

    const previousStep = event.state?.step || "start";
    setStep(previousStep);
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

useEffect(() => {
  if (isBrowserBackRef.current) {
    isBrowserBackRef.current = false;
    return;
  }

  const currentHistoryStep = window.history.state?.step;

  if (currentHistoryStep !== step) {
    window.history.pushState({ step }, "", window.location.href);
  }
}, [step]);
useEffect(() => {
  try {
    const saved = localStorage.getItem(SAVED_SURVEY_KEY);

    if (saved) {
      setSavedSurvey(JSON.parse(saved));
    }

    const savedJourney =
      localStorage.getItem(JOURNEY_HISTORY_KEY);

    if (savedJourney) {
      const parsedJourney = JSON.parse(savedJourney);

      if (Array.isArray(parsedJourney)) {
        setJourneyHistory(parsedJourney);
      }
    }
  } catch (error) {
    console.error(
      "저장된 피부 기록을 불러오지 못했어요.",
      error
    );
  }
}, []);


  const nextLevel = useMemo(() => {
  return calculateNextLevel(baseLevel, answers);
}, [baseLevel, answers]);

const surveyResult = useMemo(() => {
  return analyzeSkinSurvey(
    surveyAnswers,
    skinSurveyQuestions
  );
}, [surveyAnswers]);

const adjustedSurveyCareNeeds =
  useMemo(
    () =>
      adjustCareNeedsForIssue(
        surveyResult.careNeeds,
        mainConcern,
        issueAnswers
      ),
    [
      surveyResult.careNeeds,
      mainConcern,
      issueAnswers,
    ]
  );

const feedbackMainConcern =
  getFeedbackMainConcern(
    answers,
    mainConcern
  );

  const starterRoutineInfo = routineMap[starterLevel];
  const nextRoutineInfo = routineMap[nextLevel];

  const starterRoutine = getRoutineProducts(starterLevel);
const nextRoutine = buildDynamicRoutine(
  nextLevel,
  {
    mainConcern: feedbackMainConcern,

    careNeeds:
      adjustedSurveyCareNeeds,

    isSensitive:
      surveyResult.skinType?.includes("민감") ||
      (surveyResult.scores?.sensitivity ?? 0) >= 2 ||
      feedbackMainConcern === "sensitivity_redness",
  }
);
const quickRoutine = buildDynamicRoutine(quickLevel);
const quickRoutineReason = buildRoutineReason(quickLevel);


const acneGuide = useMemo(() => {
  if (mainConcern !== "inflammatory_acne") {
    return null;
  }

  return analyzeInflammatoryAcneGuide(issueAnswers);
}, [mainConcern, issueAnswers]);

const closedComedoneGuide = useMemo(() => {
  if (mainConcern !== "closed_comedones") {
    return null;
  }

  return analyzeClosedComedoneGuide(
    issueAnswers,
    surveyResult
  );
}, [
  mainConcern,
  issueAnswers,
  surveyResult,
]);

const blackheadGuide = useMemo(() => {
  if (mainConcern !== "blackhead_sebum") {
    return null;
  }

  return analyzeBlackheadSebumGuide(
    issueAnswers,
    surveyResult
  );
}, [
  mainConcern,
  issueAnswers,
  surveyResult,
]);

const dehydrationGuide = useMemo(() => {
  if (mainConcern !== "dehydration") {
    return null;
  }

  return analyzeDehydrationGuide(
    issueAnswers,
    surveyResult
  );
}, [
  mainConcern,
  issueAnswers,
  surveyResult,
]);

const sensitivityGuide = useMemo(() => {
  if (mainConcern !== "sensitivity_redness") {
    return null;
  }

  return analyzeSensitivityRednessGuide(
    issueAnswers
  );
}, [
  mainConcern,
  issueAnswers,
]);

const oilinessGuide = useMemo(() => {
  if (mainConcern !== "oiliness") {
    return null;
  }

  return analyzeOilinessGuide(
    issueAnswers,
    surveyResult
  );
}, [
  mainConcern,
  issueAnswers,
  surveyResult,
]);

const activeIssueGuide =
  mainConcern === "inflammatory_acne"
    ? acneGuide
    : mainConcern === "closed_comedones"
    ? closedComedoneGuide
    : mainConcern === "blackhead_sebum"
    ? blackheadGuide
    : mainConcern === "dehydration"
    ? dehydrationGuide
: mainConcern === "sensitivity_redness"
? sensitivityGuide
: mainConcern === "oiliness"
? oilinessGuide
: null;

const selectedConcern =
  skinConcernOptions.find(
    (concern) => concern.id === mainConcern
  );

const finalSkinProfile = {
  ...surveyResult,

  mainIssue:
    mainConcern ||
    surveyResult.mainIssue,

  issueLabel:
    selectedConcern?.label ||
    surveyResult.issueLabel,

  issueAnswers,

  careNeeds:
    adjustedSurveyCareNeeds,

  acneGuide,
  issueGuide: activeIssueGuide,
};

const surveyRoutine = buildDynamicRoutine(
  surveyResult.hydrationLevel,
  {
    mainConcern,

    careNeeds:
      adjustedSurveyCareNeeds,

    isSensitive:
      surveyResult.skinType?.includes("민감") ||
      (surveyResult.scores?.sensitivity ?? 0) >= 2,
  }
);

const savedSurveyResult = useMemo(() => {
  if (!savedSurvey?.surveyAnswers) return null;

  return analyzeSkinSurvey(savedSurvey.surveyAnswers, skinSurveyQuestions);
}, [savedSurvey]);

const hasSavedSurvey = !!savedSurveyResult;

const currentSurveyQuestion = skinSurveyQuestions[surveyIndex];
const currentSurveyAnswer = currentSurveyQuestion
  ? surveyAnswers[currentSurveyQuestion.id]
  : null;

const isLastSurveyQuestion = surveyIndex === skinSurveyQuestions.length - 1;

const isCurrentSurveyAnswered = currentSurveyQuestion
  ? currentSurveyQuestion.type === "multi"
    ? Array.isArray(currentSurveyAnswer) && currentSurveyAnswer.length > 0
    : !!currentSurveyAnswer
  : false;

const surveyProgress =
  ((surveyIndex + 1) / skinSurveyQuestions.length) * 100;

const activeIssueQuestions =
  mainConcern === "inflammatory_acne"
    ? getVisibleInflammatoryAcneQuestions(issueAnswers)
    : mainConcern === "closed_comedones"
    ? getVisibleClosedComedoneQuestions(issueAnswers)
    : mainConcern === "blackhead_sebum"
    ? getVisibleBlackheadSebumQuestions(issueAnswers)
    : mainConcern === "dehydration"
    ? getVisibleDehydrationQuestions(issueAnswers)
    : mainConcern === "sensitivity_redness"
    ? getVisibleSensitivityRednessQuestions(issueAnswers)
    : mainConcern === "oiliness"
    ? getVisibleOilinessQuestions(issueAnswers)
    : [];

const currentIssueQuestion =
  activeIssueQuestions[issueIndex] || null;

const currentIssueAnswer = currentIssueQuestion
  ? issueAnswers[currentIssueQuestion.id]
  : null;

const isLastIssueQuestion =
  activeIssueQuestions.length > 0 &&
  issueIndex === activeIssueQuestions.length - 1;

const issueProgress =
  activeIssueQuestions.length > 0
    ? ((issueIndex + 1) / activeIssueQuestions.length) * 100
    : 0;

const surveyUserContext = {
  mainConcern,
  level: surveyResult.hydrationLevel,
  careNeeds:
    adjustedSurveyCareNeeds,
isSensitive:
  surveyResult.skinType?.includes("민감") ||
  (surveyResult.scores?.sensitivity ?? 0) >= 2,
  troubleScore:
  mainConcern === "inflammatory_acne"
    ? Math.max(surveyResult.scores.acne ?? 0, 1)
    : surveyResult.scores.acne ?? 0,
  skinType: surveyResult.skinType,
  season: "spring",
  goal: finalSkinProfile.issueLabel,
};

  const irritationLabel =
  answers.irritation?.label || "";

const ingredients = getRecommendedIngredients(
  nextLevel,
  {
    clogged: getFeedbackValue(
      answers,
      "clogged"
    ),

    trouble: getFeedbackValue(
      answers,
      "trouble"
    ),

    irritated:
      irritationLabel.includes("따가움") ||
      irritationLabel.includes("붉어짐") ||
      irritationLabel.includes("불편함"),
  }
);
  const levelChangeMessage = getLevelChangeMessage(baseLevel, nextLevel);
  const feedbackAdvice = getFeedbackAdvice(answers);
const userContext = {
  mainConcern: feedbackMainConcern,
  level: nextLevel,
  isSensitive:
    getFeedbackValue(answers, "dry") <= -1 ||
    getFeedbackValue(answers, "trouble") >= 1 ||
    (answers.irritation?.label || "").includes("따가움") ||
    (answers.irritation?.label || "").includes("붉어짐"),
  troubleScore: getFeedbackValue(answers, "trouble"),
  skinType: nextLevel <= 4 ? "건성" : nextLevel <= 6 ? "수부지" : "지성",
  season: "spring",
goal:
  getFeedbackValue(answers, "trouble") >= 1
    ? "트러블 관리"
    : nextLevel <= 4
    ? "보습"
    : "유분 밸런스"
};
const routineReason = buildRoutineReason(nextLevel);
  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value
    }));
  };
const handleSurveyAnswer = (question, option) => {
  setSurveyAnswers((prev) => {
    const currentAnswer = prev[question.id];

    if (question.type === "multi") {
      const currentList = Array.isArray(currentAnswer) ? currentAnswer : [];

      if (option.lifestyle === "none" || option.lifestyle === "unknown") {
  return {
    ...prev,
    [question.id]: [option.label],
  };
}

      const withoutNone = currentList.filter(
  (item) => item !== "딱히 해당되는 게 없다" && item !== "잘 모르겠어요"
);
      const alreadySelected = withoutNone.includes(option.label);

      return {
        ...prev,
        [question.id]: alreadySelected
          ? withoutNone.filter((item) => item !== option.label)
          : [...withoutNone, option.label],
      };
    }

    return {
      ...prev,
      [question.id]: option.label,
    };
  });
};
const handleIssueAnswer = (question, option) => {
  setIssueAnswers((prev) => {
    const next = {
      ...prev,
      [question.id]: option,
    };

    // 턱/턱선이 아니게 바꾸면 예전 면도 답변 제거
    if (
      question.id === "area" &&
      option.value !== "chin_jaw"
    ) {
      delete next.shaving;
    }

    // 단순 붉은 트러블로 바꾸면 예전 통증 답변 제거
    if (
      question.id === "form" &&
      !["pustule", "nodule", "cluster"].includes(option.value)
    ) {
      delete next.pain;
    }

 // 눈/입술 붓기가 아니라면 호흡 질문의 예전 답변 삭제
    if (
      question.id === "swelling" &&
      option.value !== "eyes_lips"
    ) {
      delete next.breathing;
    }

    return next;
  });
};

const handlePrevIssue = () => {
  if (issueIndex === 0) {
    setStep("issueSelect");
    return;
  }

  setIssueIndex((prev) => Math.max(prev - 1, 0));
};

const handleNextIssue = () => {
  if (!currentIssueAnswer) return;

  if (isLastIssueQuestion) {
    saveSurveyResult();
    setStep("surveyResult");
    return;
  }

  setIssueIndex((prev) =>
    Math.min(
      prev + 1,
      activeIssueQuestions.length - 1
    )
  );
};

const saveSurveyResult = () => {
  const timestamp = Date.now();
  const savedAt = new Date().toISOString();

  const journeyId =
    `journey-${timestamp}`;

  const data = {
    id: `survey-${timestamp}`,
    journeyId,
    journeySchemaVersion: 2,
    type: "initial_survey",

    surveyAnswers,
    mainConcern,
    issueAnswers,

    result: {
      skinType:
        surveyResult.skinType,

      hydrationLevel:
        surveyResult.hydrationLevel,

      scores:
        surveyResult.scores,

      skinState:
        surveyResult.skinState,

      careNeeds:
        adjustedSurveyCareNeeds,
    },

    routine: {
      cleanser:
        surveyRoutine.products.cleanser?.id ??
        null,

      toner:
        surveyRoutine.products.toner?.id ??
        null,

      serum:
        surveyRoutine.products.serum?.id ??
        null,

      cream:
        surveyRoutine.products.cream?.id ??
        null,
    },

    productUsagePlan:
      buildProductUsagePlan(
        surveyRoutine.products,
        surveyResult.skinType,
        savedAt
      ),

    savedAt,
  };

  try {
    // 가장 최근 설문 결과 저장
    localStorage.setItem(
      SAVED_SURVEY_KEY,
      JSON.stringify(data)
    );

    setSavedSurvey(data);
    setActiveJourneyId(journeyId);
    setViewJourneyId(null);

    // Skin Journey 누적
    const savedHistory =
      localStorage.getItem(JOURNEY_HISTORY_KEY);

    let history = [];

    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);

      if (Array.isArray(parsedHistory)) {
        history = parsedHistory;
      }
    }

    const updatedHistory = [
      ...history,
      data,
    ];

    localStorage.setItem(
      JOURNEY_HISTORY_KEY,
      JSON.stringify(updatedHistory)
    );

    setJourneyHistory(updatedHistory);

  } catch (error) {
    console.error(
      "설문 결과를 저장하지 못했어요.",
      error
    );
  }
};

const startQuickJourneyFeedback = () => {
  const timestamp = Date.now();
  const savedAt = new Date().toISOString();

  const journeyId =
    `journey-quick-${timestamp}`;

  const quickSkinType =
    quickLevel <= 4
      ? "건성"
      : quickLevel <= 6
      ? "수부지 / 복합성"
      : "지성";

  const quickStartData = {
    id: `quick-${timestamp}`,
    journeyId,
    journeySchemaVersion: 2,

    type: "initial_survey",
    source: "quick",

    mainConcern: "none",

    result: {
      skinType:
        quickSkinType,

      hydrationLevel:
        quickLevel,

      scores: {},

      // 빠른 추천은 정식 설문을 거치지 않으므로
      // 피부 상태를 임의로 만들어내지 않음
      skinState: null,
      careNeeds: null,
    },

    routine: {
      cleanser:
        quickRoutine.products.cleanser?.id ??
        null,

      toner:
        quickRoutine.products.toner?.id ??
        null,

      serum:
        quickRoutine.products.serum?.id ??
        null,

      cream:
        quickRoutine.products.cream?.id ??
        null,
    },

    productUsagePlan:
      buildProductUsagePlan(
        quickRoutine.products,
        quickSkinType,
        savedAt
      ),

    savedAt,
  };

  try {
    const savedHistory =
      localStorage.getItem(
        JOURNEY_HISTORY_KEY
      );

    let history = [];

    if (savedHistory) {
      const parsedHistory =
        JSON.parse(savedHistory);

      if (Array.isArray(parsedHistory)) {
        history = parsedHistory;
      }
    }

    const updatedHistory = [
      ...history,
      quickStartData,
    ];

    localStorage.setItem(
      JOURNEY_HISTORY_KEY,
      JSON.stringify(updatedHistory)
    );

    setJourneyHistory(updatedHistory);

    setActiveJourneyId(journeyId);
    setViewJourneyId(null);

    setMainConcern("none");
    setBaseLevel(quickLevel);
    setAnswers({});

    setStep("feedback");
  } catch (error) {
    console.error(
      "빠른 추천 Journey를 저장하지 못했어요.",
      error
    );

    setActiveJourneyId(journeyId);
    setViewJourneyId(null);
    setMainConcern("none");
    setBaseLevel(quickLevel);
    setAnswers({});

    setStep("feedback");
  }
};

const saveFeedbackResult = () => {
  const savedAt =
    new Date().toISOString();

  const currentJourneyRecords =
    journeyHistory.filter(
      (item) =>
        item.journeyId ===
          activeJourneyId ||
        item.id === activeJourneyId
    );

  const latestJourneyRecord =
    currentJourneyRecords.length > 0
      ? currentJourneyRecords[
          currentJourneyRecords.length - 1
        ]
      : null;

  const confounders =
    buildFeedbackConfounders(
      answers
    );

  const usageReport =
    buildFeedbackUsageReport(
      answers
    );

  const dataQuality =
    buildFeedbackDataQuality(
      answers
    );

  const feedbackData = {
    id: `feedback-${Date.now()}`,
    type: "feedback",
    journeySchemaVersion: 2,

    feedbackAnswers: answers,

    journeyId:
      activeJourneyId,

    // 이번 피드백이 실제로 평가한
    // 이전 루틴을 함께 보존
    evaluatedRoutine:
      latestJourneyRecord?.routine ??
      null,

    evaluatedProductUsagePlan:
      latestJourneyRecord
        ?.productUsagePlan ??
      null,

    usageReport,
    confounders,
    dataQuality,

    outcome: {
      conditionSnapshot:
        getFeedbackConditionSnapshot(
          answers
        ),
    },

    changeReasons:
      getJourneyChangeReasons(
        answers,
        {
          hydrationLevel:
            baseLevel,
          mainConcern,
        },
        {
          hydrationLevel:
            nextLevel,
          mainConcern:
            feedbackMainConcern,
        }
      ),

    previousState: {
      hydrationLevel:
        baseLevel,
      mainConcern,
    },

    nextState: {
      hydrationLevel:
        nextLevel,
      mainConcern:
        feedbackMainConcern,
    },

    routine: {
      cleanser:
        nextRoutine.products.cleanser?.id ??
        null,

      toner:
        nextRoutine.products.toner?.id ??
        null,

      serum:
        nextRoutine.products.serum?.id ??
        null,

      cream:
        nextRoutine.products.cream?.id ??
        null,
    },

    productUsagePlan:
      buildProductUsagePlan(
        nextRoutine.products,
        userContext.skinType,
        savedAt
      ),

    savedAt,
  };

  try {
    const savedHistory =
      localStorage.getItem(
        JOURNEY_HISTORY_KEY
      );

    let history = [];

    if (savedHistory) {
      const parsedHistory =
        JSON.parse(savedHistory);

      if (
        Array.isArray(parsedHistory)
      ) {
        history = parsedHistory;
      }
    }

    const updatedHistory = [
      ...history,
      feedbackData,
    ];

    localStorage.setItem(
      JOURNEY_HISTORY_KEY,
      JSON.stringify(
        updatedHistory
      )
    );

    setJourneyHistory(
      updatedHistory
    );

    setStep("result");
  } catch (error) {
    console.error(
      "피드백 결과를 저장하지 못했어요.",
      error
    );

    setStep("result");
  }
};

const openSavedSurveyResult = () => {
  if (!savedSurvey?.surveyAnswers) return;

  setSurveyAnswers(savedSurvey.surveyAnswers);
  setMainConcern(savedSurvey.mainConcern || "");
  setIssueAnswers(savedSurvey.issueAnswers || {});
  setSurveyIndex(0);
  setIssueIndex(0);
  setStep("surveyResult");
};

const startSavedFeedback = () => {
  if (!savedSurvey?.surveyAnswers || !savedSurveyResult) {
    return;
  }

const savedJourneyId =
  savedSurvey.journeyId ||
  savedSurvey.id;

setActiveJourneyId(savedJourneyId);

// 예전 기록은 journeyId가 없을 수 있으므로
// 기존 위치 기반 방식도 유지
const savedSurveyIndex =
  journeyHistory.findIndex(
    (item) =>
      item.id === savedSurvey.id
  );

const currentJourney =
  savedSurvey.journeyId
    ? journeyHistory.filter(
        (item) =>
          item.journeyId ===
            savedSurvey.journeyId ||
          item.id === savedSurvey.id
      )
    : savedSurveyIndex >= 0
    ? journeyHistory.slice(
        savedSurveyIndex
      )
    : [];

  const latestRecord =
    currentJourney.length > 0
      ? currentJourney[currentJourney.length - 1]
      : null;

  let latestLevel =
    savedSurveyResult.hydrationLevel;

  let latestConcern =
    savedSurvey.mainConcern || "";

  if (latestRecord?.type === "feedback") {
    latestLevel =
      latestRecord.nextState?.hydrationLevel ??
      latestLevel;

    latestConcern =
      latestRecord.nextState?.mainConcern ??
      latestConcern;
  }

  if (latestRecord?.type === "initial_survey") {
    latestLevel =
      latestRecord.result?.hydrationLevel ??
      latestLevel;

    latestConcern =
      latestRecord.mainConcern ??
      latestConcern;
  }

  setSurveyAnswers(savedSurvey.surveyAnswers);

  setMainConcern(latestConcern);

  setIssueAnswers(
    savedSurvey.issueAnswers || {}
  );

  setBaseLevel(latestLevel);

  setAnswers({});

  setStep("feedback");
};

const resetFlow = () => {
  setAnswers({});
  setSurveyAnswers({});
  setBaseLevel(5);
  setSurveyIndex(0);
  setMainConcern("");
  setIssueAnswers({});
  setIssueIndex(0);
  setActiveJourneyId(null);
  setViewJourneyId(null);
  setStep("start");
};

const handlePrevSurvey = () => {
  if (surveyIndex === 0) {
    setStep("start");
    return;
  }

  setSurveyIndex((prev) =>
    Math.max(prev - 1, 0)
  );
};

const handleNextSurvey = () => {
  if (!isCurrentSurveyAnswered) return;

  if (isLastSurveyQuestion) {
    setStep("issueSelect");
    return;
  }

  setSurveyIndex((prev) =>
    Math.min(
      prev + 1,
      skinSurveyQuestions.length - 1
    )
  );
};
const latestSurveyRecord =
  [...journeyHistory]
    .reverse()
    .find(
      (item) =>
        item.type === "initial_survey"
    ) || null;

    const journeyStartRecords =
  journeyHistory.filter(
    (item) =>
      item.type === "initial_survey"
  );

const getRecordsForJourney = (
  startRecord
) => {
  if (!startRecord) {
    return [];
  }

  // journeyId가 있는 신규 기록
  if (startRecord.journeyId) {
    return journeyHistory.filter(
      (item) =>
        item.journeyId ===
          startRecord.journeyId ||
        item.id === startRecord.id
    );
  }

  // 예전 journeyId 없는 기록 호환
  const startIndex =
    journeyHistory.findIndex(
      (item) =>
        item.id === startRecord.id
    );

  if (startIndex < 0) {
    return [];
  }

  const nextJourneyIndex =
    journeyHistory.findIndex(
      (item, index) =>
        index > startIndex &&
        item.type === "initial_survey"
    );

  return nextJourneyIndex >= 0
    ? journeyHistory.slice(
        startIndex,
        nextJourneyIndex
      )
    : journeyHistory.slice(startIndex);
};

const viewedJourneyStartRecord =
  step === "journey" &&
  viewJourneyId
    ? journeyStartRecords.find(
        (item) =>
          (item.journeyId || item.id) ===
          viewJourneyId
      ) || latestSurveyRecord
    : latestSurveyRecord;

const activeJourneyRecords =
  getRecordsForJourney(
    viewedJourneyStartRecord
  );

  const journeyOptions =
  [...journeyStartRecords]
    .reverse()
    .map(
      (startRecord, index) => {
        const records =
          getRecordsForJourney(
            startRecord
          );

        const latestRecord =
          records.length > 0
            ? records[
                records.length - 1
              ]
            : startRecord;

        const currentLevel =
          latestRecord?.type ===
          "feedback"
            ? latestRecord.nextState
                ?.hydrationLevel
            : startRecord.result
                ?.hydrationLevel;

        const checkCount =
          records.filter(
            (item) =>
              item.type ===
              "feedback"
          ).length;

        return {
          id:
            startRecord.journeyId ||
            startRecord.id,

          number:
            journeyStartRecords.length -
            index,

          isLatest: index === 0,

          source:
            startRecord.source === "quick"
              ? "빠른 추천"
              : "피부 설문",

          skinType:
            startRecord.result
              ?.skinType ||
            "피부 기록",

          currentLevel,

          checkCount,

          savedAt:
            startRecord.savedAt,
        };
      }
    );

const firstJourneyRecord =
  activeJourneyRecords.length > 0
    ? activeJourneyRecords[0]
    : null;

const latestJourneyRecord =
  activeJourneyRecords.length > 0
    ? activeJourneyRecords[
        activeJourneyRecords.length - 1
      ]
    : null;

const getJourneyLevel = (item) => {
  if (!item) return null;

  if (item.type === "initial_survey") {
    return item.result?.hydrationLevel ?? null;
  }

  if (item.type === "feedback") {
    return item.nextState?.hydrationLevel ?? null;
  }

  return null;
};

const getJourneyConcern = (item) => {
  if (!item) return "none";

  if (item.type === "initial_survey") {
    return item.mainConcern || "none";
  }

  if (item.type === "feedback") {
    return item.nextState?.mainConcern || "none";
  }

  return "none";
};

const firstJourneyLevel =
  getJourneyLevel(firstJourneyRecord);

const latestJourneyLevel =
  getJourneyLevel(latestJourneyRecord);

const journeyLevelChange =
  firstJourneyLevel !== null &&
  latestJourneyLevel !== null
    ? latestJourneyLevel - firstJourneyLevel
    : 0;

const latestJourneyConcern =
  skinConcernOptions.find(
    (item) =>
      item.id ===
      getJourneyConcern(latestJourneyRecord)
  )?.label || "특별한 고민 없음";

  const viewedJourneyKey =
  viewedJourneyStartRecord?.journeyId ||
  viewedJourneyStartRecord?.id ||
  null;

const viewedJourneyIndex =
  journeyStartRecords.findIndex(
    (item) =>
      (item.journeyId || item.id) ===
      viewedJourneyKey
  );

const previousJourneyStartRecord =
  viewedJourneyIndex > 0
    ? journeyStartRecords[
        viewedJourneyIndex - 1
      ]
    : null;

const previousJourneyRecords =
  getRecordsForJourney(
    previousJourneyStartRecord
  );

const previousJourneyLatestRecord =
  previousJourneyRecords.length > 0
    ? previousJourneyRecords[
        previousJourneyRecords.length - 1
      ]
    : null;

const previousJourneyEndLevel =
  getJourneyLevel(
    previousJourneyLatestRecord
  );

const previousJourneyConcern =
  skinConcernOptions.find(
    (item) =>
      item.id ===
      getJourneyConcern(
        previousJourneyLatestRecord
      )
  )?.label || "특별한 고민 없음";

const currentJourneyStartConcern =
  skinConcernOptions.find(
    (item) =>
      item.id ===
      getJourneyConcern(
        firstJourneyRecord
      )
  )?.label || "특별한 고민 없음";

const previousJourneySkinType =
  previousJourneyStartRecord
    ?.result?.skinType ||
  "피부 기록";

const currentJourneySkinType =
  viewedJourneyStartRecord
    ?.result?.skinType ||
  "피부 기록";

const journeyTransitionChange =
  previousJourneyEndLevel !== null &&
  firstJourneyLevel !== null
    ? firstJourneyLevel -
      previousJourneyEndLevel
    : 0;

const journeyTransitionMessage =
  previousJourneyEndLevel === null ||
  firstJourneyLevel === null
    ? "두 Journey의 단계 정보를 비교하기 어려워요."
    : journeyTransitionChange === 0
    ? "이전 Journey 마지막과 이번 Journey 시작 단계가 같아요."
    : journeyTransitionChange > 0
    ? `이전 Journey 마지막보다 이번 시작이 ${journeyTransitionChange}단계 더 가벼운 루틴 방향이에요.`
    : `이전 Journey 마지막보다 이번 시작이 ${Math.abs(
        journeyTransitionChange
      )}단계 더 촉촉한 루틴 방향이에요.`;

const feedbackCount =
  activeJourneyRecords.filter(
    (item) =>
      item.type === "feedback"
  ).length;

  const isQuickJourney =
  latestSurveyRecord?.source === "quick";

const quickJourneyCurrentLevel =
  isQuickJourney
    ? getJourneyLevel(latestJourneyRecord)
    : null;

const quickJourneySkinType =
  isQuickJourney
    ? latestSurveyRecord?.result?.skinType ||
      "피부타입 직접 선택"
    : null;

    const resumeQuickJourneyFeedback = () => {
  if (
    !isQuickJourney ||
    !latestSurveyRecord
  ) {
    return;
  }

  const journeyId =
    latestSurveyRecord.journeyId ||
    latestSurveyRecord.id;

  const latestRecord =
    activeJourneyRecords.length > 0
      ? activeJourneyRecords[
          activeJourneyRecords.length - 1
        ]
      : latestSurveyRecord;

  let latestLevel =
    latestSurveyRecord.result
      ?.hydrationLevel ?? 5;

  let latestConcern =
    latestSurveyRecord.mainConcern ||
    "none";

  if (latestRecord?.type === "feedback") {
    latestLevel =
      latestRecord.nextState
        ?.hydrationLevel ??
      latestLevel;

    latestConcern =
      latestRecord.nextState
        ?.mainConcern ??
      latestConcern;
  }

  setActiveJourneyId(journeyId);

  // 빠른 추천이므로 예전 설문 상태 제거
  setSurveyAnswers({});
  setIssueAnswers({});

  setMainConcern(latestConcern);
  setBaseLevel(latestLevel);
  setAnswers({});

  setStep("feedback");
};

  const currentJourneyRecords =
  activeJourneyRecords;

const journeyRoundSummaries =
  currentJourneyRecords
    .map((record, recordIndex) => {
      if (record.type !== "feedback") {
        return null;
      }

      const previousRecord =
        recordIndex > 0
          ? currentJourneyRecords[
              recordIndex - 1
            ]
          : null;

      const previousLevel =
        record.previousState
          ?.hydrationLevel ??
        getJourneyLevel(previousRecord);

      const currentLevel =
        record.nextState
          ?.hydrationLevel ??
        getJourneyLevel(record);

      const concernLabel =
        skinConcernOptions.find(
          (concern) =>
            concern.id ===
            (record.nextState?.mainConcern ||
              "none")
        )?.label ||
        "특별한 고민 없음";

      const previousRoutine =
        previousRecord?.routine || {};

      const currentRoutine =
        record.routine || {};

      const allCategories = [
        ...new Set([
          ...Object.keys(previousRoutine),
          ...Object.keys(currentRoutine),
        ]),
      ];

      const changedProductCount =
        allCategories.filter(
          (category) =>
            (previousRoutine[category] ??
              null) !==
            (currentRoutine[category] ??
              null)
        ).length;

      const reasons =
        record.changeReasons?.length > 0
          ? record.changeReasons
          : getJourneyChangeReasons(
              record.feedbackAnswers || {},
              record.previousState || {},
              record.nextState || {}
            );

      const round =
        currentJourneyRecords
          .slice(0, recordIndex + 1)
          .filter(
            (item) =>
              item.type === "feedback"
          ).length;

      let direction = "단계 유지";

      if (
        previousLevel !== null &&
        currentLevel !== null
      ) {
        if (currentLevel > previousLevel) {
          direction = "더 가볍게";
        }

        if (currentLevel < previousLevel) {
          direction = "더 촉촉하게";
        }
      }

      return {
        id:
          record.id ||
          `summary-${recordIndex}`,

        round,

        previousLevel,
        currentLevel,

        direction,

        concernLabel,

        changedProductCount,

        reason:
          reasons[0] ||
          "피드백을 반영해 루틴을 조정했어요.",
      };
    })
    .filter(Boolean);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold break-keep">DearSince</h1>
            <p className="text-xs sm:text-sm text-gray-500 break-keep">
              당신을 위한 맞춤 루틴
            </p>
          </div>
          <button
            onClick={resetFlow}
            className="text-xs sm:text-sm px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            처음으로
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {step === "start" && (
    <section className="min-h-[75vh] flex flex-col items-center justify-center text-center">
  <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs sm:text-sm text-gray-600 mb-6 shadow-sm break-keep">
    피부 상태에 맞춰 시작 방식을 선택하세요
  </div>

  <h2 className="text-4xl sm:text-6xl font-bold leading-tight break-keep mb-5">
    피부를 잘 몰라도
    <br />
    괜찮아요
  </h2>

  <p className="text-sm sm:text-lg text-gray-600 max-w-2xl leading-relaxed break-keep mb-10">
    몇 가지 질문으로 현재 피부 상태를 파악하고,
    <br className="hidden sm:block" />
    맞는 루틴과 사용법을 함께 안내해드릴게요.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl w-full">
    <button
      onClick={() => {
  setActiveJourneyId(null);
  setStep("quickRecommend");
}}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 text-left hover:shadow-lg hover:-translate-y-1 transition active:scale-[0.98]"
    >
      <p className="text-sm text-gray-400 mb-3">이미 알고 있어요</p>
      <h3 className="text-2xl font-bold mb-3 break-keep">
        피부타입 알고 있어요
      </h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep mb-5">
        건성, 수부지, 지성처럼 내 피부타입을 알고 있다면 바로 맞는 루틴을 추천받을 수 있어요.
      </p>
      <span className="text-sm font-semibold text-black">
        바로 추천받기 →
      </span>
    </button>

    <button
  onClick={() => {
  setActiveJourneyId(null);
  setStep("survey");
}}
      className="bg-black text-white rounded-3xl shadow-sm p-6 sm:p-8 text-left hover:opacity-90 hover:-translate-y-1 transition active:scale-[0.98]"
    >
      <p className="text-sm text-white/60 mb-3">처음 시작해요</p>
      <h3 className="text-2xl font-bold mb-3 break-keep">
        처음이라 설문으로 시작할래요
      </h3>
      <p className="text-sm sm:text-base text-white/75 leading-relaxed break-keep mb-5">
        피부타입을 몰라도 괜찮아요. 몇 가지 질문에 답하면 현재 상태에 맞는 루틴과 관리 방향을 추천해드려요.
      </p>
      <span className="text-sm font-semibold text-white">
        설문 시작하기 →
      </span>
    </button>
  </div>
  {isQuickJourney && (
  <div className="mt-6 max-w-4xl w-full bg-white border border-emerald-100 rounded-3xl shadow-sm p-5 sm:p-6 text-left">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
      <div>
        <p className="text-sm font-bold text-emerald-600 mb-2">
          진행 중인 Skin Journey
        </p>

        <h3 className="text-xl font-black text-gray-900 mb-2 break-keep">
          {quickJourneySkinType} · 수분감{" "}
          {quickJourneyCurrentLevel ?? "-"}단계
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed break-keep">
          빠른 추천으로 시작한 루틴을
          계속 추적하고 있어요.
          지금까지 {feedbackCount}번 체크했어요.
        </p>

        <p className="mt-2 text-xs text-gray-400">
          최근 기록 ·{" "}
          {formatSavedAt(
            latestJourneyRecord?.savedAt
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
        <PrimaryButton
          onClick={resumeQuickJourneyFeedback}
        >
          {feedbackCount === 0
            ? "첫 체크하기"
            : `${feedbackCount + 1}차 체크하기`}
        </PrimaryButton>

        <button
          onClick={() =>
            setStep("journey")
          }
          className="px-5 py-3 rounded-2xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition"
        >
          변화 기록 보기
        </button>
      </div>
    </div>
  </div>
)}
  {hasSavedSurvey && !isQuickJourney && (
  <div className="mt-6 max-w-4xl w-full bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6 text-left">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="text-sm text-gray-400 mb-2">
          최근 저장된 설문 결과 · {formatSavedAt(savedSurvey?.savedAt)}
        </p>

        <h3 className="text-xl font-bold mb-2 break-keep">
          {savedSurveyResult.skinType} · 수분감 {savedSurveyResult.hydrationLevel}단계
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed break-keep">
          이전에 추천받은 루틴을 다시 확인하거나, 2주 사용 후 피부 반응을 체크할 수 있어요.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
        <button
          onClick={openSavedSurveyResult}
          className="px-5 py-3 rounded-2xl text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          최근 결과 다시 보기
        </button>

        <PrimaryButton onClick={startSavedFeedback}>
          2주 후 체크하기
        </PrimaryButton>
        <button
  onClick={() => setStep("journey")}
  className="px-5 py-3 rounded-2xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition"
>
  내 피부 변화 보기
</button>
      </div>
    </div>
  </div>
)}
<SeoContentSection />
</section>
        )}

        {step === "journey" && (
  <section>
    <SectionTitle
    
      title="내 피부 변화"
      desc="처음 진단부터 2주 피드백까지 피부 상태와 추천 루틴이 어떻게 바뀌었는지 확인할 수 있어요."
    />
    {journeyOptions.length > 1 && (
  <div className="max-w-4xl mx-auto mb-8">
    <div className="mb-4">
      <p className="text-sm font-bold text-gray-900">
        Skin Journey 기록
      </p>

      <p className="mt-1 text-sm text-gray-500">
        이전에 시작했던 피부 관리 기록을
        다시 확인할 수 있어요.
      </p>
    </div>

    <div className="flex gap-3 overflow-x-auto pb-3">
      {journeyOptions.map(
        (journey) => {
          const viewedId =
            viewedJourneyStartRecord
              ?.journeyId ||
            viewedJourneyStartRecord?.id;

          const active =
            viewedId === journey.id;

          return (
            <button
              key={journey.id}
              type="button"
              onClick={() =>
                setViewJourneyId(
                  journey.id
                )
              }
              className={`min-w-[260px] text-left rounded-3xl border p-5 transition ${
                active
                  ? "bg-slate-950 text-white border-slate-950 shadow-md"
                  : "bg-white text-gray-900 border-gray-100 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span
                  className={`text-xs font-bold ${
                    active
                      ? "text-emerald-300"
                      : "text-emerald-600"
                  }`}
                >
                  Journey {journey.number}
                </span>

                {journey.isLatest && (
                  <span
                    className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                      active
                        ? "bg-white/10 text-white"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    현재
                  </span>
                )}
              </div>

              <p
                className={`text-xs mb-2 ${
                  active
                    ? "text-slate-400"
                    : "text-gray-400"
                }`}
              >
                {journey.source} ·{" "}
                {formatSavedAt(
                  journey.savedAt
                )}
              </p>

              <h3 className="text-lg font-black break-keep">
                {journey.skinType}
                {" · "}
                {journey.currentLevel ??
                  "-"}
                단계
              </h3>

              <p
                className={`mt-3 text-sm ${
                  active
                    ? "text-slate-300"
                    : "text-gray-500"
                }`}
              >
                {journey.checkCount}회 체크
              </p>
            </button>
          );
        }
      )}
    </div>
  </div>
)}

{previousJourneyStartRecord && (
  <div className="max-w-4xl mx-auto mb-8">
    <div className="rounded-[2rem] bg-white border border-emerald-100 shadow-sm p-5 sm:p-7">
      <div className="mb-6">
        <p className="text-sm font-bold text-emerald-600 mb-2">
          장기 변화
        </p>

        <h3 className="text-xl sm:text-2xl font-black text-gray-900 break-keep">
          이전 Journey와 비교했어요
        </h3>

        <p className="mt-2 text-sm text-gray-500 leading-relaxed break-keep">
          이전 관리 기록의 마지막 상태와
          이번 관리 기록의 시작 상태를 비교해요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-400 mb-2">
            이전 Journey 마지막
          </p>

          <p className="text-xl font-black text-gray-800">
            {previousJourneyEndLevel ?? "-"}단계
          </p>

          <p className="mt-2 text-xs text-gray-500 break-keep">
            {previousJourneySkinType}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs text-emerald-600 mb-2">
            이번 Journey 시작
          </p>

          <p className="text-xl font-black text-emerald-800">
            {firstJourneyLevel ?? "-"}단계
          </p>

          <p className="mt-2 text-xs text-emerald-700 break-keep">
            {currentJourneySkinType}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-xs text-slate-400 mb-2">
            이번 Journey 현재
          </p>

          <p className="text-xl font-black text-emerald-300">
            {latestJourneyLevel ?? "-"}단계
          </p>

          <p className="mt-2 text-xs text-slate-300">
            {feedbackCount}회 체크
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-4 mb-3">
        <p className="text-xs text-gray-400 mb-2">
          루틴 방향 변화
        </p>

        <p className="text-sm font-bold text-gray-800 leading-relaxed break-keep">
          {journeyTransitionMessage}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-400 mb-1">
            이전 Journey 마지막 고민
          </p>

          <p className="text-sm font-bold text-gray-800 break-keep">
            {previousJourneyConcern}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-xs text-emerald-600 mb-1">
            이번 Journey 시작 고민
          </p>

          <p className="text-sm font-bold text-emerald-800 break-keep">
            {currentJourneyStartConcern}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

{activeJourneyRecords.length > 0 && (
  <div className="mb-8 rounded-[2rem] bg-slate-950 text-white p-6 sm:p-8 shadow-lg">
    <p className="text-sm text-slate-400 mb-2">
      Skin Journey
    </p>

    <h3 className="text-2xl sm:text-3xl font-black mb-6">
      처음과 지금을 비교했어요
    </h3>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="rounded-2xl bg-white/10 p-4">
        <p className="text-xs text-slate-400 mb-1">
          처음 단계
        </p>

        <p className="text-xl font-bold">
          {firstJourneyLevel ?? "-"}단계
        </p>
      </div>

      <div className="rounded-2xl bg-white/10 p-4">
        <p className="text-xs text-slate-400 mb-1">
          현재 단계
        </p>

        <p className="text-xl font-bold text-emerald-300">
          {latestJourneyLevel ?? "-"}단계
        </p>
      </div>

      <div className="rounded-2xl bg-white/10 p-4">
        <p className="text-xs text-slate-400 mb-1">
          현재 고민
        </p>

        <p className="text-sm font-bold break-keep">
          {latestJourneyConcern}
        </p>
      </div>

      <div className="rounded-2xl bg-white/10 p-4">
        <p className="text-xs text-slate-400 mb-1">
          체크 횟수
        </p>

        <p className="text-xl font-bold">
          {feedbackCount}회
        </p>
      </div>
    </div>

    <div className="mt-5 rounded-2xl bg-white/10 p-4">
      <p className="text-xs text-slate-400 mb-2">
        변화 요약
      </p>

      <p className="text-sm sm:text-base font-semibold leading-relaxed break-keep">
        {journeyLevelChange === 0
          ? "처음과 현재의 수분감 단계가 같아요. 현재 루틴의 밸런스를 조금 더 지켜볼 수 있어요."
          : journeyLevelChange > 0
          ? `처음보다 ${journeyLevelChange}단계 가벼운 루틴 쪽으로 조정됐어요.`
          : `처음보다 ${Math.abs(
              journeyLevelChange
            )}단계 촉촉한 루틴 쪽으로 조정됐어요.`}
      </p>
    </div>
  </div>
)}
{journeyRoundSummaries.length > 0 && (
  <div className="max-w-4xl mx-auto mb-10">
    <div className="mb-5">
      <p className="text-sm font-bold text-emerald-600 mb-2">
        변화 기록
      </p>

      <h3 className="text-2xl font-black text-gray-900">
        회차별로 어떻게 달라졌을까요?
      </h3>

      <p className="mt-2 text-sm text-gray-500 leading-relaxed break-keep">
        각 체크에서 피부 반응과 추천 루틴이
        어떻게 바뀌었는지 간단하게 정리했어요.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...journeyRoundSummaries]
        .reverse()
        .map((summary) => (
          <div
            key={summary.id}
            className="rounded-[1.7rem] bg-white border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <span className="inline-flex rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">
                {summary.round}차 체크
              </span>

              <span className="text-xs font-bold text-gray-400">
                {summary.direction}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 rounded-2xl bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">
                  이전
                </p>

                <p className="text-xl font-black text-gray-700">
                  {summary.previousLevel ?? "-"}
                  단계
                </p>
              </div>

              <span className="font-bold text-gray-400">
                →
              </span>

              <div className="flex-1 rounded-2xl bg-emerald-50 p-4 text-center">
                <p className="text-xs text-emerald-600 mb-1">
                  조정 후
                </p>

                <p className="text-xl font-black text-emerald-800">
                  {summary.currentLevel ?? "-"}
                  단계
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-xs text-gray-400 mb-1">
                  주요 고민
                </p>

                <p className="text-sm font-bold text-gray-800 break-keep">
                  {summary.concernLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-3">
                <p className="text-xs text-gray-400 mb-1">
                  제품 변화
                </p>

                <p className="text-sm font-bold text-gray-800">
                  {summary.changedProductCount}개 변경
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400 mb-2">
                핵심 변화 이유
              </p>

              <p className="text-sm text-gray-700 leading-relaxed break-keep">
                {summary.reason}
              </p>
            </div>
          </div>
        ))}
    </div>
  </div>
)}
    <div className="max-w-3xl mx-auto">
      {activeJourneyRecords.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-lg font-bold mb-2">
            아직 피부 기록이 없어요
          </p>

          <p className="text-sm text-gray-500 leading-relaxed">
            설문을 완료하면 첫 피부 기록이 여기에 저장돼요.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {[...activeJourneyRecords]
  .reverse()
  .map((item, index) => {
              const isSurvey =
                item.type === "initial_survey";

const originalIndex =
  activeJourneyRecords.length - 1 - index;

const feedbackRound = isSurvey
  ? 0
  : activeJourneyRecords
      .slice(0, originalIndex + 1)
      .filter(
        (record) =>
          record.type === "feedback"
      ).length;

const previousFeedbackRecord =
  !isSurvey
    ? activeJourneyRecords
        .slice(0, originalIndex)
        .reverse()
        .find(
          (record) =>
            record.type === "feedback"
        ) || null
    : null;

const conditionChanges =
  !isSurvey
    ? compareFeedbackConditions(
        item.feedbackAnswers || {},
        previousFeedbackRecord
          ?.feedbackAnswers || null
      )
    : [];
              const level = isSurvey
                ? item.result?.hydrationLevel
                : item.nextState?.hydrationLevel;

              const concernId = isSurvey
                ? item.mainConcern
                : item.nextState?.mainConcern;

              const concernLabel =
                skinConcernOptions.find(
                  (concern) =>
                    concern.id === concernId
                )?.label || "기본 관리";

              const routineEntries =
                Object.entries(item.routine || {});
const changeReasons =
  item.changeReasons?.length > 0
    ? item.changeReasons
    : getJourneyChangeReasons(
        item.feedbackAnswers || {},
        item.previousState || {},
        item.nextState || {}
      );
      const previousRecord =
  originalIndex > 0
    ? activeJourneyRecords[
        originalIndex - 1
      ]
    : null;

const previousRoutine =
  previousRecord?.routine || {};

const routineChanges = Object.entries(
  item.routine || {}
)
  .map(([category, currentProductId]) => {
    const previousProductId =
      previousRoutine[category] ?? null;

    return {
      category,
      previousProduct:
        getProductById(previousProductId),
      currentProduct:
        getProductById(currentProductId),
      changed:
        previousProductId !== currentProductId,
    };
  })
  .filter(
    (item) =>
      item.previousProduct ||
      item.currentProduct
  );

const changedRoutineCount =
  routineChanges.filter(
    (item) => item.changed
  ).length;
              return (
                <div
                  key={item.id || index}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold mb-3 ${
                          isSurvey
                            ? "bg-black text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        
                          {isSurvey
  ? "첫 피부 진단"
  : `${feedbackRound}차 체크`}
                      </span>

                      <h3 className="text-xl font-black">
                        수분감 {level ?? "-"}단계
                      </h3>
                    </div>

                    <p className="text-xs text-gray-400">
                      {formatSavedAt(item.savedAt)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-400 mb-1">
                        주요 고민
                      </p>

                      <p className="text-sm font-bold">
                        {concernLabel}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-400 mb-1">
                        기록 종류
                      </p>

                      <p className="text-sm font-bold">
                        {isSurvey
  ? "초기 분석"
  : `${feedbackRound}차 루틴 재조정`}
                      </p>
                    </div>
                  </div>

                  {routineEntries.length > 0 && (
                    <div>
                      <p className="text-sm font-bold mb-3">
                        추천 루틴
                      </p>

                      <div className="space-y-2">
                        {routineEntries.map(
                          ([category, productId]) => {
                            const product =
                              getProductById(
                                productId
                              );

                            if (!product) {
                              return null;
                            }

                            return (
                              <div
                                key={category}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 px-4 py-3"
                              >
                                <span className="text-xs text-gray-400">
                                  {getCategoryLabel(
                                    category
                                  )}
                                </span>

                                <span className="text-sm font-semibold text-right">
                                  {product.name}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

{!isSurvey && (
  <div className="mt-5 space-y-3">

    {/* 단계 변화 */}
    <div className="rounded-2xl bg-emerald-50 p-4">
      <p className="text-xs text-emerald-600 mb-1">
        단계 변화
      </p>

      <p className="text-sm font-bold text-emerald-900">
        {item.previousState?.hydrationLevel ?? "-"}
        단계
        {" → "}
        {item.nextState?.hydrationLevel ?? "-"}
        단계
      </p>
    </div>

    {/* 변화 이유 */}
    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
      <p className="text-xs text-gray-400 mb-3">
        왜 이렇게 바뀌었나요?
      </p>

      <div className="space-y-2">
        {changeReasons.map((reason) => (
          <p
            key={reason}
            className="text-sm text-gray-700 leading-relaxed break-keep"
          >
            · {reason}
          </p>
        ))}
      </div>
    </div>

{/* 피부 고민 변화 */}
<div className="rounded-2xl bg-white border border-gray-200 p-4">
  <div className="mb-4">
    <p className="text-xs text-gray-400 mb-1">
      피부 반응 변화
    </p>

    <p className="text-sm font-bold text-gray-900">
      이전 체크와 비교했어요
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {conditionChanges.map(
      (condition) => {
        const statusClass =
          condition.status === "개선"
            ? "bg-emerald-100 text-emerald-700"
            : condition.status === "악화"
            ? "bg-rose-100 text-rose-700"
            : condition.status === "유지"
            ? "bg-gray-100 text-gray-600"
            : "bg-blue-100 text-blue-700";

        return (
          <div
            key={condition.id}
            className="rounded-2xl bg-gray-50 p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-bold text-gray-800">
                {condition.label}
              </p>

              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${statusClass}`}
              >
                {condition.status}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              현재 상태 ·{" "}
              {condition.stateLabel}
            </p>
          </div>
        );
      }
    )}
  </div>

  {!previousFeedbackRecord && (
    <p className="mt-4 text-xs text-gray-400 leading-relaxed">
      첫 체크는 비교할 이전 기록이 없어
      현재 상태만 표시해요.
    </p>
  )}
</div>
    {/* 제품 변화 */}
    {previousRecord && (
      <div className="rounded-2xl bg-white border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              루틴 변경
            </p>

            <p className="text-sm font-bold text-gray-900">
              이번 체크에서 바뀐 제품
            </p>
          </div>

          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {changedRoutineCount}개 변경
          </span>
        </div>

        <div className="space-y-3">
          {routineChanges.map((change) => (
            <div
              key={change.category}
              className="rounded-2xl bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-bold text-gray-500">
                  {getCategoryLabel(
                    change.category
                  )}
                </p>

                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    change.changed
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {change.changed
                    ? "변경"
                    : "유지"}
                </span>
              </div>

              {change.changed ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 line-through">
                    {change.previousProduct?.name ||
                      "이전 제품 없음"}
                  </p>

                  <p className="text-sm font-bold text-gray-900">
                    ↓
                  </p>

                  <p className="text-sm font-bold text-gray-900">
                    {change.currentProduct?.name ||
                      "추천 제품 없음"}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-700">
                  {change.currentProduct?.name ||
                    change.previousProduct?.name ||
                    "제품 정보 없음"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
                </div>
              );
            })}
        </div>
      )}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setStep("start")}
          className="px-6 py-3 rounded-2xl text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          시작 화면으로 돌아가기
        </button>
      </div>
    </div>
  </section>
)}

{step === "quickRecommend" && (
  <section>
    <SectionTitle
      title="내 피부타입으로 바로 추천받기"
      desc="본인 피부타입에 가까운 항목을 선택하면 수분감 단계에 맞춰 루틴을 추천합니다."
    />

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      <button
        onClick={() => setQuickLevel(3)}
        className={`rounded-3xl border p-6 text-left transition active:scale-[0.98] ${
          quickLevel === 3
            ? "bg-black text-white border-black"
            : "bg-white border-gray-100 hover:shadow-md"
        }`}
      >
        <p className="text-sm opacity-70 mb-2">1~3단계</p>
        <h3 className="text-xl font-bold mb-2">건성 / 건조함</h3>
        <p className="text-sm leading-relaxed break-keep opacity-80">
          세안 후 당김이 있고 보습감이 오래가지 않는 타입
        </p>
      </button>

      <button
        onClick={() => setQuickLevel(5)}
        className={`rounded-3xl border p-6 text-left transition active:scale-[0.98] ${
          quickLevel === 5
            ? "bg-black text-white border-black"
            : "bg-white border-gray-100 hover:shadow-md"
        }`}
      >
        <p className="text-sm opacity-70 mb-2">4~6단계</p>
        <h3 className="text-xl font-bold mb-2">수부지 / 복합성</h3>
        <p className="text-sm leading-relaxed break-keep opacity-80">
          속은 건조한데 시간이 지나면 유분이 올라오는 타입
        </p>
      </button>

      <button
        onClick={() => setQuickLevel(8)}
        className={`rounded-3xl border p-6 text-left transition active:scale-[0.98] ${
          quickLevel === 8
            ? "bg-black text-white border-black"
            : "bg-white border-gray-100 hover:shadow-md"
        }`}
      >
        <p className="text-sm opacity-70 mb-2">7~10단계</p>
        <h3 className="text-xl font-bold mb-2">지성 / 번들거림</h3>
        <p className="text-sm leading-relaxed break-keep opacity-80">
          유분감이 많고 무거운 제품이 답답하게 느껴지는 타입
        </p>
      </button>
    </div>

    <div className="max-w-3xl mx-auto mb-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <p className="text-sm text-gray-500 mb-2">선택된 수분감 단계</p>
        <div className="text-4xl font-bold mb-3">{quickLevel}단계</div>
        <ul className="space-y-2">
          {quickRoutineReason.map((text) => (
            <li
              key={text}
              className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
            >
              · {text}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="mb-10">
      <SectionTitle
        title="추천 루틴"
        desc="선택한 피부타입에 맞춰 클렌저, 토너, 세럼, 크림을 하나씩 추천합니다."
      />

<RoutineProductScroller
  productsByCategory={quickRoutine.products}
  userContext={{
    level: quickLevel,
    isSensitive: false,
    troubleScore: 0,
    skinType:
      quickLevel <= 4 ? "건성" : quickLevel <= 6 ? "수부지" : "지성",
    season: "spring",
    goal:
      quickLevel <= 4
        ? "보습"
        : quickLevel <= 6
        ? "밸런스"
        : "유분 밸런스",
  }}
/>
    </div>

<div className="flex flex-col sm:flex-row gap-3 justify-center">
  <button
    onClick={() => setStep("start")}
    className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
  >
    시작 화면으로 돌아가기
  </button>

  <PrimaryButton
  onClick={startQuickJourneyFeedback}
>
  이 루틴으로 시작하기
</PrimaryButton>
</div>
  </section>
)}
{step === "survey" && currentSurveyQuestion && (
  <section>
    <SectionTitle
      title="피부 설문 시작"
      desc="한 번에 하나씩만 답하면 돼요. 느껴지는 상태에 가장 가까운 답변을 골라주세요."
    />

    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-500">
            {surveyIndex + 1} / {skinSurveyQuestions.length}
          </p>

          <p className="text-sm text-gray-400">
            {Math.round(surveyProgress)}%
          </p>
        </div>

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-300"
            style={{ width: `${surveyProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
        <p className="text-sm text-gray-400 mb-3">
          질문 {surveyIndex + 1}
        </p>

        <h2 className="text-2xl sm:text-3xl font-black leading-relaxed break-keep mb-6">
          {currentSurveyQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentSurveyQuestion.options.map((option) => {
            const active =
              currentSurveyQuestion.type === "multi"
                ? Array.isArray(currentSurveyAnswer) &&
                  currentSurveyAnswer.includes(option.label)
                : currentSurveyAnswer === option.label;

            return (
              <button
                key={option.label}
                onClick={() =>
                  handleSurveyAnswer(currentSurveyQuestion, option)
                }
                className={`w-full text-left px-5 py-4 rounded-2xl text-sm sm:text-base border transition active:scale-[0.98] break-keep ${
                  active
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {currentSurveyQuestion.type === "multi" && (
          <p className="mt-4 text-xs sm:text-sm text-gray-400 leading-relaxed break-keep">
            여러 개 선택할 수 있어요. 다 골랐으면 다음을 눌러주세요.
          </p>
        )}
      </div>

      <div className="mt-8 flex gap-3 justify-between">
        <button
          onClick={handlePrevSurvey}
          className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          {surveyIndex === 0 ? "시작 화면으로" : "이전"}
        </button>

        <PrimaryButton
          onClick={handleNextSurvey}
          disabled={!isCurrentSurveyAnswered}
        >
          {isLastSurveyQuestion ? "피부 고민 선택" : "다음"}
        </PrimaryButton>
      </div>
    </div>
  </section>
)}

{step === "issueSelect" && (
  <section>
    <SectionTitle
      title="지금 가장 신경 쓰이는 피부 고민은?"
      desc="기본 피부 상태와 별개로, 현재 가장 먼저 관리하고 싶은 문제를 하나 선택해주세요."
    />

    <div className="max-w-3xl mx-auto">
      <div className="mb-6 bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6">
        <p className="text-sm text-gray-400 mb-2">
          기본 피부 분석
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-2 bg-gray-100 rounded-full text-sm font-semibold">
            {surveyResult.skinType}
          </span>

          <span className="px-3 py-2 bg-gray-100 rounded-full text-sm font-semibold">
            수분감 {surveyResult.hydrationLevel}단계
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-500 leading-relaxed break-keep">
          기본 피부 상태는 확인했어요. 이제 현재 가장 신경 쓰이는 문제를
          확인해서 추천 방향을 더 구체적으로 좁혀볼게요.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skinConcernOptions.map((concern) => {
          const active = mainConcern === concern.id;

          return (
            <button
              key={concern.id}
              onClick={() => {
  if (mainConcern !== concern.id) {
    setIssueAnswers({});
    setIssueIndex(0);
  }

  setMainConcern(concern.id);
}}
              className={`rounded-3xl border p-5 text-left transition active:scale-[0.98] ${
                active
                  ? "bg-black text-white border-black shadow-md"
                  : "bg-white border-gray-100 hover:shadow-md"
              }`}
            >
              <h3 className="text-lg font-bold mb-2 break-keep">
                {concern.label}
              </h3>

              <p
                className={`text-sm leading-relaxed break-keep ${
                  active ? "text-white/70" : "text-gray-500"
                }`}
              >
                {concern.desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <button
          onClick={() => {
            setSurveyIndex(skinSurveyQuestions.length - 1);
            setStep("survey");
          }}
          className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          이전
        </button>

<PrimaryButton
  disabled={!mainConcern}
  onClick={() => {
if (
  mainConcern === "inflammatory_acne" ||
  mainConcern === "closed_comedones" ||
  mainConcern === "blackhead_sebum" ||
  mainConcern === "dehydration" ||
  mainConcern === "sensitivity_redness" || 
  mainConcern === "oiliness"
) {
  setIssueIndex(0);
  setStep("issueDetail");
  return;
}

  saveSurveyResult();
setStep("surveyResult");
  }}
>
  다음
</PrimaryButton>
      </div>
    </div>
  </section>
)}

{step === "issueDetail" && currentIssueQuestion && (
  <section>
<SectionTitle
  title={`${selectedConcern?.label || "피부 고민"} 상태를 조금 더 확인할게요`}
  desc="현재 상태를 더 구체적으로 확인하면 피부 루틴과 관리 방향을 더 정확하게 조정할 수 있어요."
/>

    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-500">
            {issueIndex + 1} / {activeIssueQuestions.length}
          </p>

          <p className="text-sm text-gray-400">
            {Math.round(issueProgress)}%
          </p>
        </div>

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-300"
            style={{ width: `${issueProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-6 sm:p-8">
        <p className="text-sm text-gray-400 mb-3">
  현재 고민 · {selectedConcern?.label}
</p>

        <h2 className="text-2xl sm:text-3xl font-black leading-relaxed break-keep mb-6">
          {currentIssueQuestion.q}
        </h2>

        <div className="space-y-3">
          {currentIssueQuestion.options.map((option) => {
            const active =
              currentIssueAnswer?.value === option.value;

            return (
              <button
                key={option.value}
                onClick={() =>
                  handleIssueAnswer(
                    currentIssueQuestion,
                    option
                  )
                }
                className={`w-full text-left px-5 py-4 rounded-2xl text-sm sm:text-base border transition active:scale-[0.98] break-keep ${
                  active
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex gap-3 justify-between">
        <button
          onClick={handlePrevIssue}
          className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          이전
        </button>

        <PrimaryButton
          onClick={handleNextIssue}
          disabled={!currentIssueAnswer}
        >
          {isLastIssueQuestion
            ? "분석 결과 보기"
            : "다음"}
        </PrimaryButton>
      </div>
    </div>
  </section>
)}

{step === "surveyResult" && (
  <section className="space-y-10">
    <SurveyResultOverview result={finalSkinProfile} />

{activeIssueGuide && (
  <SkinIssueGuideCard
    guide={activeIssueGuide}
  />
)}
    <div className="mb-10">
      <SectionTitle
        title="추천 루틴"
        desc="설문 결과에 맞춰 클렌저, 토너, 세럼, 크림을 하나씩 추천합니다."
      />

      <RoutineProductScroller
        productsByCategory={surveyRoutine.products}
        userContext={surveyUserContext}
      />
    </div>

{!activeIssueGuide && (
  <div className="max-w-3xl mx-auto mb-8">
    <SectionTitle
      title="피부 고민 관리 방향"
      desc="선택한 피부 고민에 맞춘 기본 관리 가이드입니다."
    />

    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <ul className="space-y-2">
        {surveyResult.solution.map((text) => (
          <li
            key={text}
            className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
          >
            · {text}
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

    {surveyResult.lifestyleAdvice.length > 0 && (
      <div className="max-w-3xl mx-auto mb-8">
        <SectionTitle
          title="생활습관 체크"
          desc="피부 컨디션에 영향을 줄 수 있는 생활 요소입니다."
        />

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <ul className="space-y-2">
            {surveyResult.lifestyleAdvice.map((text) => (
              <li
                key={text}
                className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
              >
                · {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}

    <div className="max-w-3xl mx-auto mb-8">
      <div className="bg-amber-50 rounded-3xl p-5 sm:p-6 border border-amber-100">
        <p className="text-sm font-semibold text-amber-800 mb-3">
          피부과 상담이 필요한 경우
        </p>

        <ul className="space-y-1">
          <li className="text-sm text-amber-800 leading-relaxed break-keep">
            · 붉고 아픈 트러블이 반복될 때
          </li>
          <li className="text-sm text-amber-800 leading-relaxed break-keep">
            · 고름, 결절, 흉터가 생길 때
          </li>
          <li className="text-sm text-amber-800 leading-relaxed break-keep">
            · 따가움, 진물, 심한 각질이 동반될 때
          </li>
          <li className="text-sm text-amber-800 leading-relaxed break-keep">
            · 6~8주 이상 관리해도 변화가 없을 때
          </li>
        </ul>
      </div>
    </div>

    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
<button
  onClick={() => {
    setSurveyAnswers({});
    setSurveyIndex(0);
    setStep("survey");
  }}
        className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
      >
        설문 다시 하기
      </button>

<PrimaryButton onClick={startSavedFeedback}>
  2주 사용 후 피드백 입력
</PrimaryButton>
</div>
</section>
)}
        {step === "starter" && starterRoutine && (
          <section>
            <SectionTitle
              title={starterRoutineInfo.label}
              desc="처음 사용하는 사람도 시작하기 쉬운 기본 스타터 세트입니다."
            />

<RoutineProductScroller
  productsByCategory={starterRoutine.products}
  userContext={userContext}
/>

            <div className="max-w-3xl mx-auto mt-8">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center">
                <p className="text-lg font-semibold leading-relaxed break-keep mb-2">
                  2주 정도 사용해본 뒤 다음 단계로 넘어가세요
                </p>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep">
                  사용 후 당김, 번들거림, 답답함, 트러블 변화를 기준으로 더 촉촉하게 갈지,
                  그대로 갈지, 더 가볍게 갈지 조정합니다.
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <PrimaryButton
  onClick={() => {
    setBaseLevel(starterLevel);
    setAnswers({});
    setStep("feedback");
  }}
>
  2주 사용 후 피드백 입력
</PrimaryButton>
            </div>
          </section>
        )}

        {step === "feedback" && (
          <section>
            <SectionTitle
              title="사용 후 피드백"
              desc="추천받은 루틴을 약 2주 사용한 후 느낀 피부 변화를 선택해주세요."
            />

            <div className="max-w-3xl mx-auto space-y-5">
              {feedbackQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5 sm:p-6 min-h-[132px]"
                >
                  <p className="text-base sm:text-lg font-semibold leading-relaxed break-keep mb-4">
                    {q.q}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {q.options.map((option) => {
                      const active = answers[q.id]?.label === option.label;


                      return (
                        <button
                          key={option.label}
                          onClick={() => handleAnswer(q.id, option)}
                          className={`px-4 py-2 rounded-2xl text-sm border transition active:scale-95 ${
                            active
                              ? "bg-black text-white border-black shadow-sm"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto mt-8">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500 break-keep mb-2">예상 다음 단계</p>
                <div className="text-3xl font-bold mb-2">{nextLevel}</div>
                <p className="text-sm text-gray-600 leading-relaxed break-keep">
                  {nextRoutineInfo.label}
                </p>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <PrimaryButton
  onClick={saveFeedbackResult}
  disabled={!isComplete}
>
  다음 추천 보기
</PrimaryButton>
            </div>
          </section>
        )}
        
        

        {step === "result" && nextRoutine && (
          <section>
            <SectionTitle
              title={nextRoutineInfo.label}
              desc={nextRoutineInfo.summary}
            />

            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <p className="text-sm text-gray-500 break-keep mb-3">
                  2주 사용 후 피드백 기준 결과
                </p>
                <div className="flex flex-wrap gap-3 items-center mb-4">
                  <div className="text-5xl font-bold">{nextLevel}</div>
                  <div className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep">
                    기준 단계 {baseLevel} → 다음 단계 {nextLevel}
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep">
                  건조하고 당기면 더 촉촉한 쪽으로, 무겁고 번들거리면 더 가벼운 쪽으로 이동합니다.
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep mt-3">
                  {levelChangeMessage}
                </p>
              </div>
            </div>

<FeedbackAdviceCard advice={feedbackAdvice} />
            
<div className="max-w-3xl mx-auto mb-8">
  <div className="bg-gray-50 rounded-3xl p-5 sm:p-6">
    <p className="text-sm text-gray-500 mb-3">추천 루틴 설명</p>

    <ul className="space-y-2">
      {routineReason.map((text) => (
        <li
          key={text}
          className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep"
        >
          · {text}
        </li>
      ))}
    </ul>
  </div>
</div>
            <div className="mb-10">
              <SectionTitle
                title="다음 단계 기본 루틴"
                desc="2주 사용 후 반응을 반영한 다음 추천 루틴입니다."
              />

<RoutineProductScroller
  productsByCategory={nextRoutine.products}
  userContext={userContext}
/>
            </div>

            <div className="max-w-3xl mx-auto">
              <SectionTitle
                title="함께 보기 좋은 성분"
                desc="수분감 단계와 트러블 반응을 함께 반영한 추천입니다."
              />

              <div className="space-y-6">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6"
                  >
<div className="mb-5">
  <p className="text-xl font-bold leading-relaxed break-keep mb-2">
    {ingredient}
  </p>

  <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-keep mb-3">
    {ingredientsInfo[ingredient].effect}
  </p>

  {ingredientsInfo[ingredient].recommendFor && (
    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-keep mb-2">
      추천 대상: {ingredientsInfo[ingredient].recommendFor}
    </p>
  )}

  {ingredientsInfo[ingredient].caution && (
    <div className="bg-amber-50 rounded-2xl p-3 text-sm text-amber-800 leading-relaxed break-keep">
      주의: {ingredientsInfo[ingredient].caution}
    </div>
  )}
</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sortProductsForDisplay(
                        filterByLevel(
products.filter(
  (product) =>
    isProductAvailable(product) &&
    product.ingredients.includes(
      ingredient
    )
)
),
                        nextLevel
                      ).map((product) => (
<ProductCard
  key={product.id}
  categoryKey={product.category}
  product={product}
  userContext={userContext}
/>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {ingredientsInfo[ingredient].target.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1 rounded-full bg-white border border-gray-200 text-sm text-gray-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setStep("feedback")}
                className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
              >
                피드백 다시 선택
              </button>
              <PrimaryButton onClick={resetFlow}>처음부터 다시</PrimaryButton>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-900 mb-2">
              DearSince 안내
            </p>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed break-keep">
              DearSince의 추천 결과는 사용자가 입력한 설문 답변을 바탕으로 한
              피부 관리 가이드입니다. 질환의 진단이나 치료를 대신하지 않으며,
              통증, 고름, 심한 붉어짐, 진물, 흉터가 있거나 증상이 반복된다면
              피부과 상담을 권장합니다.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                저장 기능 안내
              </p>
              <p className="text-xs text-gray-500 leading-relaxed break-keep">
                최근 설문 결과는 현재 사용 중인 브라우저에만 저장됩니다.
                브라우저 데이터 삭제, 시크릿 모드, 다른 기기에서는 결과가
                보이지 않을 수 있습니다.
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                제휴 링크 안내
              </p>
              <p className="text-xs text-gray-500 leading-relaxed break-keep">
                일부 제품 링크는 쿠팡 파트너스 활동의 일환으로, 이에 따른
                일정액의 수수료를 제공받을 수 있습니다.
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            © DearSince. Personalized skincare routine guide.
          </p>
        </div>
      </footer>
    </div>
  );
}