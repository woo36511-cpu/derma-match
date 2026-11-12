import { acneTraceShapes, getSelectedAcneShapes, inflamedAcneShapes } from "../data/simpleCare";

const aadAcne = ["미국피부과학회 · 여드름 치료", "https://www.aad.org/public/diseases/acne/derm-treat/treat"];
const aadScars = ["미국피부과학회 · 여드름 흉터 치료", "https://www.aad.org/public/diseases/acne/derm-treat/Scars/treatment"];
const steroid = ["DermNet · 병변 내 스테로이드 주사", "https://dermnetnz.org/topics/intralesional-steroid-injection"];
const vascular = ["미국피부과학회 · 혈관 레이저와 빛 치료", "https://www.aad.org/public/diseases/rosacea/treatment/lasers-lights/"];

const option = (title, when, benefit, risks, sources) => ({ title, when, benefit, risks, sources });

export const procedureTopics = {
  extraction: { label: "붉지 않은 좁쌀·블랙헤드", option: option(
    "의료진의 면포 압출",
    "붉거나 아프지 않은 면포가 있고, 일반적인 여드름 관리로 잘 정리되지 않을 때 검토해요.",
    "현재 막힌 면포를 물리적으로 제거해요. 새로 생기는 면포는 별도 관리가 필요해요.",
    "피부가 손상되면 감염이나 흉터가 남을 수 있어요.",
    [aadAcne],
  ) },
  deep: { label: "국소적으로 올라온 깊은 덩이", option: option(
    "병변 내 스테로이드 주사",
    "진찰에서 크고 아픈 염증성 여드름으로 확인된 소수의 병변에 고려해요. 다른 종류의 덩이에는 이 안내를 적용하지 않아요.",
    "해당 병변의 붓기와 통증을 빠르게 줄이는 데 도움을 줄 수 있어요.",
    "주사 부위가 패이거나 피부색이 옅어질 수 있어요.",
    [aadAcne, steroid],
  ) },
  red_mark: { label: "가라앉은 자리에 남은 평평한 붉은 자국", option: option(
    "혈관 레이저 또는 혈관용 IPL",
    "돌기 없이 평평한 붉은 자국이 오래 남고, 진찰에서 색의 원인을 확인했을 때 고려해요.",
    "남은 붉은색을 옅게 할 수 있어요. 적합한 기기나 기대 효과는 자국마다 달라요.",
    "붉어짐이나 멍이 일시적으로 생길 수 있어요.",
    [["붉은 여드름 자국 치료 연구 검토", "https://pubmed.ncbi.nlm.nih.gov/35076997/"], vascular],
  ) },
  dark_mark: { label: "가라앉은 자리에 남은 평평한 갈색 자국", option: option(
    "표면 필링 또는 색소 레이저",
    "평평한 자국이 오래 남아 자외선 차단과 바르는 관리를 이어왔고, 색소의 위치와 원인을 확인한 경우에 검토해요.",
    "피부 표면 가까이에 남은 색소는 일부 옅어질 수 있어요.",
    "시술 자극으로 색이 더 진해질 수 있어요. 기미나 다른 색소 문제와 구분해야 해요.",
    [["DermNet · 염증 뒤 색소침착", "https://dermnetnz.org/topics/postinflammatory-hyperpigmentation"]],
  ) },
  indented_scar: { label: "패인 흉터" },
  raised_scar: { label: "솟은 흉터", option: option(
    "흉터 안에 놓는 스테로이드 주사",
    "여드름이 가라앉았는데도 표면이 솟아 있고, 비후성 흉터나 켈로이드로 확인된 경우에 고려해요.",
    "흉터를 덜 솟아 보이게 하고 가려움이나 불편감을 줄이는 데 도움을 줄 수 있어요.",
    "주사 부위가 패이거나 색이 변할 수 있고, 흉터가 다시 솟을 수 있어요.",
    [aadScars, steroid],
  ) },
  vessels: { label: "오래 남는 홍조·실핏줄", option: option(
    "혈관 레이저 또는 IPL",
    "오래 남는 붉은기나 실핏줄의 원인을 확인했을 때 고려해요.",
    "도드라지는 혈관과 일부 지속적인 붉은기를 줄일 수 있어요.",
    "일시적인 붉어짐·멍·통증이 생길 수 있어요.",
    [vascular],
  ) },
  pores: { label: "도드라져 보이는 모공", option: option(
    "모공 외관을 위한 레이저",
    "막힌 피지, 피부 탄력, 흉터 등 모공이 도드라져 보이는 이유를 살펴본 뒤 일부에서 고려해요.",
    "모공을 덜 도드라져 보이게 할 수 있지만 개선 폭은 제한적이에요.",
    "시술 뒤 붉어짐이나 색소 변화가 생길 수 있고, 회복 기간은 방식에 따라 달라요.",
    [["DermNet · 넓어 보이는 모공", "https://dermnetnz.org/topics/enlarged-pores"], aadScars],
  ) },
  expression: { label: "웃거나 찡그릴 때 생기는 표정 주름", option: option(
    "보툴리눔 톡신 주사",
    "이마·미간·눈가처럼 표정을 지을 때 두드러지는 주름의 경우 고려해요.",
    "주름을 만드는 근육 움직임을 일시적으로 줄여 표정 주름이 덜 보일 수 있어요.",
    "멍이 들거나 눈꺼풀이 처질 수 있어요.",
    [["미국피부과학회 · 보툴리눔 톡신", "https://www.aad.org/public/cosmetic/wrinkles/botulinum-toxin-faqs"],
      ["미국 FDA · 보툴리눔 톡신 허가자료", "https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/103000s5316s5319s5323s5326s5331lbl.pdf"]],
  ) },
};

