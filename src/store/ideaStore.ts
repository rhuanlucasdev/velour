import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Idea } from "../types/idea";

type IdeaStore = {
  ideas: Idea[];
  lastCreatedIdeaId: string | null;
  createIdea: () => void;
  addIdea: () => void;
  reorderIdeas: (activeId: string, overId: string) => void;
  clearLastCreatedIdeaId: () => void;
  updateIdea: (
    id: string,
    patch: Partial<Omit<Idea, "id" | "createdAt">>,
  ) => void;
  deleteIdea: (id: string) => void;
};

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set, get) => ({
      ideas: [],
      lastCreatedIdeaId: null,

      createIdea: () =>
        set((state) => {
          const newIdea: Idea = {
            id: crypto.randomUUID(),
            title: "Untitled Idea",
            tags: [],
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

      addIdea: () => {
        get().createIdea();
      },

      reorderIdeas: (activeId, overId) =>
        set((state) => {
          const activeIndex = state.ideas.findIndex(
            (idea) => idea.id === activeId,
          );
          const overIndex = state.ideas.findIndex((idea) => idea.id === overId);

          if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
            return state;
          }

          const nextIdeas = [...state.ideas];
          const [moved] = nextIdeas.splice(activeIndex, 1);
          nextIdeas.splice(overIndex, 0, moved);

          return {
            ...state,
            ideas: nextIdeas,
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
    }),
    {
      name: "velour-ideas-storage",
      version: 2,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState as IdeaStore;
        }

        const state = persistedState as { ideas?: Idea[] };
        return {
          ...persistedState,
          ideas: (state.ideas ?? []).map((idea) => ({
            ...idea,
            tags: Array.isArray(idea.tags) ? idea.tags : [],
          })),
        } as IdeaStore;
      },
      partialize: (state) => ({ ideas: state.ideas }),
    },
  ),
);
