import { fireEvent, render, screen } from "@testing-library/react";
import { ProductPhoto } from "./ProductPhoto";

test("a corrected photo falls back to the original and hides the browser's broken image on failure", () => {
  render(<ProductPhoto product={{ id: 91, name: "인요에 토너", image: "https://example.test/original.jpg" }} />);
  expect(screen.getByRole("img", { name: "인요에 토너" })).toHaveAttribute("src", expect.stringContaining("25521d"));
  fireEvent.error(screen.getByRole("img", { name: "인요에 토너" }));
  expect(screen.getByRole("img", { name: "인요에 토너" })).toHaveAttribute("src", "https://example.test/original.jpg");
  fireEvent.error(screen.getByRole("img", { name: "인요에 토너" }));
  expect(screen.queryByRole("img", { name: "인요에 토너" })).not.toBeInTheDocument();
  expect(screen.getByText("제품 사진 준비 중")).toBeVisible();
});

test("a store placeholder is never rendered as a product image", () => {
  render(<ProductPhoto product={{ name: "크림", image: "https://example.test/moa/img/default/empty_thumb.png" }} />);
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
