import { fireEvent, render, screen } from "@testing-library/react";
import { nextBrandDiscoveryTime } from "../services/brandDiscoveryRequests";
import { getSupabaseClient } from "../services/supabaseClient";
import { BrandDiscoveryRequest } from "./BrandDiscoveryRequest";

jest.mock("../services/supabaseClient");

test("one click queues the brand and shows the estimated next check", async () => {
  const insert = jest.fn().mockResolvedValue({ error: null });
  getSupabaseClient.mockReturnValue({ from: () => ({ insert }) });
  render(<BrandDiscoveryRequest query=" 새 브랜드 " />);
  expect(screen.getByText(/다음 확인 예정/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "이 브랜드를 찾을 수 없어" }));
  expect(await screen.findByRole("status")).toHaveTextContent("브랜드 찾기를 접수했어요.");
  expect(insert).toHaveBeenCalledWith({ brand_name: "새 브랜드" });
});

test("the estimate skips hours outside the Seoul schedule", () => {
  expect(nextBrandDiscoveryTime(new Date("2026-11-21T00:40:00Z")).toISOString()).toBe("2026-11-21T01:00:00.000Z");
  expect(nextBrandDiscoveryTime(new Date("2026-11-21T01:01:00Z")).toISOString()).toBe("2026-11-21T15:00:00.000Z");
});
