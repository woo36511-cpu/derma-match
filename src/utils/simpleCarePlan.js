import { pharmacyOptions } from "../data/targetedCareProducts";
import { isSimpleCareComplete, cleanSimpleCareAnswers } from "../data/simpleCare";

export const SIMPLE_CARE_VERSION = "type-and-extra-care-v1";
export function buildSimpleCarePlan(input) {
  const a = cleanSimpleCareAnswers(input);
  const result = { answers: a, complete: isSimpleCareComplete(a), pharmacy: null, showFolliculitis: false, blockNewBasics: false };
  if (!result.complete) return { ...result, title: "빠진 답변을 확인해주세요." };
  if (a.concern === "none") return { ...result, title: "피부타입에 맞는 기본 루틴이면 충분해요.", detail: "잘 맞는 제품은 유지하고, 필요한 카테고리만 확인해요." };
  if (a.areaState === "concerning") return { ...result, blockNewBasics: true,
    title: "퍼지는 붉어짐·심한 붓기나 통증은 오늘 확인받으세요.",
    detail: "새 약이나 화장품을 시험하지 말고 당일 진료받으세요. 눈 주위 붓기·시야 변화가 있으면 응급실로 가세요." };
  if (a.areaState === "irritated" || a.response === "irritated") return { ...result, blockNewBasics: true,
    title: "새 약을 더하지 말고 따가웠던 제품을 쉬어요.",
    detail: "새로 추가한 일반의약품이나 화장품이 자극을 일으켰다면 중단해요. 처방약은 기존 안내를 확인하고, 자극이 이어지거나 붓기·통증이 심해지면 진료받으세요.",
    productNote: "기초도 한꺼번에 바꾸지 말고, 편안했던 세안·보습만 유지해요." };
  if (a.response === "worse") return { ...result, blockNewBasics: true, title: "악화된 상태에서 다른 약을 덧바르지 않아요.",
    detail: "새로 추가한 일반의약품·화장품은 쉬고, 돌기·통증이 계속 늘면 원인을 확인받으세요. 처방약은 기존 안내를 확인해요." };
  if (a.medicine !== "none") {
    const early = a.medicine === "patima" && a.duration === "few_days" && a.response === "same";
    return { ...result, showFolliculitis: a.concern !== "acne" || a.shape === "unknown",
      title: early ? "파티마겔을 며칠 쓴 것만으로 새 약으로 바꾸지 않아요." : "지금 쓰는 제품에 새 여드름약을 겹치지 않아요.",
      detail: early ? "1~3일만으로 효과가 없다고 판단하기 어려워요. 양이나 횟수를 늘리지 말고, 설명서의 사용 부위를 확인해요. 새 따가움·벗겨짐·붓기가 생기면 중단해요."
        : a.medicine === "unknown" ? "포장에서 제품명과 성분을 확인한 뒤 답을 바꿔요. 무엇을 쓰는지 모르는 상태에서 새 약을 추가하지 않아요."
        : a.medicine === "prescribed" ? "처방받은 사용법을 우선하고 새 기능성 제품은 추가하지 않아요."
        : "지금 쓰는 제품명·기간·반응을 기준으로 먼저 판단해요. 계속 나아지지 않거나 악화하면 같은 약을 반복해서 덧바르기보다 원인을 확인받으세요." };
  }
  if (a.concern !== "acne" || a.shape === "unknown") return { ...result, showFolliculitis: true,
    title: "비슷한 돌기는 공통 관리와 원인별 약품을 나눠 봐요.",
    detail: "털구멍 주변을 짜지 말고, 면도·마찰이 닿는 부위를 쉬어요. 아래는 원인이 확인됐을 때의 약품 정보예요. 모양만으로 원인균을 판정하지 않아요." };
  if (a.shape === "deep") return { ...result, title: "깊게 만져지는 덩이는 새 약을 여러 개 시험하지 않아요.",
    detail: "짜거나 반복해서 누르지 말고, 커짐·심한 통증·흉터가 생기거나 계속 낫지 않으면 확인받으세요. 약국 제품만으로 충분하지 않을 수 있어요." };
  if (a.areaState === "unknown" || (a.areaState === "dry" && ["closed", "blackhead"].includes(a.shape))) return { ...result,
    title: "각질 제품을 더하기 전에 현재 자극 여부부터 확인해요.",
    detail: "당김이 있다면 세안 뒤 잘 맞던 보습제를 바르고, 따가움이나 벗겨짐이 없는지 확인해요. 피부가 편안해진 뒤 답변을 바꿔 제품을 볼 수 있어요." };
  const salicylic = ["closed", "blackhead"].includes(a.shape);
  return { ...result,
    title: salicylic ? "막힌 피지에는 살리실산 제품 한 가지를 살펴봐요." : "작은 붉은 여드름·고름 뾰루지는 해당 부위만 관리해요.",
    detail: salicylic ? "붉거나 아프지 않은 면포에만 쓰는 후보예요. 같은 부위에 레티놀이나 다른 각질 제품을 새로 겹치지 않아요."
      : "작고 국소적인 여드름인 경우의 후보예요. 털구멍 중심의 비슷한 가려운 돌기라면 모낭염 정보도 확인해요.",
    pharmacy: salicylic ? pharmacyOptions[a.shape === "blackhead" ? "blackheads" : "closedBumps"] : { ...pharmacyOptions.breakouts,
      indication: "작은 붉은 여드름·뾰루지가 국소적으로 있을 때 살펴볼 일반의약품이에요. 깊은 덩이나 넓게 번지는 붓기에는 이 안내를 적용하지 않아요." },
    productNote: "기존 기초 제품이 잘 맞으면 유지해요. 새 약은 한 가지만 고르고, 바른 뒤 자극이 생기거나 설명서대로 사용해도 나아지지 않으면 중단하고 확인해요.",
  };
}
