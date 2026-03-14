import { analyzeHook } from "../../lib/hookAnalytics";

interface HookAnalyticsPanelProps {
  hook: string;
}

type ImprovementMetric =
  | "hookScore"
  | "length"
  | "powerWords"
  | "emotion"
  | "virality";

const METRIC_TIPS = {
  hookScore:
    "Overall quality score based on length, emotional terms, power words, and curiosity signals.",
  length:
    "Best performance is usually between 8 and 14 words for fast readability and impact.",
  powerWords:
    "Words like secret, proven, instant and mistake can increase curiosity and clarity.",
  emotion:
    "Emotion grows with high-arousal terms and urgency cues that make people care now.",
  virality:
    "Virality combines hook quality, emotional pull, and curiosity framing (how/why/what).",
} as const;

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

const MetricLabel = ({ label, tip }: { label: string; tip: string }) => (
  <span className="inline-flex items-center gap-1">
    {label}
    <span
      title={tip}
      className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/[0.2] text-[9px] leading-none text-white/45 transition-colors hover:text-white/75"
      aria-label={tip}
    >
      ?
    </span>
  </span>
);

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const getImprovementCopy = (
  metric: ImprovementMetric,
  wordCount: number,
  powerWordCount: number,
) => {
  if (metric === "hookScore") {
    return "Hook Score: keep the opening specific, use one curiosity trigger, and avoid generic filler words.";
  }

  if (metric === "length") {
    if (wordCount > 16) {
      return "Length: your hook is long. Trim extra words and keep the first line punchy (target: 8–14 words).";
    }

    if (wordCount < 6) {
      return "Length: your hook is very short. Add one concrete detail to increase clarity and impact.";
    }

    return "Length: you're close to ideal. Keep it compact and high-signal (8–14 words).";
  }

  if (metric === "powerWords") {
    if (powerWordCount === 0) {
      return "Power Words: add 1–2 strong words like secret, proven, instant, or mistake to boost curiosity.";
    }

    return "Power Words: good base. Keep them natural and avoid overusing high-intent words in one sentence.";
  }

  if (metric === "emotion") {
    return "Emotion: include urgency, contrast, or consequence to make the reader feel tension or desire.";
  }

  return "Virality Potential: start with how/why/what, use second-person language, and sharpen the stakes.";
};

export default function HookAnalyticsPanel({ hook }: HookAnalyticsPanelProps) {
  const analytics = analyzeHook(hook);
  const emotionLabel = getIntensityLabel(analytics.emotionalTrigger);
  const viralityLabel = getIntensityLabel(analytics.viralityPotential);
  const lengthScore = clamp(100 - Math.abs(analytics.wordCount - 11) * 8);
  const powerWordsScore = clamp(analytics.powerWords.length * 35);

  const weakestMetrics = [
    { key: "hookScore" as const, score: analytics.hookScore },
    { key: "length" as const, score: lengthScore },
    { key: "powerWords" as const, score: powerWordsScore },
    { key: "emotion" as const, score: analytics.emotionalTrigger },
    { key: "virality" as const, score: analytics.viralityPotential },
  ]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

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
                <MetricLabel label="Hook Score" tip={METRIC_TIPS.hookScore} />
                <span>{analytics.hookScore}%</span>
              </div>
              <ProgressBar value={analytics.hookScore} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-white/50">
                <MetricLabel label="Emotion" tip={METRIC_TIPS.emotion} />
                <span>{analytics.emotionalTrigger}%</span>
              </div>
              <ProgressBar value={analytics.emotionalTrigger} />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] text-white/50">
                <MetricLabel
                  label="Virality Potential"
                  tip={METRIC_TIPS.virality}
                />
                <span>{analytics.viralityPotential}%</span>
              </div>
              <ProgressBar value={analytics.viralityPotential} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] uppercase tracking-wide text-white/40">
              <MetricLabel label="Length" tip={METRIC_TIPS.length} />
            </p>
            <p className="mt-1 text-sm font-semibold text-white/85">
              {analytics.wordCount} words
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="text-[11px] uppercase tracking-wide text-white/40">
              <MetricLabel label="Power Words" tip={METRIC_TIPS.powerWords} />
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

        <div className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/40">
            How to improve
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-white/60">
            {weakestMetrics.map((metric) => (
              <li key={metric.key}>
                {getImprovementCopy(
                  metric.key,
                  analytics.wordCount,
                  analytics.powerWords.length,
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
