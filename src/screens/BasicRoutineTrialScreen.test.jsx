import { fireEvent, render, screen } from "@testing-library/react";
import { BasicRoutineTrialScreen } from "./BasicRoutineTrialScreen";

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

test("the five-product trial starts directly, persists, and opens its follow-up at 14 days", () => {
  const startedAt = new Date(2026, 10, 22, 12).getTime();
  const clock = jest.spyOn(Date, "now").mockReturnValue(startedAt);
  const page = <BasicRoutineTrialScreen ownerKey="guest" onHome={jest.fn()} />;
  const { unmount } = render(page);
  fireEvent.click(screen.getByRole("button", { name: "이 루틴으로 피부관리 시작해보기" }));
  expect(screen.getByRole("heading", { name: "라운드랩 자작나무 수분 선크림" })).toBeVisible();
  const trial = JSON.parse(localStorage.getItem("dearsince:basic-routine-trial:v1:guest"));
  expect(Object.keys(trial.ids)).toEqual(["cleanser", "toner", "serum", "cream", "sunscreen"]);
  expect(screen.queryByRole("button", { name: "14일 재검사" })).not.toBeInTheDocument();
  unmount();

  clock.mockReturnValue(startedAt + 14 * 86_400_000);
  render(page);
  fireEvent.click(screen.getByRole("button", { name: "14일 재검사" }));
  expect(screen.getByRole("checkbox", { name: /선크림 · 라운드랩/ })).toBeChecked();
  fireEvent.change(screen.getByLabelText("새로운 따가움·붉어짐이 있었나요?"), { target: { value: "comfortable" } });
  fireEvent.change(screen.getByLabelText("사용 전보다 피부 사용감이 달라졌나요?"), { target: { value: "better" } });
  fireEvent.change(screen.getByLabelText("지금 루틴의 보습감은 어떤가요?"), { target: { value: "fits" } });
  fireEvent.click(screen.getByRole("button", { name: "사용 반응 저장" }));
  expect(screen.getByRole("heading", { name: "다음 루틴" })).toBeVisible();
  expect(screen.getByRole("button", { name: "추가 화장품 후보 찾아보기" })).toBeVisible();
});

test("an unidentified reaction pauses all used products and remembers their exclusions", () => {
  render(<BasicRoutineTrialScreen ownerKey="guest" onHome={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "이 루틴으로 피부관리 시작해보기" }));
  fireEvent.click(screen.getByRole("button", { name: "불편한 반응 기록" }));
  fireEvent.click(screen.getByRole("button", { name: "사용 반응 저장" }));
  expect(screen.getByRole("heading", { name: "새로 시작한 제품을 잠시 중단해요" })).toBeVisible();
  const saved = JSON.parse(localStorage.getItem("dearsince:basic-routine-trial:v1:guest"));
  expect(saved.excludedIds).toEqual(Object.values(saved.ids));
});

test("the app singles out the only product changed before a reaction", () => {
  render(<BasicRoutineTrialScreen ownerKey="guest" onHome={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "이 루틴으로 피부관리 시작해보기" }));
  fireEvent.click(screen.getByRole("button", { name: "불편한 반응 기록" }));
  const changes = screen.getByRole("group", { name: /불편해지기 전에/ });
  fireEvent.click(changes.querySelector('input[type="checkbox"]'));
  fireEvent.click(screen.getByRole("button", { name: "사용 반응 저장" }));
  const saved = JSON.parse(localStorage.getItem("dearsince:basic-routine-trial:v1:guest"));
  expect(saved.excludedIds).toEqual([saved.ids.cleanser]);
});
