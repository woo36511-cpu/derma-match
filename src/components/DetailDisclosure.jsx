import React from "react";

export function DetailDisclosure({ title, children, className = "", open }) {
  return (
    <details open={open} className={`group rounded-2xl border border-slate-200 bg-white ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden="true" className="shrink-0 text-xs font-medium text-slate-500">
          <span className="group-open:hidden">펼치기 ＋</span>
          <span className="hidden group-open:inline">접기 −</span>
        </span>
      </summary>
      <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-slate-700">
        {children}
      </div>
    </details>
  );
}
