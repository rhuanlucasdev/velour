interface AutosaveIndicatorProps {
  status: "idle" | "saving" | "saved";
}

export default function AutosaveIndicator({ status }: AutosaveIndicatorProps) {
  const isSaving = status === "saving";
  const isSaved = status === "saved";

  return (
    <div
      className={`flex items-center gap-2 text-xs text-neutral-400 transition-opacity duration-200 ${
        status === "idle" ? "opacity-0" : "opacity-100"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      {isSaving ? (
        <>
          <span
            className="h-2 w-2 rounded-full border border-neutral-400/70 border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <span>Saving...</span>
        </>
      ) : null}

      {isSaved ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>Saved ✓</span>
        </>
      ) : null}
    </div>
  );
}
