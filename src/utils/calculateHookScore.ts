const CURIOSITY_WORDS = [
  "why",
  "secret",
  "nobody",
  "truth",
  "mistake",
  "warning",
];

export function calculateHookScore(hook: string): number {
  let score = 0;
  const normalizedHook = hook.toLowerCase();

  if (hook.length > 60) {
    score += 25;
  }

  if (/\d/.test(hook)) {
    score += 15;
  }

  if (CURIOSITY_WORDS.some((word) => normalizedHook.includes(word))) {
    score += 20;
  }

  if (/\n/.test(hook)) {
    score += 10;
  }

  if (hook.includes("?")) {
    score += 20;
  }

  if (hook.length < 200) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}
