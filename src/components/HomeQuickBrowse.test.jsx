import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "../App";
import { buildDynamicRoutine } from "../utils/routineRecommendation";
import { quickSkinTypes, homeMedicineGroups } from "../data/homeQuickGuides";
import { JOURNEY_HISTORY_KEY } from "../data/storageKeys";

const click = name => fireEvent.click(screen.getByRole("button", { name }));
beforeEach(() => { localStorage.clear(); window.history.replaceState({}, "", "/"); });
test("home replaces the old full-survey accordion with two direct quick shelves", () => {
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
      const summary = within(article).getByText("성분·용도·사용 전 주의사항", { selector: "summary" });
      expect(summary.closest("details")).not.toHaveAttribute("open");
      expect(within(article).getByRole("link", { name: medicine.sourceLabel, hidden: true })).toHaveAttribute("href", medicine.source);
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
