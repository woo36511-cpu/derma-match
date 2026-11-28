import React from "react";

export function Header({ resetFlow, isStart = false, onSupport }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img
            src={`${process.env.PUBLIC_URL}/dearsince-mark.svg`}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0"
          />
          <div>
            <p className="font-serif text-xl sm:text-2xl font-semibold leading-none tracking-tight text-forest-900">DearSince</p>
            <p className="mt-1 text-xs text-slate-600">내 피부 관리 가이드</p>
          </div>
        </div>
        <div className="relative flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {onSupport && <button type="button" onClick={onSupport} className="care-secondary whitespace-nowrap px-2.5 text-xs sm:px-4 sm:text-sm">고객센터</button>}
          <details>
            <summary className="care-secondary cursor-pointer list-none whitespace-nowrap px-2.5 text-xs [&::-webkit-details-marker]:hidden sm:px-4 sm:text-sm">
              <span aria-hidden="true" className="mr-1">☆</span>즐겨찾기
            </summary>
            <div className="absolute right-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw_-_2rem)] rounded-xl border border-line bg-white p-4 text-sm shadow-lg">
              <p className="font-bold text-forest-900">디얼신스 즐겨찾기에 추가</p>
              <ul className="mt-2 space-y-2 text-slate-700">
                <li><strong>Windows</strong> · <kbd>Ctrl</kbd> + <kbd>D</kbd></li>
                <li><strong>Mac</strong> · <kbd>⌘</kbd> + <kbd>D</kbd></li>
                <li><strong>iPhone Safari</strong> · 공유 → 책갈피 추가</li>
                <li><strong>모바일 Chrome</strong> · 메뉴(⋮) → 북마크 추가</li>
              </ul>
            </div>
          </details>
          {!isStart && <button type="button" onClick={resetFlow} className="care-secondary whitespace-nowrap px-2.5 text-xs sm:px-4 sm:text-sm">처음으로</button>}
        </div>
      </div>
    </header>
  );
}
