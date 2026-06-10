export function getNextHydrationLevel(currentLevel, feedback) {
  let nextLevel = currentLevel;

  switch (feedback) {
    case "too_dry":
      nextLevel -= 1;
      break;
    case "slightly_dry":
      nextLevel -= 0.5;
      break;
    case "good":
      nextLevel += 0;
      break;
    case "slightly_heavy":
      nextLevel += 0.5;
      break;
    case "too_heavy":
      nextLevel += 1;
      break;
    default:
      nextLevel += 0;
  }

  if (nextLevel < 1) nextLevel = 1;
  if (nextLevel > 10) nextLevel = 10;

  return nextLevel;
}