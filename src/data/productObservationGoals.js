const visible = [
  ["0", "보이지 않아요"], ["1", "자세히 보면 조금 보여요"],
  ["2", "평소에도 눈에 띄어요"], ["3", "뚜렷하게 보여요"],
];
const bumps = [
  ["0", "0개"], ["1", "1~2개"], ["2", "3~5개"], ["3", "6개 이상"],
  ["4", "세기 어려울 만큼 많아요"],
];
const goal = (label, question, options, checkDays = 14) => ({
  label, symptom: label, question, ...(options && { options }), checkDays,
});

// Each protocol has its own question and response scale. Change the protocol if either changes.
export const COSMETIC_OBSERVATION_GOALS = {
  dryness: goal("건조·당김", "최근 7일 동안 평소 관리 중 제품을 쓰는 부위가 건조하거나 당긴 날은 며칠이었나요?"),
  flakes: goal("건조로 인한 들뜸", "최근 7일 동안 제품을 쓰는 부위에 하얗게 일어나는 건조한 각질이 보인 날은 며칠이었나요?"),
  sebum: goal("번들거림", "최근 7일 동안 오후에 제품을 쓰는 부위에서 기름기가 신경 쓰인 날은 며칠이었나요?"),
  pores: goal("모공 외관", "제품을 쓰는 부위를 평소와 같은 조명에서 보면 모공이 얼마나 도드라져 보이나요?", visible, 28),
  texture: goal("거친 피부결", "제품을 쓰는 부위를 가볍게 만졌을 때 거친 결이 어느 정도 느껴지나요?", [
    ["0", "거칠지 않아요"], ["1", "약간 느껴져요"], ["2", "쉽게 느껴져요"], ["3", "뚜렷하게 느껴져요"],
  ], 28),
  closed: goal("붉지 않은 좁쌀", "제품을 쓰는 같은 부위에 붉지 않은 살색·하얀 좁쌀이 얼마나 보이나요?", bumps, 28),
  blackhead: goal("블랙헤드", "제품을 쓰는 같은 부위에 검게 막힌 점(블랙헤드)이 얼마나 보이나요?", bumps, 28),
  tone: goal("고르지 않은 피부톤", "제품을 쓰는 부위를 평소와 같은 조명에서 보면 고르지 않은 피부톤이 얼마나 눈에 띄나요?", visible, 28),
  dark_mark: goal("평평한 갈색 자국", "트러블이 가라앉은 같은 부위를 평소와 같은 조명에서 보면 갈색 자국이 얼마나 눈에 띄나요?", visible, 28),
  lines: goal("잔주름 외관", "같은 조명과 편안한 표정에서 보면 제품을 쓰는 부위의 잔주름이 얼마나 눈에 띄나요?", visible, 28),
};

export const COSMETIC_TRACKS_BY_GOAL = {
  support: ["dryness", "flakes"], sebum: ["sebum", "pores"],
  texture: ["texture", "closed", "blackhead"], tone: ["tone", "dark_mark"], lines: ["lines"],
};

export const cosmeticObservationProtocol = key => `cosmetic-${key.replaceAll("_", "-")}-v1`;
export const getCosmeticObservationConfig = key => COSMETIC_OBSERVATION_GOALS[key] && {
  ...COSMETIC_OBSERVATION_GOALS[key], protocol: cosmeticObservationProtocol(key), cosmetic: true,
};

export const OBSERVATION_AREAS = [
  ["forehead", "이마"], ["cheeks", "볼"], ["nose", "코"], ["chin", "턱·턱선"],
  ["tzone", "이마·코 주변"], ["whole", "얼굴 전반"], ["other", "그 외 같은 부위"],
];
