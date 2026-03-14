interface PlanBadgeProps {
  variant: "creator" | "pro";
  label: string;
}

export default function PlanBadge({ variant, label }: PlanBadgeProps) {
  if (variant === "creator") {
    return (
      <div className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-[#7C5CFF]/35 bg-gradient-to-r from-[#7C5CFF]/16 via-[#8C6BFF]/14 to-[#7C5CFF]/16 px-3 py-2 text-center text-xs font-semibold text-[#d7cbff] shadow-[0_0_22px_rgba(124,92,255,0.22)] animate-[pulse_2.4s_ease-in-out_infinite]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#B8A6FF] shadow-[0_0_10px_rgba(184,166,255,0.9)]" />
        {label}
      </div>
    );
  }

  return (
    <div className="mb-3 flex items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-gradient-to-r from-emerald-500/14 via-teal-400/12 to-emerald-500/14 px-3 py-2 text-center text-xs font-semibold text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-[pulse_2.6s_ease-in-out_infinite]">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
      {label}
    </div>
  );
}
