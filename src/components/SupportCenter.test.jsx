import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { getSupabaseClient } from "../services/supabaseClient";
import { SupportCenter } from "./SupportCenter";

jest.mock("../services/supabaseClient");

const cryptoProperty = Object.getOwnPropertyDescriptor(global, "crypto");
beforeEach(() => {
  Object.defineProperty(global, "crypto", {
    configurable: true,
    value: { randomUUID: () => "00000000-0000-4000-8000-000000000001" },
  });
});
afterEach(() => {
  if (cryptoProperty) Object.defineProperty(global, "crypto", cryptoProperty);
  else delete global.crypto;
});

test("a failed feedback submission keeps the text and retries the same receipt", async () => {
  const insert = jest.fn().mockResolvedValueOnce({ error: { code: "network" } })
    .mockResolvedValueOnce({ error: { code: "23505" } });
  getSupabaseClient.mockReturnValue({ from: () => ({ insert }) });
  const dialogRef = createRef();
  render(<SupportCenter dialogRef={dialogRef} />);
  dialogRef.current.open = true;

  fireEvent.change(screen.getByLabelText("의견 종류"), { target: { value: "suggestion" } });
  fireEvent.change(screen.getByLabelText("의견 내용"), { target: { value: "검색 결과를 더 쉽게 보고 싶어요." } });
  fireEvent.click(screen.getByRole("button", { name: "의견 보내기" }));
  expect(await screen.findByRole("alert")).toBeVisible();
  expect(screen.getByLabelText("의견 내용")).toHaveValue("검색 결과를 더 쉽게 보고 싶어요.");
  fireEvent.click(screen.getByRole("button", { name: "의견 보내기" }));
  expect(await screen.findByText("의견을 접수했어요. 운영자가 확인할게요.")).toBeVisible();
  expect(insert).toHaveBeenCalledTimes(2);
  expect(insert.mock.calls[0][0]).toEqual(insert.mock.calls[1][0]);
});
