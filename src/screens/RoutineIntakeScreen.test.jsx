import { fireEvent, render, screen } from "@testing-library/react";
import { RoutineIntakeScreen } from "./RoutineIntakeScreen";
import { buildRoutineSurveyContext, makeManualRoutineEntry } from "../utils/currentRoutineReview";

test("first question distinguishes sunscreen-only use from using no products", () => {
  const onNext = jest.fn();
  render(<RoutineIntakeScreen routineReview={{ currentRoutine: { entries: [] } }} onNext={onNext} />);
  fireEvent.click(screen.getByRole("button", { name: /선크림만 발라요/ }));
  expect(screen.getByRole("searchbox", { name: "브랜드나 제품명" })).toBeInTheDocument();
  expect(screen.queryByLabelText(/지금 쓰는 세럼은 어때요/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "피부 상태 질문으로" }));
  expect(onNext).toHaveBeenCalledWith("yes", "", undefined, "sunscreen_only");
});

test("sunscreen-only answers exclude previously saved leave-on basics from survey context", () => {
  const entries = [{ id: 1 }, makeManualRoutineEntry("내 세안제", "cleanser")];
  const scoped = buildRoutineSurveyContext("yes", entries, "", "sunscreen_only");
  expect(scoped).toMatchObject({ use: "yes", routineScope: "sunscreen_only", cleanser: { band: "unknown" } });
  expect(scoped.toner).toBeUndefined();
});
