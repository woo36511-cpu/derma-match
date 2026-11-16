export function SurveyChoice({ selected, multiple = false, onClick, disabled, children }) {
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold leading-relaxed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 disabled:opacity-60 sm:gap-4 sm:px-5 sm:text-base ${
        selected ? "border-forest-700 bg-forest-50 text-forest-900" : "border-line bg-white text-ink hover:border-forest-700"
      }`}>
      <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center border ${multiple ? "rounded" : "rounded-full"} ${selected ? "border-forest-700 bg-forest-700 text-white" : "border-stone-400"}`}>
        {selected && (multiple ? <span className="text-xs">✓</span> : <span className="h-2 w-2 rounded-full bg-white" />)}
      </span>
      <span className="min-w-0">{children}</span>
    </button>
  );
}
