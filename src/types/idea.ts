export type Idea = {
  id: string;
  title: string;
  tags: string[];
  hook: string;
  insight: string;
  twist: string;
  cta: string;
  scheduledDate: string | null;
  createdAt: number;
};
