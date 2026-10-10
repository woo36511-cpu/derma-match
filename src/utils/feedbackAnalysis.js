import { clamp } from "./clamp";
import { skinConcernOptions } from "../data/skinIssueQuestions";

export function getFeedbackValue(answers, id) {
  const answer = answers[id];

  if (typeof answer === "number") {
    return answer;
  }

  if (answer && typeof answer.value === "number") {
    return answer.value;
  }

  return 0;
}

export function calculateNextLevel(currentLevel, answers) {
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

export function getFeedbackOptionValue(feedbackAnswers = {}, id) {
  return feedbackAnswers[id]?.value ?? null;
}

export function buildFeedbackConfounders(feedbackAnswers = {}) {
  return {
    otherSkincareChange: getFeedbackOptionValue(
      feedbackAnswers,
      "otherSkincareChange",
    ),

    sleepStressChange: getFeedbackOptionValue(
      feedbackAnswers,
      "sleepStressChange",
    ),

    dietChange: getFeedbackOptionValue(feedbackAnswers, "dietChange"),

    medicationSupplementChange: getFeedbackOptionValue(
      feedbackAnswers,
      "medicationSupplementChange",
    ),

    environmentChange: getFeedbackOptionValue(
      feedbackAnswers,
      "environmentChange",
    ),
  };
}

export function buildFeedbackUsageReport(feedbackAnswers = {}) {
  return {
    routineUsage: getFeedbackOptionValue(feedbackAnswers, "routineUsage"),

    usageDuration: getFeedbackOptionValue(feedbackAnswers, "usageDuration"),
  };
}

export function buildFeedbackDataQuality(feedbackAnswers = {}) {
  const confounders = buildFeedbackConfounders(feedbackAnswers);

  const usage = buildFeedbackUsageReport(feedbackAnswers);

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
  } else if (usage.usageDuration === "7_13") {
    score -= 0.2;
  } else if (usage.usageDuration === "14_27") {
    score -= 0.05;
  }

  if (confounders.otherSkincareChange === "one") {
    score -= 0.15;
  }

  if (confounders.otherSkincareChange === "multiple") {
    score -= 0.3;
  }

  if (confounders.sleepStressChange === "mild") {
    score -= 0.08;
  }

  if (confounders.sleepStressChange === "major") {
    score -= 0.2;
  }

  if (confounders.dietChange === "mild") {
    score -= 0.05;
  }

  if (confounders.dietChange === "major") {
    score -= 0.12;
  }

  if (confounders.medicationSupplementChange === "changed") {
    score -= 0.2;
  }

  if (confounders.environmentChange === "changed") {
    score -= 0.1;
  }

  score = Math.max(0, Math.min(1, score));

  const majorConfounderCount = [
    confounders.otherSkincareChange === "multiple",
    confounders.sleepStressChange === "major",
    confounders.dietChange === "major",
    confounders.medicationSupplementChange === "changed",
    confounders.environmentChange === "changed",
  ].filter(Boolean).length;

  return {
    confidenceScore: Number(score.toFixed(2)),

    confidenceLevel: score >= 0.8 ? "high" : score >= 0.55 ? "medium" : "low",

    majorConfounderCount,

    // 아직 제품별 실제 사용 여부를
    // 구분해서 받지 않으므로 개별 제품의
    // 인과 효과를 단정하는 데이터로는 사용하지 않음
    productAttributionReady: false,
  };
}

export function buildSkinStateDelta(baseline = null, followUp = null) {
  if (!baseline || !followUp) {
    return null;
  }

  const keys = [
    "dryness",
    "oiliness",
    "dehydration",
    "sensitivity",
    "barrierStress",
    "cloggedPores",
    "acneActivity",
    "inflammation",
  ];

  return keys.reduce((result, key) => {
    result[key] = (followUp[key] ?? 0) - (baseline[key] ?? 0);

    return result;
  }, {});
}

