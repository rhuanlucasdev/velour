interface CreatorEarlyAccessBadgeProps {
  compact?: boolean;
  className?: string;
}

export default function CreatorEarlyAccessBadge({
  compact = false,
  className = "",
}: CreatorEarlyAccessBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl border border-[#A98DFF]/35 bg-gradient-to-r from-[#7C5CFF]/18 via-[#9C7DFF]/16 to-[#6A5BFF]/18 text-[#E3D9FF] shadow-[0_0_26px_rgba(124,92,255,0.28)] ${
        compact ? "gap-2 px-3 py-1.5" : "gap-2.5 px-3.5 py-2"
      } ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#D0C0FF] shadow-[0_0_10px_rgba(208,192,255,0.85)]" />
      <span
        className={
          compact
            ? "text-[11px] font-semibold"
            : "text-xs font-semibold leading-tight"
        }
      >
        {compact ? (
          "Creator • Early Access"
        ) : (
          <>
            <span className="block">Creator</span>
            <span className="block text-[10px] font-medium text-[#CBB8FF]">
              Early Access
            </span>
          </>
        )}
      </span>
    </div>
  );
}
