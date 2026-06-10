export function calculateProductScore(product, userProfile) {
  let score = 0;

  // 1) 수분감 매칭: 가장 중요
  const hydrationDiff = Math.abs(product.hydrationLevel - userProfile.hydrationLevel);

  if (hydrationDiff === 0) score += 50;
  else if (hydrationDiff === 1) score += 40;
  else if (hydrationDiff === 2) score += 25;
  else score += 5;

  // 2) 피부 타입 매칭
  if (product.skinTypes.includes(userProfile.skinType)) {
    score += 20;
  }

  // 3) 고민 매칭
  const matchedConcerns = userProfile.concerns.filter((concern) =>
    product.concerns.includes(concern)
  );
  score += matchedConcerns.length * 8;

  // 4) 민감도 체크
  if (userProfile.isSensitive && product.sensitivitySafe) {
    score += 10;
  }

  // 5) 계절 매칭
  if (product.seasons.includes(userProfile.season)) {
    score += 5;
  }

  // 6) 초보자용 가산점
  if (product.beginnerFriendly) {
    score += 5;
  }

  return score;
}