export function getLevelChangeMessage(starterLevel, nextLevel) {
  if (nextLevel < starterLevel) {
    return "현재 반응 기준으로는 조금 더 촉촉한 루틴 쪽이 잘 맞을 가능성이 높아요.";
  }

  if (nextLevel > starterLevel) {
    return "현재 반응 기준으로는 조금 더 가벼운 루틴 쪽이 잘 맞을 가능성이 높아요.";
  }

  return "현재 반응 기준으로는 지금 단계의 밸런스가 가장 무난해 보여요.";
}

export function getFeedbackMainConcern(answers = {}, fallbackConcern = "") {
  const irritationLabel = answers.irritation?.label || "";

  const trouble = getFeedbackValue(answers, "trouble");

  const clogged = getFeedbackValue(answers, "clogged");

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

export function getFeedbackAdvice(answers) {
  const dry = getFeedbackValue(answers, "dry");
  const oil = getFeedbackValue(answers, "oil");
  const feel = getFeedbackValue(answers, "feel");
  const trouble = getFeedbackValue(answers, "trouble");
  const clogged = getFeedbackValue(answers, "clogged");

  const irritationLabel = answers.irritation?.label || "";
  const satisfactionLabel = answers.satisfaction?.label || "";

  const advice = [];

  if (dry <= -1) {
    advice.push(
      "아직 당김이 남아 있어 다음 루틴은 조금 더 촉촉한 보습 쪽으로 조정하는 게 좋아요.",
    );
  }

  if (oil >= 1) {
    advice.push(
      "번들거림이 느껴졌다면 무거운 제품보다 산뜻한 토너, 세럼, 젤크림 위주가 더 잘 맞을 수 있어요.",
    );
  }

  if (feel >= 1) {
    advice.push(
      "바른 직후 답답했다면 크림 양을 줄이거나 더 가벼운 제형으로 바꿔보는 게 좋아요.",
    );
  }

  if (trouble >= 1) {
    advice.push(
      "붉은 트러블이 생겼다면 새 제품을 한 번에 여러 개 쓰기보다 루틴을 단순하게 줄여서 확인해보세요.",
    );
  }

  if (clogged >= 1) {
    advice.push(
      "좁쌀이나 오돌토돌함이 늘었다면 오일, 무거운 크림, 과한 레이어링을 먼저 의심해볼 수 있어요.",
    );
  }

  if (
    irritationLabel.includes("따가움") ||
    irritationLabel.includes("붉어짐") ||
    irritationLabel.includes("불편함")
  ) {
    advice.push(
      "따가움이나 붉어짐이 있었다면 BHA, 레티놀, 고함량 기능성 제품은 잠시 줄이고 진정·장벽 제품 위주로 가는 게 안전해요.",
    );
  }

  if (satisfactionLabel.includes("안 맞는")) {
    advice.push(
      "제품이 전체적으로 안 맞는 느낌이라면 같은 단계 안에서도 제형이나 성분을 바꿔보는 방향이 좋아요.",
    );
  }

  if (advice.length === 0) {
    advice.push(
      "전체적으로 큰 불편감이 없다면 현재 단계의 루틴을 조금 더 유지해도 괜찮아 보여요.",
    );
  }

  return advice.slice(0, 5);
}

export function getJourneyChangeReasons(
  feedbackAnswers = {},
  previousState = {},
  nextState = {},
) {
  const reasons = [];

  const dry = getFeedbackValue(feedbackAnswers, "dry");

  const oil = getFeedbackValue(feedbackAnswers, "oil");

  const feel = getFeedbackValue(feedbackAnswers, "feel");

  const trouble = getFeedbackValue(feedbackAnswers, "trouble");

  const clogged = getFeedbackValue(feedbackAnswers, "clogged");

  const irritationLabel = feedbackAnswers.irritation?.label || "";

  if (dry <= -1) {
    reasons.push("사용 후에도 피부 당김이 남아 더 촉촉한 방향을 고려했어요.");
  }

  if (oil >= 1) {
    reasons.push(
      "시간이 지나면서 번들거림이 올라와 조금 더 가벼운 방향을 고려했어요.",
    );
  }

  if (feel >= 1) {
    reasons.push(
      "제품을 바른 뒤 무겁거나 답답한 느낌이 있어 제형을 가볍게 조정했어요.",
    );
  }

  if (trouble >= 1) {
    reasons.push(
      "붉은 트러블이 새로 생기거나 심해져 트러블 관리 비중을 높였어요.",
    );
  }

  if (clogged >= 1) {
    reasons.push(
      "좁쌀이나 오돌토돌함이 늘어 모공 막힘을 고려해 루틴을 조정했어요.",
    );
  }

  if (
    irritationLabel.includes("따가움") ||
    irritationLabel.includes("붉어짐") ||
    irritationLabel.includes("불편함")
  ) {
    reasons.push(
      "따가움이나 붉어짐 반응이 있어 자극을 줄이는 방향을 우선했어요.",
    );
  }

  if (
    previousState.mainConcern &&
    nextState.mainConcern &&
    previousState.mainConcern !== nextState.mainConcern
  ) {
    const nextConcernLabel = skinConcernOptions.find(
      (concern) => concern.id === nextState.mainConcern,
    )?.label;

    if (nextConcernLabel) {
      reasons.push(
        `피드백을 반영해 현재 주요 고민을 '${nextConcernLabel}' 쪽으로 다시 잡았어요.`,
      );
    }
  }

  if (reasons.length === 0) {
    if (previousState.hydrationLevel === nextState.hydrationLevel) {
      reasons.push("큰 불편감이 없어 현재 수분감 단계를 유지했어요.");
    } else {
      reasons.push(
        "전체 피드백을 반영해 현재 피부 반응에 가까운 단계로 조정했어요.",
      );
    }
  }

  return reasons.slice(0, 3);
}

export function getFeedbackConditionSnapshot(feedbackAnswers = {}) {
  const dry = getFeedbackValue(feedbackAnswers, "dry");

  const oil = getFeedbackValue(feedbackAnswers, "oil");

  const trouble = getFeedbackValue(feedbackAnswers, "trouble");

  const clogged = getFeedbackValue(feedbackAnswers, "clogged");

  const irritationLabel = feedbackAnswers.irritation?.label || "";

  let irritationSeverity = 0;

  if (
    irritationLabel.includes("자주") ||
    irritationLabel.includes("바르면 바로") ||
    irritationLabel.includes("불편함")
  ) {
    irritationSeverity = 2;
  } else if (irritationLabel.includes("가끔")) {
    irritationSeverity = 1;
  }

  const drynessSeverity = dry <= -2 ? 2 : dry <= -1 ? 1 : 0;

  return [
    {
      id: "dryness",
      label: "속당김",
      severity: drynessSeverity,
    },
    {
      id: "oiliness",
      label: "번들거림",
      severity: Math.max(0, Math.min(oil, 2)),
    },
    {
      id: "trouble",
      label: "붉은 트러블",
      severity: Math.max(0, Math.min(trouble, 2)),
    },
    {
      id: "clogged",
      label: "좁쌀 · 막힘",
      severity: Math.max(0, Math.min(clogged, 2)),
    },
    {
      id: "irritation",
      label: "따가움 · 붉어짐",
      severity: irritationSeverity,
    },
  ];
}

export function compareFeedbackConditions(
  currentAnswers = {},
  previousAnswers = null,
) {
  const current = getFeedbackConditionSnapshot(currentAnswers);

  const previous = previousAnswers
    ? getFeedbackConditionSnapshot(previousAnswers)
    : [];

  return current.map((currentItem) => {
    const previousItem = previous.find((item) => item.id === currentItem.id);

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

    const difference = currentItem.severity - previousItem.severity;

    return {
      ...currentItem,

      status: difference < 0 ? "개선" : difference > 0 ? "악화" : "유지",

      stateLabel,
    };
  });
}
