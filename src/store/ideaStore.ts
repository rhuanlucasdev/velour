import { create } from "zustand";
import type { Idea } from "../types/idea";

type IdeaStore = {
  ideas: Idea[];
  lastCreatedIdeaId: string | null;
  addIdea: () => void;
  clearLastCreatedIdeaId: () => void;
  updateIdea: (
    id: string,
    patch: Partial<Omit<Idea, "id" | "createdAt">>,
  ) => void;
  deleteIdea: (id: string) => void;
};

export const useIdeaStore = create<IdeaStore>((set) => ({
  ideas: [],
  lastCreatedIdeaId: null,

  addIdea: () =>
    set((state) => {
      const newIdea: Idea = {
        id: crypto.randomUUID(),
        title: "Untitled Idea",
        hook: "",
        insight: "",
        twist: "",
        cta: "",
        createdAt: Date.now(),
      };

      return {
        ideas: [...state.ideas, newIdea],
        lastCreatedIdeaId: newIdea.id,
      };
    }),

  clearLastCreatedIdeaId: () =>
    set(() => ({
      lastCreatedIdeaId: null,
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
