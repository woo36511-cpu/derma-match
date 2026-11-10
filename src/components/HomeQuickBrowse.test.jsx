import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "../App";
import { buildDynamicRoutine } from "../utils/routineRecommendation";
import { quickSkinTypes, homeMedicineGroups } from "../data/homeQuickGuides";
import { JOURNEY_HISTORY_KEY } from "../data/storageKeys";

const click = name => fireEvent.click(screen.getByRole("button", { name }));
beforeEach(() => { localStorage.clear(); window.history.replaceState({}, "", "/"); });
test("home replaces the old full-survey accordion with direct quick shelves", () => {
  render(<App />);
  expect(screen.queryByText("피부타입별 추천·전체 설문 보기")).not.toBeInTheDocument();
  expect(screen.queryByText("처음이라 설문으로 시작할래요")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /피부타입별 화장품/ })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: /피부 고민별 약품 안내/ })).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("button", { name: "피부타입 확인하고 추천받기" })).toBeInTheDocument();
});
test("every skin type shows four current catalog products immediately without a survey or saved usage", () => {
  render(<App />); click(/피부타입별 화장품/);
  for (const type of quickSkinTypes) {
    click(new RegExp(type.label));
    const region = screen.getByRole("region", { name: "피부타입별 화장품 빠른 보기" });
    for (const product of Object.values(buildDynamicRoutine(type.level).products)) {
      expect(within(region).getByAltText(product.name)).toBeInTheDocument();
    }
    expect(screen.queryByRole("heading", { name: "지금 피부 상태부터 확인할게요" })).not.toBeInTheDocument();
  }
  expect(JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY) || "[]")).toHaveLength(0);
});
test("browsing switches shelves, keeps choices, and can collapse back to a compact home", () => {
  render(<App />); click(/피부타입별 화장품/); click(/^지성/);
  click(/피부 고민별 약품 안내/);
  expect(screen.queryByRole("region", { name: "피부타입별 화장품 빠른 보기" })).not.toBeInTheDocument();
  click("세균성 모낭염"); expect(screen.getByRole("article", { name: "에스로반연고" })).toBeInTheDocument();
  click(/피부타입별 화장품/); expect(screen.getByRole("button", { name: /^지성/ })).toHaveAttribute("aria-pressed", "true");
  click(/피부타입별 화장품/); expect(screen.queryByRole("region", { name: "피부타입별 화장품 빠른 보기" })).not.toBeInTheDocument();
});
test("medicine groups display named references with folded details, sources, and no treatment-start action", () => {
  render(<App />); click(/피부 고민별 약품 안내/);
  for (const group of homeMedicineGroups) {
    click(group.label);
    for (const medicine of group.medicines) {
      const article = screen.getByRole("article", { name: medicine.name });
      expect(within(article).getByText(medicine.classification)).toBeInTheDocument();
      const source = within(article).getByRole("link", { name: medicine.sourceLabel, hidden: true });
      expect(source).not.toBeVisible();
      expect(source).toHaveAttribute("href", medicine.source);
      expect(within(article).queryByRole("button")).not.toBeInTheDocument();
    }
  }
  expect(JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY) || "[]")).toHaveLength(0);
});
test("malassezia information keeps off-label use distinct from Korean Nizoral indications and Soolantra is prescription-only", () => {
  render(<App />); click(/피부 고민별 약품 안내/); click("말라세지아 모낭염");
  expect(screen.getByText(/국내 니조랄2%액의 허가 용도에는 모낭염이 기재되어 있지/)).toBeVisible();
  click("지루피부염·비듬"); expect(screen.getByRole("article", { name: "니조랄2%액" })).toBeInTheDocument();
  click("주사·모낭충 관련 돌기"); expect(screen.getByText("전문의약품 · 처방 필요")).toBeVisible();
});
test("quick browsing can start the existing type survey and selected routine recording keeps its safety check", () => {
  render(<App />); click(/피부타입별 화장품/); click("피부타입을 잘 모르겠어요 · 설문으로 확인");
  expect(screen.getByRole("heading", { name: "최근 2주, 피부 상태가 평소와 비슷했나요?" })).toBeInTheDocument();
  click("시작 화면으로"); click(/피부타입별 화장품/); click(/^건성/); click("이 루틴으로 기록하기");
  expect(screen.getByRole("heading", { name: "지금 피부 상태부터 확인할게요" })).toBeInTheDocument();
});

test("the home lookup finds new and existing products without saving a routine", () => {
  render(<App />); click(/지금 쓰는 화장품 찾기/);
  const lookup = within(screen.getByRole("region", { name: "지금 쓰는 화장품 찾기" }));
  const search = lookup.getByRole("searchbox", { name: "브랜드나 제품명" });
  fireEvent.change(search, { target: { value: "COSRX good morning" } });
  expect(lookup.getByText("코스알엑스 약산성 굿모닝 젤 클렌저")).toBeVisible();
  expect(lookup.getByText("전성분 검수 전")).toBeVisible();
  expect(lookup.getByRole("link", { name: "공식 제품 정보" })).toHaveAttribute("href", expect.stringMatching(/^https:\/\/www\.cosrx\.co\.kr\//));

  fireEvent.change(search, { target: { value: "피지오겔 DMT" } });
  expect(lookup.getByText(/피지오겔 DMT 데일리 모이스쳐/)).toBeVisible();
  fireEvent.change(search, { target: { value: "없는브랜드테스트" } });
  expect(lookup.getByRole("status")).toHaveTextContent("일치하는 제품이 없어요");
  expect(JSON.parse(localStorage.getItem(JOURNEY_HISTORY_KEY) || "[]")).toHaveLength(0);
});

test("review saves actual reactions, accepts an unlisted product, and never suggests a change for a comfortable product", () => {
  render(<App />); click(/지금 쓰는 화장품 찾기/);
  const search = screen.getByRole("searchbox", { name: "브랜드나 제품명" });
  fireEvent.change(search, { target: { value: "굿모닝 젤 클렌저" } });
  click("코스알엑스 약산성 굿모닝 젤 클렌저 내 루틴에 담기");
  const review = within(screen.getByRole("region", { name: "내 루틴 점검" }));
  fireEvent.change(review.getByRole("combobox", { name: "코스알엑스 약산성 굿모닝 젤 클렌저 사용 반응" }), { target: { value: "comfortable" } });
  expect(review.getByText("유지")).toBeVisible();
  expect(review.queryByText("대체 후보 보기")).not.toBeInTheDocument();

  fireEvent.change(search, { target: { value: "테스트 크림" } });
  fireEvent.click(screen.getByText("목록에 없는 제품 직접 추가"));
  fireEvent.change(screen.getByRole("combobox", { name: "제품 종류" }), { target: { value: "moisturizer" } });
  click("입력한 제품 담기");
  fireEvent.change(review.getByRole("combobox", { name: "테스트 크림 사용 반응" }), { target: { value: "later_oil" } });
  expect(review.getByText("관찰")).toBeVisible();
  expect(review.queryByText("대체 후보 보기")).not.toBeInTheDocument();

  click(/지금 쓰는 화장품 찾기/); click(/지금 쓰는 화장품 찾기/);
  const reopened = within(screen.getByRole("region", { name: "내 루틴 점검" }));
  expect(reopened.getByRole("combobox", { name: "테스트 크림 사용 반응" })).toHaveValue("later_oil");
  click("테스트 크림 내 루틴에서 빼기");
  expect(reopened.queryByText("테스트 크림")).not.toBeInTheDocument();
});
