import React, { useMemo, useState } from "react";
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
        className="w-full h-44 object-cover rounded-2xl mb-4"
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

export default function App() {
  const starterLevel = 5;

  const [step, setStep] = useState("start");
  const [answers, setAnswers] = useState({});
const [quickLevel, setQuickLevel] = useState(5);

  const isComplete = feedbackQuestions.every((q) => answers[q.id] !== undefined);

  const nextLevel = useMemo(() => {
    return calculateNextLevel(starterLevel, answers);
  }, [answers]);

  const starterRoutineInfo = routineMap[starterLevel];
  const nextRoutineInfo = routineMap[nextLevel];

  const starterRoutine = getRoutineProducts(starterLevel);
  const nextRoutine = buildDynamicRoutine(nextLevel);
const quickRoutine = buildDynamicRoutine(quickLevel);
const quickRoutineReason = buildRoutineReason(quickLevel);

  const ingredients = getRecommendedIngredients(nextLevel, answers.trouble ?? 0);
  const levelChangeMessage = getLevelChangeMessage(starterLevel, nextLevel);
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

  const resetFlow = () => {
    setAnswers({});
    setStep("start");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold break-keep">Derma Match</h1>
            <p className="text-xs sm:text-sm text-gray-500 break-keep">
              2주 사용 후 반응 기반 추천
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
      onClick={() => setStep("starter")}
      className="bg-black text-white rounded-3xl shadow-sm p-6 sm:p-8 text-left hover:opacity-90 hover:-translate-y-1 transition active:scale-[0.98]"
    >
      <p className="text-sm text-white/60 mb-3">처음 시작해요</p>
      <h3 className="text-2xl font-bold mb-3 break-keep">
        처음이라 설문으로 시작할래요
      </h3>
      <p className="text-sm sm:text-base text-white/75 leading-relaxed break-keep mb-5">
        화장품이 처음이거나 피부타입이 애매하다면 중간 단계 루틴으로 시작한 뒤 2주 후 조정해요.
      </p>
      <span className="text-sm font-semibold text-white">
        기본 루틴 보기 →
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
        {Object.entries(quickRoutine.products).map(([key, item]) => (
          <ProductCard
            key={key}
            categoryKey={key}
            product={item}
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
        ))}
      </div>
    </div>

    <div className="flex justify-center">
      <button
        onClick={() => setStep("start")}
        className="px-6 py-3 rounded-2xl text-sm sm:text-base font-medium border border-gray-300 bg-white hover:bg-gray-100 transition"
      >
        시작 화면으로 돌아가기
      </button>
    </div>
  </section>
)}
        {step === "starter" && starterRoutine && (
          <section>
            <SectionTitle
              title={starterRoutineInfo.label}
              desc="처음 사용하는 사람도 시작하기 쉬운 기본 스타터 세트입니다."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
              {Object.entries(starterRoutine.products).map(([key, item]) => (
<ProductCard
  key={key}
  categoryKey={key}
  product={item}
  userContext={userContext}
/>
))}
            </div>

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
              <PrimaryButton onClick={() => setStep("feedback")}>
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
                    시작 단계 {starterLevel} → 다음 단계 {nextLevel}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
{Object.entries(nextRoutine.products).map(([key, item]) => (
<ProductCard
  key={key}
  categoryKey={key}
  product={item}
  userContext={userContext}
/>
))}
              </div>
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