import { render, screen, fireEvent } from "@testing-library/react";
import App from "../App";
import { SkinObservationReference } from "./SkinObservationReference";
test("skin examples have readable captions without relying on colors", () => {
  render(<SkinObservationReference kind="surface" />);
  expect(screen.getByRole("figure", { name: "피부 표면 특징 비교 그림" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "들뜨는 각질" })).toBeInTheDocument();
  expect(screen.getByText(/실제 피부색·모습은 다양/)).toBeInTheDocument();
});
test("a request for oil clarification opens an accessible face diagram and answering again removes it", () => {
  localStorage.clear(); window.history.replaceState({}, "", "/"); render(<App />);
  const click = name => fireEvent.click(screen.getByRole("button", { name, exact: true }));
  click("피부타입 확인하고 추천받기"); click("대체로 평소와 비슷했어요"); click("다음");
  click("선크림·화장품 광택과 구분하기 어려워요"); click("다음");
  expect(screen.getByRole("figure", { name: "이마·코와 볼·입 주변 부위 그림" })).toBeInTheDocument();
  expect(screen.getByText("답변을 돕는 추가 질문")).toBeInTheDocument();
  click("코·이마에는 기름기가 있고 볼에는 거의 없어요"); click("이전");
  click("기름기가 거의 느껴지지 않아요"); click("다음");
  expect(screen.getByRole("heading", { name: "피부가 당기거나 건조하게 느껴지는 곳이 있나요?" })).toBeInTheDocument();
  expect(screen.queryByRole("figure", { name: "이마·코와 볼·입 주변 부위 그림" })).not.toBeInTheDocument();
});
