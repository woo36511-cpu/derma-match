import { fireEvent, render, screen } from "@testing-library/react";
import { RoutineProductLookup } from "./RoutineProductLookup";
import { listProductReviewRequests, requestProductReview } from "../services/productReviewRequests";

jest.mock("../services/productReviewRequests", () => ({
  ...jest.requireActual("../services/productReviewRequests"),
  listProductReviewRequests: jest.fn(), requestProductReview: jest.fn(),
}));

test("a signed-in user can send a missing product and see an honest status after the reviewed alias appears", async () => {
  requestProductReview.mockResolvedValue("pending");
  listProductReviewRequests.mockResolvedValue([
    { product_name: "아직 없는 로션", category: "moisturizer", status: "published" },
    { product_name: "토리든 다이브인 저분자 히알루론산 토너", category: "toner", status: "published" },
  ]);
  render(<RoutineProductLookup ownerKey="account:demo" currentRoutine={{ entries: [] }} />);
  fireEvent.change(screen.getByRole("searchbox", { name: "브랜드나 제품명" }), { target: { value: "아직 없는 로션" } });
  fireEvent.change(screen.getByRole("combobox", { name: "제품 종류" }), { target: { value: "moisturizer" } });
  fireEvent.click(screen.getByRole("button", { name: "전성분·보습감 검수 요청" }));
  expect(await screen.findByText(/제품 검수 요청을 접수했어요/)).toBeVisible();
  expect(requestProductReview).toHaveBeenCalledWith(expect.objectContaining({ name: "아직 없는 로션", category: "moisturizer" }), "");
  fireEvent.click(screen.getByRole("button", { name: "내 검수 요청 보기" }));
  expect(await screen.findByText("제품 목록에 반영 중이에요")).toBeVisible();
  expect(screen.getByText(/검수 완료 · 보습감을 더 고려한 제형/)).toBeVisible();
});
