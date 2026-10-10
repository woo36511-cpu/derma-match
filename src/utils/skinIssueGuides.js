export function getLevelDescription(level) {
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

export function getCareDirections(result) {
  const skinType = result?.skinType || "";
  const mainIssue = result?.mainIssue || "none";

  const directions = [];

  if (skinType.includes("건성")) {
    directions.push(
      "세안 후 바로 수분 제품을 바르고, 마지막에는 보습 크림으로 수분이 날아가지 않게 잡아주세요.",
    );
  }

  if (skinType.includes("수부지")) {
    directions.push(
      "기름을 없애는 것보다, 가벼운 수분을 채우고 무거운 크림 사용량을 줄이는 방향이 좋아요.",
    );
  }

  if (skinType.includes("지성")) {
    directions.push(
      "산뜻한 토너, 가벼운 세럼, 젤크림처럼 답답함이 적은 제품 위주로 시작해보세요.",
    );
  }

  if (skinType.includes("민감")) {
    directions.push(
      "따가움이나 붉어짐이 있다면 기능성 제품보다 진정·장벽 제품을 먼저 추천해요.",
    );
  }

  if (mainIssue === "inflammatory_acne") {
    directions.push(
      "붉고 아픈 트러블이 반복되면 화장품만으로 해결하기 어려울 수 있어 피부과 상담도 고려해보세요.",
    );
  }

  if (mainIssue === "closed_comedones") {
    directions.push(
      "좁쌀이 신경 쓰이면 무거운 크림, 오일 제품, 과한 레이어링을 먼저 줄여보는 게 좋아요.",
    );
  }

  if (mainIssue === "blackhead_sebum") {
    directions.push(
      "블랙헤드와 피지는 강한 세안보다 꾸준한 피지 관리와 산뜻한 보습이 더 중요해요.",
    );
  }

  if (mainIssue === "dehydration") {
    directions.push(
      "속당김이 있다면 세안 후 오래 방치하지 말고, 토너나 세럼을 빠르게 발라주세요.",
    );
  }

  if (mainIssue === "sensitivity_redness") {
    directions.push(
      "붉어짐과 따가움이 있으면 BHA, 레티놀, 고함량 기능성은 잠시 줄이는 편이 안전해요.",
    );
  }
  if (mainIssue === "oiliness") {
    directions.push(
      "번들거림이 많아도 세안을 지나치게 강하게 하기보다 가벼운 수분과 산뜻한 제형으로 유수분 밸런스를 맞춰보세요.",
    );
  }

  if (directions.length === 0) {
    directions.push(
      "현재는 큰 문제보다 기본 루틴을 안정적으로 유지하는 게 좋아 보여요.",
    );
  }

  return directions.slice(0, 4);
}

export function getResultCautions(result) {
  const skinType = result?.skinType || "";
  const mainIssue = result?.mainIssue || "none";

  const cautions = [
    "새 제품은 한 번에 여러 개 바꾸지 말고, 하나씩 추가하는 게 좋아요.",
    "처음 3~5일은 양을 적게 사용하면서 따가움, 붉어짐, 트러블 변화를 확인하세요.",
  ];

  if (skinType.includes("민감")) {
    cautions.push(
      "민감함이 느껴질 때는 각질 제거 제품보다 보습·진정 제품을 우선하세요.",
    );
  }

  if (mainIssue === "inflammatory_acne") {
    cautions.push(
      "통증, 고름, 흉터가 있으면 자가 관리보다 피부과 상담이 더 안전할 수 있어요.",
    );
  }

  if (mainIssue === "blackhead_sebum" || mainIssue === "closed_comedones") {
    cautions.push(
      "피지가 고민이어도 세안을 너무 강하게 하면 오히려 건조함과 번들거림이 심해질 수 있어요.",
    );
  }

  return cautions;
}
