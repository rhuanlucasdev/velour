import { calculateHookScore } from "../../utils/calculateHookScore";

interface HookStrengthIndicatorProps {
  hook: string;
}

export default function HookStrengthIndicator({
  hook,
}: HookStrengthIndicatorProps) {
  const score = calculateHookScore(hook);

  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#1C1C1C]/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-medium text-white/70">Hook Strength</p>
        <p className="text-[12px] font-semibold text-white/90">{score} / 100</p>
      </div>

      <div className="h-1.5 w-full rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-200"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
