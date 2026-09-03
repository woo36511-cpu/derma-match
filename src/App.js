import { skinSurveyQuestions } from "./data/skinSurvey";
import { analyzeSkinSurvey } from "./utils/analyzeSkinSurvey";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { products } from "./data/products";
import { starterRoutineByLevel } from "./data/routines";
import { ingredientsInfo } from "./data/ingredients";

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
      { label: "괜찮음", value: 0 }
    ]
  },
  {
    id: "oil",
    q: "시간이 지나면서 번들거림은 어떤가요?",
    options: [
      { label: "거의 없음", value: -1 },
      { label: "적당함", value: 0 },
      { label: "많이 올라옴", value: 2 }
    ]
  },
  {
    id: "feel",
    q: "제품을 바른 직후 느낌은 어땠나요?",
    options: [
      { label: "건조함", value: -2 },
      { label: "편안함", value: 0 },
      { label: "답답함", value: 2 }
    ]
  },
  {
    id: "trouble",
    q: "사용 후 트러블 변화는 어땠나요?",
    options: [
      { label: "없음", value: 0 },
      { label: "조금 생김", value: 1 },
      { label: "많이 생김", value: 2 }
    ]
  }
];

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function calculateNextLevel(currentLevel, answers) {
  let next = currentLevel;
  Object.values(answers).forEach((value) => {
    next += value;
  });
  return clamp(next, 1, 10);
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

export default function App() {
  const starterLevel = 5;

const [step, setStep] = useState("start");
const [answers, setAnswers] = useState({});
const [quickLevel, setQuickLevel] = useState(5);
const isBrowserBackRef = useRef(false);
const [baseLevel, setBaseLevel] = useState(5);
const [surveyAnswers, setSurveyAnswers] = useState({});
const [surveyIndex, setSurveyIndex] = useState(0);

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

const surveyRoutine = buildDynamicRoutine(surveyResult.hydrationLevel);

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

const surveyUserContext = {
  level: surveyResult.hydrationLevel,
  isSensitive:
    surveyResult.skinType === "민감성" || surveyResult.scores.sensitivity >= 2,
  troubleScore: surveyResult.scores.acne ?? 0,
  skinType: surveyResult.skinType,
  season: "spring",
  goal: surveyResult.issueLabel,
};

  const ingredients = getRecommendedIngredients(nextLevel, answers.trouble ?? 0);
  const levelChangeMessage = getLevelChangeMessage(baseLevel, nextLevel);
const userContext = {
  level: nextLevel,
  isSensitive: (answers.dry ?? 0) <= -1 || (answers.trouble ?? 0) >= 1,
  troubleScore: answers.trouble ?? 0,
  skinType: nextLevel <= 4 ? "건성" : nextLevel <= 6 ? "수부지" : "지성",
  season: "spring",
  goal:
    (answers.trouble ?? 0) >= 1
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
const resetFlow = () => {
  setAnswers({});
  setSurveyAnswers({});
  setBaseLevel(5);
  setSurveyIndex(0);
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
    setStep("surveyResult");
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
          {isLastSurveyQuestion ? "결과 보기" : "다음"}
        </PrimaryButton>
      </div>
    </div>
  </section>
)}
{step === "surveyResult" && (
  <section className="space-y-10">
    <SurveyResultOverview result={surveyResult} />

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
                      const active = answers[q.id] === option.value;

                      return (
                        <button
                          key={option.label}
                          onClick={() => handleAnswer(q.id, option.value)}
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
    </div>
  );
}