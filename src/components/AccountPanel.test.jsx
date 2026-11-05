import { act, fireEvent, render, screen } from "@testing-library/react";
import { AccountPanel } from "./AccountPanel";

const account = (overrides = {}) => ({ enabled: true, user: null, authLoading: false, recovery: false,
  syncStatus: "device", pendingCount: 0, guestCount: 0, conflicts: [], error: "", username: null, usernameLoading: false, usernameError: "", recoveryCode: null, ...overrides });
const open = () => fireEvent.click(screen.getByRole("button", { name: "저장·계정" }));
const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

test("missing backend configuration clearly keeps the device workflow available", () => {
  render(<AccountPanel account={account({ enabled: false })} />);
  open();
  expect(screen.getByText(/현재 기록은 이 기기에 저장돼요/)).toBeInTheDocument();
  expect(screen.queryByLabelText("비밀번호")).not.toBeInTheDocument();
});

test("sign in submits credentials and clears the password after success", async () => {
  const signInUsername = jest.fn().mockResolvedValue({});
  render(<AccountPanel account={account({ signInUsername })} />);
  open(); fill("아이디", "test_user"); fill("비밀번호", "test-password");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "로그인", exact: true })));
  expect(signInUsername).toHaveBeenCalledWith("test_user", "test-password");
  expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
  expect(screen.getByLabelText("비밀번호")).toHaveValue("");
  expect(screen.getByText("로그인했어요.")).toBeInTheDocument();
});

test("signup and recovery ask for no email, and legacy accounts remain available", async () => {
  const signUpUsername = jest.fn().mockResolvedValue({});
  const recoverUsername = jest.fn().mockResolvedValue({});
  const resetPassword = jest.fn().mockResolvedValue({});
  render(<AccountPanel account={account({ signUpUsername, recoverUsername, resetPassword })} />);
  open(); fireEvent.click(screen.getByRole("button", { name: "회원가입으로 전환" }));
  fill("아이디", "test_user"); fill("비밀번호", "test-password");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "회원가입", exact: true })));
  expect(signUpUsername).toHaveBeenCalledWith("test_user", "test-password");
  expect(screen.queryByLabelText("이메일")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "복구 코드로 찾기" }));
  fill("복구 코드", "ABCD-1234-ABCD-1234-ABCD-1234-ABCD-1234");
  expect(screen.queryByLabelText("비밀번호")).not.toBeInTheDocument();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "복구 코드로 계정 확인" })));
  expect(recoverUsername).toHaveBeenCalledWith("test_user", "ABCD-1234-ABCD-1234-ABCD-1234-ABCD-1234");
  fireEvent.click(screen.getByRole("button", { name: "기존 이메일 계정으로 로그인" }));
  fireEvent.click(screen.getByRole("button", { name: "기존 이메일 계정 복구" }));
  fill("이메일", "person@example.test");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "재설정 이메일 받기" })));
  expect(resetPassword).toHaveBeenCalledWith("person@example.test");
});

test("recovery codes are acknowledged before closing or setting a new password", () => {
  const dismissRecoveryCode = jest.fn();
  render(<AccountPanel account={account({ user: { id: "alice" }, recovery: true, recoveryCode: "ONLY-SHOWN-ONCE", dismissRecoveryCode })} />);
  expect(screen.getByText("ONLY-SHOWN-ONCE")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "저장·계정 닫기" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "새 비밀번호 저장" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "복구 코드를 따로 보관했어요" }));
  expect(dismissRecoveryCode).toHaveBeenCalled();
});

test("authentication errors remain visible and recovery can update the password", async () => {
  const signInUsername = jest.fn().mockRejectedValue(new Error("아이디를 확인해주세요."));
  const updatePassword = jest.fn().mockResolvedValue({});
  const { rerender } = render(<AccountPanel account={account({ signInUsername })} />);
  open(); fill("아이디", "test_user"); fill("비밀번호", "test-password");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "로그인", exact: true })));
  expect(screen.getByRole("alert")).toHaveTextContent("아이디를 확인해주세요.");
  rerender(<AccountPanel account={account({ recovery: true, updatePassword })} />);
  fill("새 비밀번호", "new-test-password");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "새 비밀번호 저장" })));
  expect(updatePassword).toHaveBeenCalledWith("new-test-password");
});
