import { fireEvent, render, screen } from "@testing-library/react";
import { BasicRoutineTrialScreen } from "./BasicRoutineTrialScreen";

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

test("the four-product trial starts directly, persists, and opens its follow-up at 14 days", () => {
  const startedAt = new Date(2026, 10, 22, 12).getTime();
  const clock = jest.spyOn(Date, "now").mockReturnValue(startedAt);
  const page = <BasicRoutineTrialScreen ownerKey="guest" onHome={jest.fn()} />;
  const { unmount } = render(page);
  fireEvent.click(screen.getByRole("button", { name: "이 루틴으로 피부관리 시작해보기" }));
  expect(screen.queryByRole("button", { name: "14일 피부 변화 확인" })).not.toBeInTheDocument();
  unmount();

  clock.mockReturnValue(startedAt + 14 * 86_400_000);
  render(page);
  fireEvent.click(screen.getByRole("button", { name: "14일 피부 변화 확인" }));
  fireEvent.change(screen.getByLabelText("새로운 따가움·붉어짐이 있었나요?"), { target: { value: "comfortable" } });
  fireEvent.change(screen.getByLabelText("사용 전보다 피부 사용감이 달라졌나요?"), { target: { value: "better" } });
  fireEvent.change(screen.getByLabelText("지금 루틴의 보습감은 어떤가요?"), { target: { value: "fits" } });
  fireEvent.click(screen.getByRole("button", { name: "사용 반응 저장" }));
  expect(screen.getByRole("heading", { name: "다음 루틴" })).toBeVisible();
  expect(screen.getByRole("button", { name: "추가 화장품 후보 찾아보기" })).toBeVisible();
});
