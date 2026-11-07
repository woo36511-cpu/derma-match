import { getCareConcern } from "../data/symptomQuestions";

const labels = {
  breakouts: "붉은 뾰루지·좁쌀", blackheads: "블랙헤드·막힌 모공", dry: "건조함·당김",
  sensitive: "따가움·붉어짐", marks: "트러블 뒤 갈색 자국", oily: "번들거림",
  wrinkles: "잔주름", other: "가장 불편한 얼굴 피부 증상",
};

export function buildCarePriorities(assessment, plan) {
  if (!assessment?.guidedCare || !assessment.complete ||
    ["urgent", "emergency"].includes(assessment.urgency)) return null;

  const a = assessment.answers;
  const focus = getCareConcern(a);
  if (!focus || focus === "none") return null;
  const concerns = new Set([a.concern, ...(a.secondaryConcerns ?? [])]);
  const irritation = a.barrier === "stinging" || a.change === "irritation" || a.sensitiveCare === "irritated";
  const dryness = a.barrier === "dry" || a.surface === "dry_flaky";
  const openSkin = a.surface === "damaged" || a.surface === "unknown";
  const pairWithMoisture = dryness && Boolean(plan?.pharmacy);
  const hold = irritation || (dryness && !pairWithMoisture) || openSkin || assessment.blockRoutine || a.change === "worse";
  const activeBumps = focus === "breakouts";
  const parallel = [];
  const later = [];

  if (openSkin) {
    parallel.push("상처·진물이 있는 부위를 문지르거나 그 위에 새 기능성 제품을 바르지 않아요.");
  } else if (a.basicRoutine === "neither") {
    parallel.push("처음에는 순한 세안제와 보습제부터 하나씩 써봐요. 토너나 세럼은 필요할 때 선택해도 돼요.");
  } else if (irritation || dryness || concerns.has("dry") || concerns.has("sensitive")) {
    parallel.push("미지근한 물로 가볍게 세안하고, 세안 직후 잘 맞던 보습제를 발라요. 바를 때마다 따갑던 화장품과 스크럽은 쉬어요.");
  } else {
    parallel.push("잘 맞던 순한 세안제와 보습제는 유지해요. 장벽 관리 때문에 토너나 세럼을 새로 추가할 필요는 없어요.");
  }

  if (!openSkin && (concerns.has("marks") || concerns.has("wrinkles")) && focus !== "marks" && focus !== "wrinkles") {
    parallel.push("갈색 자국·잔주름에는 외출 전에 잘 맞던 SPF 30 이상 선크림을 발라요. 선크림이 따갑다면 억지로 바르지 말고 모자나 그늘을 이용해요.");
  }
  if (!openSkin && concerns.has("blackheads") && focus !== "blackheads") {
    parallel.push("코팩이나 압출은 쉬고, 검게 보이는 모공은 순한 세안으로 관리해요.");
  }
  if (!openSkin && concerns.has("oily") && focus !== "oily") {
    parallel.push("번들거리는 곳만 기름종이로 가볍게 눌러요. 유분을 없애려고 세안 횟수를 늘리지 않아요.");
  }

  if (hold && (activeBumps || concerns.has("blackheads"))) {
    later.push({
      title: "새 여드름약·각질 제품 추가",
      detail: irritation || dryness || openSkin
        ? "따가움·각질·상처가 가라앉고 피부가 편안해지면 돌기 모양과 이미 쓰는 제품을 보고 다음 관리를 골라요."
        : "고름·가려움·통증의 원인과 이미 쓰는 제품을 확인한 다음에 추가 여부를 정해요.",
    });
  } else if (activeBumps && concerns.has("blackheads")) {
    later.push({ title: "블랙헤드용 각질 제거", detail: "같은 부위에 여드름약과 새 각질 제품을 겹치지 않아요. 새 돌기와 자극이 줄어든 뒤, 막힌 점이 남으면 그때 따로 관리해요." });
  }
  if ((activeBumps || hold || plan?.pharmacy) && (concerns.has("marks") || concerns.has("wrinkles"))) {
    later.push({ title: "갈색 자국·잔주름용 기능성 제품", detail: "자외선 차단은 지금 할 수 있어요. 미백·레티놀·필링처럼 새로 더하는 제품은 따가움이나 새 트러블이 줄고 피부가 편안해진 뒤 한 가지씩 검토해요." });
  }

  return {
    headline: assessment.urgency === "clinic" ? "진료로 증상의 원인부터 확인"
      : openSkin ? "상처·진물 여부와 자극 확인"
      : pairWithMoisture ? "작은 붉은 뾰루지 관리와 보습을 함께"
      : irritation || dryness ? "따가움·당김을 먼저 줄이고 피부 상태 확인"
      : labels[focus],
    reason: focus !== a.concern
      ? `${labels[a.concern]}도 함께 관리하되, 진행 중인 붉은 뾰루지·좁쌀의 모양을 먼저 확인해요.`
      : null,
    parallel,
    later,
  };
}
