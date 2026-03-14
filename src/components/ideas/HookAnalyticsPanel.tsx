import { analyzeHook } from "../../lib/hookAnalytics";

interface HookAnalyticsPanelProps {
  hook: string;
}

const getIntensityLabel = (value: number) => {
  if (value >= 75) {
    return "High";
  }

  if (value >= 45) {
    return "Medium";
  }

  return "Low";
};

const getScoreColor = (value: number) => {
  if (value >= 75) {
    return "text-emerald-300";
  }

  if (value >= 45) {
    return "text-amber-300";
  }

  return "text-red-300";
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
    <div
      className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] via-[#A78FFF] to-[#C4B5FD] transition-all duration-500"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

export default function HookAnalyticsPanel({ hook }: HookAnalyticsPanelProps) {
  const analytics = analyzeHook(hook);
  const emotionLabel = getIntensityLabel(analytics.emotionalTrigger);
  const viralityLabel = getIntensityLabel(analytics.viralityPotential);

  return (
    <section className="relative overflow-hidden rounded-xl border border-[#7C5CFF]/20 bg-white/[0.03] p-4 backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 0%, rgba(124,92,255,0.17), transparent 42%)",
        }}
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
            Advanced Hook Analytics
          </h3>
          <span className="rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/12 px-2.5 py-1 text-[10px] font-medium text-[#d5c8ff]">
            Creator
          </span>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-[120px,1fr] sm:items-center">
          <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/[0.12] bg-[#101010]/80">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(rgba(167,139,250,0.95) ${analytics.hookScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              }}
            />
            <div className="absolute inset-[6px] rounded-full bg-[#111111]" />
            <div className="relative z-10 text-center">
              <p className="text-lg font-semibold text-white/95">
                {analytics.hookScore}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Score
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-white/50">
                <span>Hook Score</span>
                <span>{analytics.hookScore}%</span>
              </div>
              <ProgressBar value={analytics.hookScore} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-white/50">
                <span>Emotion</span>
                <span>{analytics.emotionalTrigger}%</span>
              </div>
              <ProgressBar value={analytics.emotionalTrigger} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-white/50">
                <span>Virality Potential</span>
                <span>{analytics.viralityPotential}%</span>
              </div>
              <ProgressBar value={analytics.viralityPotential} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] uppercase tracking-wide text-white/40">
              Length
            </p>
            <p className="mt-1 text-sm font-semibold text-white/85">
              {analytics.wordCount} words
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] uppercase tracking-wide text-white/40">
              Power Words
            </p>
            <p className="mt-1 text-sm font-semibold text-white/85">
              {analytics.powerWords.length}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] uppercase tracking-wide text-white/40">
              Emotion
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${getScoreColor(analytics.emotionalTrigger)}`}
            >
              {emotionLabel}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] uppercase tracking-wide text-white/40">
              Virality Potential
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${getScoreColor(analytics.viralityPotential)}`}
            >
              {viralityLabel}
            </p>
          </div>
        </div>

        <div className="mt-3 min-h-8 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-white/65">
          {analytics.powerWords.length > 0 ? (
            <span>
              Detected power words:{" "}
              <span className="text-white/90">
                {analytics.powerWords.join(", ")}
              </span>
            </span>
          ) : (
            <span className="text-white/45">No power words detected yet.</span>
          )}
        </div>
      </div>
    </section>
  );
}
