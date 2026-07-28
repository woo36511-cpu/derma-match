export function analyzeSkinSurvey(answers, questions) {
  const totalScores = {
    dryness: 0,
    oiliness: 0,
    sensitivity: 0,
    barrier: 0,
    dehydrated: 0,
    clogged: 0,
    acne: 0,
    inflammation: 0,
  };

  let mainIssue = "none";
  const lifestyleTags = [];
  const reasons = [];

  questions.forEach((question) => {
    const answer = answers[question.id];

    if (!answer) return;

    // 여러 개 선택하는 생활습관 질문
    if (question.type === "multi") {
      answer.forEach((selectedLabel) => {
        const selectedOption = question.options.find(
          (option) => option.label === selectedLabel
        );

        if (!selectedOption) return;

        if (selectedOption.lifestyle && selectedOption.lifestyle !== "none") {
          lifestyleTags.push(selectedOption.lifestyle);
          reasons.push(selectedOption.label);
        }
      });

      return;
    }

    // 일반 단일 선택 질문
    const selectedOption = question.options.find(
      (option) => option.label === answer
    );

    if (!selectedOption) return;

    if (selectedOption.scores) {
      Object.entries(selectedOption.scores).forEach(([key, value]) => {
        totalScores[key] = (totalScores[key] || 0) + value;
      });
    }

    if (selectedOption.issue) {
      mainIssue = selectedOption.issue;
    }

    reasons.push(selectedOption.label);
  });

  const skinType = getSkinType(totalScores);
  const hydrationLevel = getHydrationLevel(totalScores);
  const issueLabel = getIssueLabel(mainIssue);
  const lifestyleAdvice = getLifestyleAdvice(lifestyleTags);
  const solution = getSolutionByIssue(mainIssue);

  return {
    scores: totalScores,
    skinType,
    hydrationLevel,
    mainIssue,
    issueLabel,
    lifestyleTags,
    lifestyleAdvice,
    solution,
    reasons,
  };
}

function getSkinType(scores) {
  const { dryness, oiliness, dehydrated, sensitivity } = scores;

  if (sensitivity >= 2) {
    return "민감성";
  }

  if (dehydrated >= 2 && oiliness >= 1) {
    return "수부지";
  }

  if (dryness >= 3 && oiliness <= 1) {
    return "건성";
  }

  if (oiliness >= 3 && dryness <= 1) {
    return "지성";
  }

  if (oiliness >= 1 && dryness >= 1) {
    return "복합성";
  }

  return "중성";
}

function getHydrationLevel(scores) {
  const { dryness, oiliness, dehydrated } = scores;

  // 낮을수록 촉촉한 루틴, 높을수록 가벼운 루틴
  let level = 5;

  level -= dryness;
  level += oiliness;
  level += Math.floor(dehydrated / 2);

  if (level < 1) return 1;
  if (level > 10) return 10;

  return level;
}

function getIssueLabel(issue) {
  const map = {
    inflammatory_acne: "염증성 트러블",
    closed_comedones: "좁쌀 여드름",
    blackhead_sebum: "블랙헤드 / 피지",
    dehydration: "속당김",
    sensitivity_redness: "민감 / 홍조",
    none: "특별한 문제 없음",
  };

  return map[issue] || "특별한 문제 없음";
}

function getSolutionByIssue(issue) {
  const map = {
    inflammatory_acne: [
      "붉고 아픈 트러블이 반복된다면 화장품만으로 해결하기 어려울 수 있습니다.",
      "자극적인 각질 제거와 고함량 기능성 제품은 잠시 줄이는 것이 좋습니다.",
      "진정 제품과 가벼운 보습 위주로 루틴을 단순하게 구성하세요.",
      "통증, 고름, 흉터가 있다면 피부과 상담을 권장합니다.",
    ],

    closed_comedones: [
      "좁쌀 여드름은 피지와 각질이 막혀 생기는 경우가 많습니다.",
      "무거운 크림이나 오일 제품 사용량을 줄여보세요.",
      "BHA나 효소 클렌저는 주 1~2회처럼 낮은 빈도로 시작하는 것이 좋습니다.",
      "세안을 강하게 하기보다 잔여감을 줄이는 방향으로 관리하세요.",
    ],

    blackhead_sebum: [
      "블랙헤드와 피지는 과한 세안보다 꾸준한 피지 관리가 중요합니다.",
      "가벼운 젤 클렌저와 산뜻한 수분 제품을 우선 추천합니다.",
      "BHA 성분은 피지와 모공 막힘 관리에 도움이 될 수 있습니다.",
      "건조하게 만들 정도의 강한 세안은 오히려 유분을 더 올릴 수 있습니다.",
    ],

    dehydration: [
      "속당김은 피부 겉은 번들거려도 수분이 부족할 때 나타날 수 있습니다.",
      "가벼운 수분 토너와 세럼으로 수분을 먼저 채우는 것이 좋습니다.",
      "크림은 무겁게 많이 바르기보다 적당량으로 수분을 잡아주는 방향이 좋습니다.",
      "세안 후 바로 보습하는 습관이 중요합니다.",
    ],

    sensitivity_redness: [
      "붉어짐이나 따가움이 있다면 피부 장벽이 예민해진 상태일 수 있습니다.",
      "BHA, 고함량 나이아신아마이드 같은 활성 성분은 잠시 줄이는 것이 좋습니다.",
      "판테놀, 세라마이드 중심의 진정/장벽 루틴을 추천합니다.",
      "화끈거림, 진물, 심한 각질이 있으면 피부과 상담이 필요할 수 있습니다.",
    ],

    none: [
      "특별한 피부 문제가 없다면 무리한 기능성 제품보다 기본 루틴 유지가 좋습니다.",
      "클렌저, 토너, 세럼, 크림을 가볍게 구성해 피부 밸런스를 유지하세요.",
      "새 제품은 한 번에 여러 개 바꾸기보다 하나씩 추가하는 것이 좋습니다.",
    ],
  };

  return map[issue] || map.none;
}

function getLifestyleAdvice(tags) {
  const advice = [];

  if (tags.includes("sleep_lack")) {
    advice.push("수면 부족은 피부 회복에 영향을 줄 수 있어 수면 시간을 먼저 점검해보세요.");
  }

  if (tags.includes("stress")) {
    advice.push("스트레스가 많을 때 트러블이 반복될 수 있으니 휴식 루틴도 함께 관리해보세요.");
  }

  if (tags.includes("high_glycemic_food")) {
    advice.push("단 음식이나 밀가루 섭취가 많다면 2주 정도 줄여보며 피부 변화를 확인해보세요.");
  }

  if (tags.includes("dairy")) {
    advice.push("유제품을 자주 먹는 편이라면 섭취량과 피부 변화를 기록해보는 것이 좋습니다.");
  }

  if (tags.includes("low_vegetable")) {
    advice.push("채소 섭취가 부족하다면 식이섬유가 있는 식품이나 동결건조 채소를 보조적으로 활용할 수 있습니다.");
  }

  if (tags.includes("gut_discomfort")) {
    advice.push("복부팽만이나 변비가 잦다면 식습관과 장 컨디션을 함께 기록해보세요.");
  }

  if (tags.includes("sweat_delay")) {
    advice.push("운동이나 땀을 흘린 뒤에는 가능한 늦지 않게 세안하는 것이 좋습니다.");
  }

  return advice;
}