import { buildAcneCareReview } from "./acneCareReview";
import { pharmacyOptions } from "../data/targetedCareProducts";
import { acneAreas, acneShapes, acneTraceShapes, inflamedAcneShapes, isSimpleCareComplete, cleanSimpleCareAnswers } from "../data/simpleCare";

export const SIMPLE_CARE_VERSION = "type-and-extra-care-v4";
const traceGuidance = {
  dark_mark: { title: "평평한 갈색 자국은 자외선 차단부터 챙겨요.", detail: "트러블이 가라앉은 자리에 높이 변화 없이 색만 남았다면, 외출할 때 잘 맞는 자외선 차단제를 사용하고 자국의 색이 변하는지 살펴봐요. 자국만 남은 부위에 여드름약을 새로 바르지 않아요." },
  red_mark: { title: "평평한 붉은 자국은 새로 올라온 돌기와 나눠 봐요.", detail: "만져지는 돌기 없이 색만 남았다면 문지르거나 짜지 않고, 잘 맞는 보습과 자외선 차단을 유지해요. 따가움이나 새 돌기가 생기면 자국으로만 생각하지 말고 상태를 다시 확인해요." },
  indented_scar: { title: "패인 흔적은 색이 남은 자국과 따로 봐요.", detail: "빛의 방향이 달라도 표면이 들어가 보이는지 살펴봐요. 화장품이나 여드름약으로 패인 부분을 채운다고 안내하지 않아요. 패임이 신경 쓰인다면 어떤 흉터인지 피부과에서 확인할 수 있어요." },
  raised_scar: { title: "솟은 흔적은 새 뾰루지로 보고 짜지 않아요.", detail: "트러블이 가라앉은 뒤에도 표면이 솟아 있는지 살펴봐요. 반복해서 누르거나 새 여드름약을 덧바르지 않아요. 자라거나 가렵고 아프다면 어떤 흔적인지 확인받으세요." },
};
const observationNotes = {
  closed: "붉지 않은 작은 돌기가 그대로인지, 붉어지거나 아파지는지 살펴봐요.",
  blackhead: "검게 보이는 점과 붉은 돌기가 같은 부위에 섞여 있는지 살펴봐요.",
  red: "새로 올라오는 수와 통증 변화를 살펴봐요.",
  pus: "고름 돌기의 수가 늘거나 붉어짐이 퍼지는지 살펴봐요.",
  deep: "커짐·통증이 이어지는지 먼저 확인해요.",
  dark_mark: "같은 조명에서 색이 옅어지는지 비교해요.",
  red_mark: "돌기 없이 평평한지, 붉은 색이 옅어지는지 살펴봐요.",
  indented_scar: "색뿐 아니라 표면이 패여 보이는지 확인해요.",
  raised_scar: "크기나 높이가 달라지는지 살펴봐요.",
};

function buildConcernSummary(a) {
  const describe = shape => ({
    shape, label: acneShapes.find(item => item.value === shape)?.label,
    area: acneAreas.find(item => item.value === a.locations?.[shape])?.label,
    observation: observationNotes[shape],
  });
  return a.shape && a.shapes?.length > 1 ? {
    primary: describe(a.shape),
    secondary: a.shapes.filter(shape => shape !== a.shape).map(describe),
  } : null;
}

