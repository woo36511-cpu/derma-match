import { acneAreas, acneShapes, getSelectedAcneShapes } from "../data/simpleCare";

const VERSION = "concern-tracking-v1";
const PREFIX = "concernTracking:";
const option = (value, label) => ({ value, label });
const unsure = option("unknown", "잘 모르겠어요");
const countOptions = [
  option("none", "0개"), option("one_two", "1~2개"), option("three_five", "3~5개"),
  option("six_plus", "6개 이상"), unsure,
];
const changeOptions = (less, more) => [
  option("less", less), option("same", "비슷해요"), option("more", more), unsure,
];
const newBumps = question => ({ metric: "new_bumps_7d", question, options: countOptions, intervalWeeks: 2 });
const change = (metric, question, less, more, intervalWeeks = 2) => ({
  metric, question, options: changeOptions(less, more), intervalWeeks,
});
const mark = change("color_change", "관리 시작 때와 비교해 자국 색이 어때요?", "옅어졌어요", "진해졌어요", 4);
const scar = change("texture_change", "관리 시작 때와 비교해 피부 표면이 어때요?", "덜 도드라져요", "더 도드라져요", 4);
const metrics = {
  closed: change("visible_change", "관리 시작 때와 비교해 좁쌀 개수가 어때요?", "줄었어요", "늘었어요"),
  blackhead: change("visible_change", "관리 시작 때와 비교해 블랙헤드 개수가 어때요?", "줄었어요", "늘었어요"),
  red: newBumps("지난 7일 동안 고름 없이 새로 올라온 붉은 뾰루지는 몇 개인가요?"),
  pus: newBumps("지난 7일 동안 새로 생긴 고름 뾰루지는 몇 개인가요?"),
  deep: change("pain_change", "관리 시작 때와 비교해 덩이가 얼마나 아픈가요?", "덜 아파요", "더 아파요"),
  dark_mark: mark,
  red_mark: mark,
  indented_scar: scar,
  raised_scar: scar,
  folliculitis: newBumps("지난 7일 동안 비슷한 모양으로 새로 올라온 돌기는 몇 개인가요?"),
  unknown: newBumps("지난 7일 동안 새로 올라온 돌기는 몇 개인가요?"),
};
const shapeLabels = {
  ...Object.fromEntries(acneShapes.map(({ value, label }) => [value, label])),
  folliculitis: "모낭염처럼 보이는 돌기",
  unknown: "종류를 구분하기 어려운 트러블",
};

export const getTrackingIntervalWeeks = shape => metrics[shape]?.intervalWeeks;
export const getTrackingShapeLabel = shape => shapeLabels[shape];
export const getTrackingAreaLabel = area => acneAreas.find(item => item.value === area)?.label;
export const getTrackingValueLabel = (shape, value) => metrics[shape]?.options.find(item => item.value === value)?.label;

export function getConcernTracking(journeyRecords, excludedRecordId) {
  const source = journeyRecords.find(record => record.type === "initial_survey" && record.additionalCare);
  if (!source?.id) return null;

  const { concern, primaryShape, locations } = source.additionalCare;
  const shapes = concern === "acne" ? getSelectedAcneShapes(source.additionalCare)
    : ["folliculitis", "unknown"].includes(concern) ? [concern] : [];
  if (!shapes.length) return null;

  const priorRecords = journeyRecords.filter(record =>
    record.id !== excludedRecordId &&
    record.concernTracking?.version === VERSION &&
    record.concernTracking.sourceRecordId === source.id,
  ).reverse();
  const orderedShapes = shapes.includes(primaryShape)
    ? [primaryShape, ...shapes.filter(shape => shape !== primaryShape)]
    : shapes;

  return {
    sourceRecordId: source.id,
    questions: orderedShapes.map(shape => {
      const area = getTrackingAreaLabel(locations?.[shape]) ? locations[shape] : null;
      const metric = metrics[shape];
      let previous = null;
      for (const record of priorRecords) {
        const match = record.concernTracking.entries?.find(entry =>
          entry.shape === shape && entry.area === area && entry.metric === metric.metric &&
          entry.value !== "unknown" && getTrackingValueLabel(shape, entry.value),
        );
        if (match) {
          previous = { savedAt: record.savedAt, value: match.value };
          break;
        }
      }
      return { id: `${PREFIX}${shape}:${area ?? "unspecified"}`, shape, area, ...metric, previous };
    }),
  };
}

export function buildConcernTrackingRecord(tracking, answers) {
  const entries = tracking?.questions.flatMap(({ id, shape, area, metric, options, previous }) => {
    const value = answers[id]?.value;
    if (!options.some(option => option.value === value)) return [];
    return [{
      shape, area, metric, value,
      ...(metric === "new_bumps_7d" && previous && value !== "unknown" ? { previous } : {}),
    }];
  });
  return entries?.length ? { version: VERSION, sourceRecordId: tracking.sourceRecordId, entries } : null;
}

export function getRoutineFeedbackAnswers(answers) {
  return Object.fromEntries(Object.entries(answers).filter(([id]) => !id.startsWith(PREFIX)));
}