export const indentedOptions = {
  narrow: { label: "좁고 깊은 구멍처럼 보여요", option: option(
    "TCA CROSS",
    "여드름이 조절된 뒤, 좁고 깊게 패인 흉터로 확인된 경우에 고려해요.",
    "패인 부분이 만드는 그림자와 흉터 외관을 줄이는 게 목표예요.",
    "딱지와 색소 변화가 생길 수 있고, 흉터가 더 넓어질 수 있어요.",
    [["DermNet · TCA CROSS", "https://dermnetnz.org/topics/tca-cross"], aadScars],
  ) },
  rolling: { label: "넓게 물결치듯 패여 보여요", option: option(
    "서브시전",
    "여드름이 조절된 뒤, 피부 아래 흉터 조직이 표면을 아래로 당기고 있다고 확인된 경우에 고려해요.",
    "피부를 당기는 흉터 조직을 풀어 패임을 덜 도드라지게 하는 방법이에요.",
    "멍·혈종·통증이 생길 수 있고, 감염이나 색소 변화가 생길 수 있어요.",
    [["DermNet · 서브시전", "https://dermnetnz.org/topics/subcision"]],
  ) },
  shallow: { label: "얕은 패임과 요철이 여러 개 보여요", option: option(
    "프락셔널 레이저 또는 의료용 미세침",
    "여드름이 조절된 뒤, 얕은 패임이나 넓은 요철의 깊이와 피부 상태를 확인한 경우에 고려해요.",
    "피부 표면의 요철과 흉터 외관을 완화하는 게 목표예요.",
    "붉어짐·부기·색소 변화가 생길 수 있고, 방식에 따라 회복 기간이 달라요.",
    [aadScars, ["미국 FDA · 의료용 미세침", "https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/microneedling-devices"]],
  ) },
  unknown: { label: "잘 구분되지 않아요" },
};

export function getProcedureTopics(plan, profile) {
  const { answers = {} } = plan;
  const assessment = profile?.observationAssessment;
  if (!plan.complete || plan.blockNewBasics || assessment?.currentIrritation) return [];
  if (answers.concern === "none" && assessment?.canRecommendBasics === true) return ["pores", "expression", "vessels"];
  if (answers.concern !== "acne" || !["comfortable", "dry"].includes(answers.areaState)) return [];
  const shapes = getSelectedAcneShapes(answers);
  if (shapes.includes("unknown")) return [];
  if (shapes.some(shape => inflamedAcneShapes.includes(shape))) {
    return answers.shape === "deep" && answers.breakoutExtent === "local" ? ["deep"] : [];
  }
  const hasComedones = shapes.includes("blackhead") || shapes.includes("closed");
  if (hasComedones) return answers.breakoutExtent === "local" && answers.areaState === "comfortable" ? ["extraction"] : [];
  const traces = shapes.filter(shape => acneTraceShapes.includes(shape));
  return [answers.shape, ...traces.filter(shape => shape !== answers.shape)].filter(shape => traces.includes(shape));
}
