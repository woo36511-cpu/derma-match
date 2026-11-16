import React from "react";

export function Header({ resetFlow, isStart = false }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <svg aria-hidden="true" className="h-8 w-8 shrink-0 text-forest-700" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="currentColor" />
            <path d="M16 7.5c-2.8 4.2-6 7.7-6 11a6 6 0 0 0 12 0c0-3.3-3.2-6.8-6-11Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="M13 18.5c0 1.6 1.1 2.8 2.5 3.2" stroke="currentColor" strokeLinecap="round" />
          </svg>
          <div>
            <p className="font-serif text-2xl font-semibold leading-none tracking-tight text-forest-900">DearSince</p>
            <p className="mt-1 text-xs text-slate-600">내 피부 관리 가이드</p>
          </div>
        </div>
        {!isStart && <button type="button" onClick={resetFlow} className="care-secondary">처음으로</button>}
      </div>
    </header>
  );
}
