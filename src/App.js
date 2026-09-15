import { skinSurveyQuestions } from "./data/skinSurvey";
import { analyzeSkinSurvey } from "./utils/analyzeSkinSurvey";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { products } from "./data/products";
import { starterRoutineByLevel } from "./data/routines";
import { ingredientsInfo } from "./data/ingredients";

const SAVED_SURVEY_KEY = "dearsince_saved_survey_result";

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

function getRecommendedIngredients(level, troubleScore) {
  const list = [];

  if (level <= 3) {
    list.push("세라마이드", "판테놀", "히알루론산");
  } else if (level <= 5) {
    list.push("히알루론산", "판테놀");
  } else if (level <= 7) {
    list.push("판테놀", "나이아신아마이드");
  } else {
    list.push("나이아신아마이드");
  }

  if (troubleScore >= 1 && !list.includes("BHA")) {
    list.push("BHA");
  }

  return list;
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

function isValidProductLink(link) {
  return !!link && link !== "#";
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
function pickBestProductByCategory(category, level) {
  let targetCategory = category;

  // 클렌저는 피부 단계에 따라 세부 카테고리로 자동 분기
  if (category === "cleanser") {
    if (level <= 3) {
      targetCategory = "cleansing_milk";
    } else if (level >= 7) {
      targetCategory = "gel_cleanser";
    } else {
      targetCategory = "cleanser";
    }
  }

  let categoryProducts = products.filter(
    (product) => product.category === targetCategory
  );

  // 세부 카테고리에 제품이 없으면 기본 클렌저로 fallback
  if (categoryProducts.length === 0 && category === "cleanser") {
    categoryProducts = products.filter(
      (product) => product.category === "cleanser"
    );
  }

  const levelMatchedProducts = filterByLevel(categoryProducts, level);
  const sortedProducts = sortProductsForDisplay(levelMatchedProducts, level);

  return sortedProducts[0] || null;
}

function buildDynamicRoutine(level) {
  return {
    label: `${level}단계 맞춤 루틴`,
    description: "현재 수분감 단계에 맞춰 자동으로 구성한 추천 루틴입니다.",
    products: {
      cleanser: pickBestProductByCategory("cleanser", level),
      toner: pickBestProductByCategory("toner", level),
      serum: pickBestProductByCategory("serum", level),
      cream: pickBestProductByCategory("cream", level),
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

function buildRecommendationReasons(product, currentLevel) {
  const reasons = [];

  const hydrationDiff = Math.abs((product.hydrationLevel ?? 5) - currentLevel);

  if (hydrationDiff === 0) {
    reasons.push("현재 수분감 단계와 잘 맞음");
  } else if (hydrationDiff === 1) {
    reasons.push("현재 단계와 크게 벗어나지 않아 무난하게 쓰기 좋음");
  }

  if (product.beginnerFriendly) {
    reasons.push("초보자도 시작하기 부담이 적은 제품");
  }

  if (product.sensitivitySafe) {
    reasons.push("민감한 피부도 비교적 편하게 쓰기 쉬운 편");
  }

  if (product.concerns?.includes("hydration")) {
    reasons.push("기본 수분 보충용으로 활용하기 좋음");
  }

  if (product.concerns?.includes("soothing")) {
    reasons.push("예민함이나 붉어짐이 신경 쓰일 때 진정용으로 보기 좋음");
  }

  if (product.concerns?.includes("barrier")) {
    reasons.push("장벽 보완이 필요한 피부에 잘 맞는 편");
  }

  if (product.concerns?.includes("acne")) {
    reasons.push("트러블이나 막힘 관리가 필요한 경우 같이 보기 좋음");
  }

  if (product.category === "cleanser") {
    reasons.push("루틴 시작 단계에서 부담이 적은 세안용 제품");
  }

  return reasons.slice(0, 3);
}
function getRecommendedAmount(product, userContext) {
  if (!product?.usageAmount || !userContext) return null;

  const skinType = userContext.skinType;

  if (skinType === "지성" || skinType === "수부지") {
    return product.usageAmount.oily;
  }

  if (skinType === "건성") {
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
    ? buildRecommendationReasons(product, userContext.level)
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
function SurveyResultOverview({ result }) {
  if (!result) return null;

  const levelInfo = getLevelDescription(result.hydrationLevel);
  const directions = getCareDirections(result);
  const cautions = getResultCautions(result);
  const reasons = Array.isArray(result.reasons) ? result.reasons.slice(0, 6) : [];

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

function InflammatoryAcneGuideCard({ guide }) {
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
  } catch (error) {
    console.error("저장된 설문 결과를 불러오지 못했어요.", error);
  }
}, []);


  const nextLevel = useMemo(() => {
  return calculateNextLevel(baseLevel, answers);
}, [baseLevel, answers]);

  const starterRoutineInfo = routineMap[starterLevel];
  const nextRoutineInfo = routineMap[nextLevel];

  const starterRoutine = getRoutineProducts(starterLevel);
  const nextRoutine = buildDynamicRoutine(nextLevel);
const quickRoutine = buildDynamicRoutine(quickLevel);
const quickRoutineReason = buildRoutineReason(quickLevel);
const surveyResult = useMemo(() => {
  return analyzeSkinSurvey(surveyAnswers, skinSurveyQuestions);
}, [surveyAnswers]);

const acneGuide = useMemo(() => {
  if (mainConcern !== "inflammatory_acne") {
    return null;
  }

  return analyzeInflammatoryAcneGuide(issueAnswers);
}, [mainConcern, issueAnswers]);

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

  acneGuide,
};

const surveyRoutine = buildDynamicRoutine(surveyResult.hydrationLevel);
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
  level: surveyResult.hydrationLevel,
  isSensitive:
    surveyResult.skinType === "민감성" || surveyResult.scores.sensitivity >= 2,
  troubleScore:
  mainConcern === "inflammatory_acne"
    ? Math.max(surveyResult.scores.acne ?? 0, 1)
    : surveyResult.scores.acne ?? 0,
  skinType: surveyResult.skinType,
  season: "spring",
  goal: finalSkinProfile.issueLabel,
};

  const ingredients = getRecommendedIngredients(
  nextLevel,
  getFeedbackValue(answers, "trouble")
);
  const levelChangeMessage = getLevelChangeMessage(baseLevel, nextLevel);
  const feedbackAdvice = getFeedbackAdvice(answers);
const userContext = {
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
  const data = {
  surveyAnswers,
  mainConcern,
  issueAnswers,
  savedAt: new Date().toISOString(),
};

  try {
    localStorage.setItem(SAVED_SURVEY_KEY, JSON.stringify(data));
    setSavedSurvey(data);
  } catch (error) {
    console.error("설문 결과를 저장하지 못했어요.", error);
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
  if (!savedSurvey?.surveyAnswers || !savedSurveyResult) return;

  setSurveyAnswers(savedSurvey.surveyAnswers);
  setBaseLevel(savedSurveyResult.hydrationLevel);
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
  setStep("start");
};
const handlePrevSurvey = () => {
  if (surveyIndex === 0) {
    setStep("start");
    return;
  }

  setSurveyIndex((prev) => Math.max(prev - 1, 0));
};

const handleNextSurvey = () => {
  if (!isCurrentSurveyAnswered) return;

if (isLastSurveyQuestion) {
  saveSurveyResult();
  setStep("issueSelect");
  return;
}

  setSurveyIndex((prev) =>
    Math.min(prev + 1, skinSurveyQuestions.length - 1)
  );
};

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
      onClick={() => setStep("quickRecommend")}
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
  onClick={() => setStep("survey")}
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
  {hasSavedSurvey && (
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
      </div>
    </div>
  </div>
)}
<SeoContentSection />
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
    onClick={() => {
      setBaseLevel(quickLevel);
      setAnswers({});
      setStep("feedback");
    }}
  >
    2주 사용 후 피드백 입력
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
    if (mainConcern === "inflammatory_acne") {
      setIssueIndex(0);
      setStep("issueDetail");
      return;
    }

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
      title="염증성 여드름 상태를 조금 더 확인할게요"
      desc="현재 상태를 더 구체적으로 확인하면 피부 루틴을 더 정확하게 조정할 수 있어요."
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
          현재 고민 · 염증성 여드름
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

    {mainConcern === "inflammatory_acne" && (
      <InflammatoryAcneGuideCard
        guide={acneGuide}
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

      <PrimaryButton
        onClick={() => {
          setBaseLevel(surveyResult.hydrationLevel);
          setAnswers({});
          setStep("feedback");
        }}
      >
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
              <PrimaryButton onClick={() => setStep("result")} disabled={!isComplete}>
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
  products.filter((product) => product.ingredients.includes(ingredient)),
  nextLevel
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