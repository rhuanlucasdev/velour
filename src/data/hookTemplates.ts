export type HookTemplate = {
  id: string;
  name: string;
  content: string;
};

export const hookTemplates: HookTemplate[] = [
  {
    id: "contrarian",
    name: "Contrarian",
    content: "Most people believe ___, but the truth is ___.",
  },
  {
    id: "story",
    name: "Story",
    content: "3 years ago I was ___.\n\nToday I ___.\n\nHere's what changed.",
  },
  {
    id: "curiosity",
    name: "Curiosity",
    content: "Nobody talks about this, but ___.",
  },
  {
    id: "authority",
    name: "Authority",
    content: "After working with ___ clients, I learned this:",
  },
];
