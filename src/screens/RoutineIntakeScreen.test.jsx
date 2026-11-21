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

test("the survey filters products by category before searching and uses the selected category for manual entry", () => {
  const add = jest.fn();
  render(<RoutineIntakeScreen routineReview={{ currentRoutine: { entries: [], add } }} />);
  fireEvent.click(screen.getByRole("button", { name: /기초 화장품도 쓰고/ }));
  const search = screen.getByRole("searchbox", { name: "브랜드나 제품명" });
  fireEvent.click(screen.getByRole("button", { name: "토너" }));
  fireEvent.change(search, { target: { value: "라운드랩" } });
  expect(screen.getAllByRole("button", { name: /토너.*내 루틴에 담기/ }).length).toBeGreaterThan(0);
  expect(screen.queryByRole("button", { name: /크림.*내 루틴에 담기/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "세럼" }));
  expect(screen.queryByRole("button", { name: /토너.*내 루틴에 담기/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "크림" }));
  fireEvent.change(search, { target: { value: "내 수분 제품" } });
  fireEvent.click(screen.getByText("목록에 없는 제품 직접 추가"));
  fireEvent.click(screen.getByRole("button", { name: "입력한 제품 담기" }));
  expect(add).toHaveBeenCalledWith(expect.objectContaining({ name: "내 수분 제품", category: "moisturizer" }));
});
