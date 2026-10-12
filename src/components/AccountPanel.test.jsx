import { act, fireEvent, render, screen } from "@testing-library/react";
import { AccountPanel } from "./AccountPanel";

const account = (overrides = {}) => ({ enabled: true, user: null, authLoading: false, recovery: false,
  syncStatus: "device", pendingCount: 0, guestCount: 0, conflicts: [], error: "", ...overrides });
const open = () => fireEvent.click(screen.getByRole("button", { name: "저장·계정" }));
const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

test("missing backend configuration clearly keeps the device workflow available", () => {
  render(<AccountPanel account={account({ enabled: false })} />);
  open();
  expect(screen.getByText(/현재 기록은 이 기기에 저장돼요/)).toBeInTheDocument();
  expect(screen.queryByLabelText("비밀번호")).not.toBeInTheDocument();
});

test("sign in submits credentials and clears the password after success", async () => {
  const signIn = jest.fn().mockResolvedValue({});
  render(<AccountPanel account={account({ signIn })} />);
  open(); fill("이메일", "person@example.test"); fill("비밀번호", "test-password");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "로그인", exact: true })));
  expect(signIn).toHaveBeenCalledWith("person@example.test", "test-password");
  expect(screen.getByLabelText("비밀번호")).toHaveValue("");
  expect(screen.getByText("로그인했어요.")).toBeInTheDocument();
});

test("signup requests email confirmation and password reset does not ask for a current password", async () => {
  const signUp = jest.fn().mockResolvedValue({ session: null });
  const resetPassword = jest.fn().mockResolvedValue({});
  render(<AccountPanel account={account({ signUp, resetPassword })} />);
  open(); fireEvent.click(screen.getByRole("button", { name: "회원가입으로 전환" }));
  fill("이메일", "person@example.test"); fill("비밀번호", "test-password");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "회원가입", exact: true })));
  expect(screen.getByText(/이메일의 인증 링크/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "비밀번호 재설정" }));
  expect(screen.queryByLabelText("비밀번호")).not.toBeInTheDocument();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "재설정 이메일 받기" })));
  expect(resetPassword).toHaveBeenCalledWith("person@example.test");
});

test("authentication errors remain visible and recovery can update the password", async () => {
  const signIn = jest.fn().mockRejectedValue(new Error("이메일을 확인해주세요."));
  const updatePassword = jest.fn().mockResolvedValue({});
  const { rerender } = render(<AccountPanel account={account({ signIn })} />);
  open(); fill("이메일", "person@example.test"); fill("비밀번호", "test-password");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "로그인", exact: true })));
  expect(screen.getByRole("alert")).toHaveTextContent("이메일을 확인해주세요.");
  rerender(<AccountPanel account={account({ recovery: true, updatePassword })} />);
  fill("새 비밀번호", "new-test-password");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "새 비밀번호 저장" })));
  expect(updatePassword).toHaveBeenCalledWith("new-test-password");
});
