import { create } from "zustand";
import type { Idea } from "../types/idea";

type IdeaStore = {
  ideas: Idea[];
  addIdea: () => void;
  updateIdea: (
    id: string,
    patch: Partial<Omit<Idea, "id" | "createdAt">>,
  ) => void;
  deleteIdea: (id: string) => void;
};

export const useIdeaStore = create<IdeaStore>((set) => ({
  ideas: [],

  addIdea: () =>
    set((state) => ({
      ideas: [
        ...state.ideas,
        {
          id: crypto.randomUUID(),
          title: "Untitled Idea",
          hook: "",
          insight: "",
          twist: "",
          cta: "",
          createdAt: Date.now(),
        },
      ],
    })),

  updateIdea: (id, patch) =>
    set((state) => ({
      ideas: state.ideas.map((idea) =>
        idea.id === id ? { ...idea, ...patch } : idea,
      ),
    })),

  deleteIdea: (id) =>
    set((state) => ({
      ideas: state.ideas.filter((idea) => idea.id !== id),
    })),
}));
