import React from "react";

export function Header({ resetFlow, isStart = false }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <img
            src={`${process.env.PUBLIC_URL}/dearsince-mark.svg`}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0"
          />
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
