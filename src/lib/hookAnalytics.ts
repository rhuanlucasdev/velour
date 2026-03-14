export const POWER_WORDS = [
  "secret",
  "ultimate",
  "mistake",
  "powerful",
  "simple",
  "proven",
  "instant",
  "hidden",
] as const;

const EMOTION_TERMS = [
  "amazing",
  "shocking",
  "surprising",
  "fear",
  "love",
  "hate",
  "exciting",
  "warning",
  "urgent",
  "confident",
  "breakthrough",
  "painful",
];

const VIRAL_TERMS = [
  "how",
  "why",
  "what",
  "you",
  "your",
  "they",
  "we",
  "today",
  "now",
  "before",
  "after",
  "everyone",
  "nobody",
];

export interface HookAnalyticsResult {
  hookScore: number;
  wordCount: number;
  powerWords: string[];
  emotionalTrigger: number;
  viralityPotential: number;
}

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const roundScore = (value: number) => Math.round(clamp(value));

const getWords = (hook: string) => {
  const normalized = hook
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return [];
  }

  return normalized.split(" ");
};

export function analyzeHook(hook: string): HookAnalyticsResult {
  const words = getWords(hook);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      hookScore: 0,
      wordCount: 0,
      powerWords: [],
      emotionalTrigger: 0,
      viralityPotential: 0,
    };
  }

  const uniqueWords = new Set(words);
  const powerWords = POWER_WORDS.filter((word) => uniqueWords.has(word));

  const idealLength = 11;
  const lengthPenalty = Math.abs(wordCount - idealLength) * 4.5;
  const lengthScore = clamp(100 - lengthPenalty);

  const powerWordScore = clamp(powerWords.length * 22);
  const hasQuestion = hook.includes("?");
  const hasNumber = /\d/.test(hook);
  const hasStrongPunctuation = /[!]/.test(hook);

  const curiosityWords = words.filter((word) =>
    ["why", "how", "secret", "hidden", "mistake", "truth"].includes(word),
  ).length;

  const emotionMatches = words.filter((word) =>
    EMOTION_TERMS.includes(word),
  ).length;

  const viralityMatches = words.filter((word) =>
    VIRAL_TERMS.includes(word),
  ).length;

  const emotionalTrigger = roundScore(
    emotionMatches * 18 +
      (hasStrongPunctuation ? 12 : 0) +
      (powerWords.length > 0 ? 8 : 0) +
      (wordCount >= 6 && wordCount <= 16 ? 10 : 0),
  );

  const hookScore = roundScore(
    lengthScore * 0.4 +
      powerWordScore * 0.32 +
      emotionalTrigger * 0.2 +
      (hasQuestion ? 6 : 0) +
      (hasNumber ? 6 : 0),
  );

  const viralityPotential = roundScore(
    hookScore * 0.48 +
      emotionalTrigger * 0.22 +
      Math.min(viralityMatches * 7, 24) +
      Math.min(curiosityWords * 8, 18),
  );

  return {
    hookScore,
    wordCount,
    powerWords,
    emotionalTrigger,
    viralityPotential,
  };
}