function buildBaseSimpleCarePlan(input, options) {
  const a = cleanSimpleCareAnswers(input, options);
  const result = { answers: a, complete: isSimpleCareComplete(a, options), pharmacy: null, showFolliculitis: false, blockNewBasics: false, concernSummary: buildConcernSummary(a) };
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
  if (a.shapes?.includes("deep") && (a.shape !== "deep" || a.medicine === "none")) return { ...result, title: "깊게 만져지는 덩이는 새 약을 여러 개 시험하지 않아요.",
    detail: "고른 고민에 깊은 덩이가 있어 이 상태부터 살펴봐요. 짜거나 반복해서 누르지 말고, 커지거나 아프거나 계속 낫지 않으면 확인받으세요." };
  if (acneTraceShapes.includes(a.shape)) return { ...result, ...traceGuidance[a.shape],
    productNote: a.medicine !== "none" ? "지금 쓰는 제품의 사용 부위를 확인해요. 자국이나 흉터에 새 기능성 제품을 겹쳐 바르지 않아요." : null,
  };
  if (a.medicine !== "none") {
    const early = a.medicine === "patima" && a.duration === "few_days" && a.response === "same";
    return { ...result, showFolliculitis: a.concern !== "acne" || a.shape === "unknown",
      title: early ? "파티마겔을 며칠 쓴 것만으로 새 약으로 바꾸지 않아요." : "지금 쓰는 제품에 새 여드름약을 겹치지 않아요.",
      detail: early ? "1~3일만으로 효과가 없다고 판단하기 어려워요. 양이나 횟수를 늘리지 말고, 설명서의 사용 부위를 확인해요. 새 따가움·벗겨짐·붓기가 생기면 중단해요."
        : a.medicine === "unknown" ? "포장에서 제품명과 성분을 확인한 뒤 답을 바꿔요. 무엇을 쓰는지 모르는 상태에서 새 약을 추가하지 않아요."
        : a.medicine === "prescribed" ? "처방받은 사용법을 우선하고 새 기능성 제품은 추가하지 않아요."
        : "지금 쓰는 제품명·기간·반응을 기준으로 먼저 판단해요. 계속 나아지지 않거나 악화하면 같은 약을 반복해서 덧바르기보다 원인을 확인받으세요." };
  }
  if (a.breakoutExtent && a.breakoutExtent !== "local") return { ...result,
    showFolliculitis: a.concern !== "acne" || a.shape === "unknown",
    title: a.breakoutExtent === "unknown" ? "범위를 확인한 뒤 다음 관리를 골라요." : "돌기가 많은 곳에는 국소용 후보를 넓게 바르지 않아요.",
    detail: "잘 맞는 세안·보습은 유지하고, 어느 부위에 어떤 돌기가 많은지 먼저 확인해요. 작은 한 부위에 쓰는 약품 후보는 이 답변에서 보여주지 않아요." };
  if (a.concern !== "acne" || a.shape === "unknown") return { ...result, showFolliculitis: true,
    title: "비슷한 돌기는 공통 관리와 원인별 약품을 나눠 봐요.",
    detail: "털구멍 주변을 짜지 말고, 면도·마찰이 닿는 부위를 쉬어요. 아래는 원인이 확인됐을 때의 약품 정보예요. 모양만으로 원인균을 판정하지 않아요." };
  if (a.areaState === "unknown" || (a.areaState === "dry" && ["closed", "blackhead"].includes(a.shape))) return { ...result,
    title: "각질 제품을 더하기 전에 현재 자극 여부부터 확인해요.",
    detail: "당김이 있다면 세안 뒤 잘 맞던 보습제를 바르고, 따가움이나 벗겨짐이 없는지 확인해요. 피부가 편안해진 뒤 답변을 바꿔 제품을 볼 수 있어요." };
  const salicylic = ["closed", "blackhead"].includes(a.shape);
  const separateArea = other => {
    const first = a.locations?.[a.shape];
    const second = a.locations?.[other];
    const specific = ["forehead", "cheeks", "nose", "chin"];
    return specific.includes(first) && specific.includes(second) && first !== second;
  };
  if (salicylic && a.shapes.some(shape => inflamedAcneShapes.includes(shape) && !separateArea(shape))) return { ...result,
    title: "붉은 돌기와 좁쌀이 섞인 곳에는 각질 제품을 더하지 않아요.",
    detail: "좁쌀과 붉은 돌기가 서로 다른 부위인지 먼저 확인해요. 같은 부위이거나 구분이 어려우면 세안·보습을 유지하고 새 살리실산 제품은 보류해요.",
  };
  return { ...result,
    title: salicylic ? "막힌 피지에는 살리실산 제품 한 가지를 살펴봐요." : "작은 붉은 여드름·고름 뾰루지는 해당 부위만 관리해요.",
    detail: salicylic ? "붉거나 아프지 않은 면포에만 쓰는 후보예요. 같은 부위에 레티놀이나 다른 각질 제품을 새로 겹치지 않아요."
      : "작고 국소적인 여드름인 경우의 후보예요. 털구멍 중심의 비슷한 가려운 돌기라면 모낭염 정보도 확인해요.",
    pharmacy: salicylic ? pharmacyOptions[a.shape === "blackhead" ? "blackheads" : "closedBumps"] : { ...pharmacyOptions.breakouts,
      indication: "작은 붉은 여드름·뾰루지가 국소적으로 있을 때 살펴볼 일반의약품이에요. 깊은 덩이나 넓게 번지는 붓기에는 이 안내를 적용하지 않아요." },
    productNote: "기존 기초 제품이 잘 맞으면 유지해요. 새 약은 한 가지만 고르고, 바른 뒤 자극이 생기거나 설명서대로 사용해도 나아지지 않으면 중단하고 확인해요.",
  };
}

export function buildSimpleCarePlan(input, options) {
  const plan = buildBaseSimpleCarePlan(input, options);
  return { ...plan, careReview: buildAcneCareReview(plan) };
}
