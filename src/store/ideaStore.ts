import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Idea } from "../types/idea";
import { toast } from "../utils/toast";

type IdeaStore = {
  ideas: Idea[];
  lastCreatedIdeaId: string | null;
  isLoading: boolean;
  currentUserId: string | null;
  loadIdeas: (userId: string) => Promise<void>;
  resetIdeas: () => void;
  createIdea: (userId: string) => Promise<string | null>;
  addIdea: (userId: string) => Promise<void>;
  reorderIdeas: (activeId: string, overId: string) => void;
  clearLastCreatedIdeaId: () => void;
  updateIdea: (
    id: string,
    patch: Partial<Omit<Idea, "id" | "createdAt">>,
  ) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
};

interface IdeaRow {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  tags: string[] | null;
  created_at: string;
}

const createIdeaDefaults = (id = crypto.randomUUID()): Idea => ({
  id,
  title: "Untitled Idea",
  tags: [],
  hook: "",
  insight: "",
  twist: "",
  cta: "",
  createdAt: Date.now(),
});

const parseIdeaContent = (content: string | null) => {
  if (!content) {
    return {
      hook: "",
      insight: "",
      twist: "",
      cta: "",
    };
  }

  try {
    const parsed = JSON.parse(content) as Partial<
      Pick<Idea, "hook" | "insight" | "twist" | "cta">
    >;

    return {
      hook: parsed.hook ?? "",
      insight: parsed.insight ?? "",
      twist: parsed.twist ?? "",
      cta: parsed.cta ?? "",
    };
  } catch {
    return {
      hook: "",
      insight: "",
      twist: "",
      cta: "",
    };
  }
};

const mapRowToIdea = (row: IdeaRow): Idea => {
  const content = parseIdeaContent(row.content);

  return {
    id: row.id,
    title: row.title,
    tags: Array.isArray(row.tags) ? row.tags : [],
    hook: content.hook,
    insight: content.insight,
    twist: content.twist,
    cta: content.cta,
    createdAt: new Date(row.created_at).getTime(),
  };
};

const mapIdeaToInsert = (idea: Idea, userId: string) => ({
  id: idea.id,
  user_id: userId,
  title: idea.title,
  content: JSON.stringify({
    hook: idea.hook,
    insight: idea.insight,
    twist: idea.twist,
    cta: idea.cta,
  }),
  tags: idea.tags,
  created_at: new Date(idea.createdAt).toISOString(),
});

const mapIdeaToUpdate = (idea: Idea) => ({
  title: idea.title,
  content: JSON.stringify({
    hook: idea.hook,
    insight: idea.insight,
    twist: idea.twist,
    cta: idea.cta,
  }),
  tags: idea.tags,
});

export const useIdeaStore = create<IdeaStore>()((set, get) => ({
  ideas: [],
  lastCreatedIdeaId: null,
  isLoading: false,
  currentUserId: null,

  loadIdeas: async (userId) => {
    set({ isLoading: true, currentUserId: userId });

    const { data, error } = await supabase
      .from("ideas")
      .select("id, user_id, title, content, tags, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      set({ isLoading: false });
      toast("Could not load your ideas", { type: "error" });
      return;
    }

    set({
      ideas: (data as IdeaRow[]).map(mapRowToIdea),
      isLoading: false,
      currentUserId: userId,
    });
  },

  resetIdeas: () =>
    set({
      ideas: [],
      lastCreatedIdeaId: null,
      isLoading: false,
      currentUserId: null,
    }),

  createIdea: async (userId) => {
    const newIdea = createIdeaDefaults();

    const { error } = await supabase
      .from("ideas")
      .insert(mapIdeaToInsert(newIdea, userId));

    if (error) {
      toast("Could not create idea", { type: "error" });
      return null;
    }

    set((state) => ({
      ideas: [newIdea, ...state.ideas],
      lastCreatedIdeaId: newIdea.id,
      currentUserId: userId,
    }));

    return newIdea.id;
  },

  addIdea: async (userId) => {
    await get().createIdea(userId);
  },

  reorderIdeas: (activeId, overId) =>
    set((state) => {
      const activeIndex = state.ideas.findIndex((idea) => idea.id === activeId);
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

  clearLastCreatedIdeaId: () => set({ lastCreatedIdeaId: null }),

  updateIdea: async (id, patch) => {
    const previousIdea = get().ideas.find((idea) => idea.id === id);

    if (!previousIdea) {
      return;
    }

    const nextIdea: Idea = { ...previousIdea, ...patch };

    set((state) => ({
      ideas: state.ideas.map((idea) => (idea.id === id ? nextIdea : idea)),
    }));

    const { error } = await supabase
      .from("ideas")
      .update(mapIdeaToUpdate(nextIdea))
      .eq("id", id);

    if (!error) {
      return;
    }

    set((state) => ({
      ideas: state.ideas.map((idea) => (idea.id === id ? previousIdea : idea)),
    }));
    toast("Could not save idea changes", { type: "error" });
  },

  deleteIdea: async (id) => {
    const previousIdea = get().ideas.find((idea) => idea.id === id);

    if (!previousIdea) {
      return;
    }

    set((state) => ({
      ideas: state.ideas.filter((idea) => idea.id !== id),
    }));

    const { error } = await supabase.from("ideas").delete().eq("id", id);

    if (!error) {
      return;
    }

    set((state) => ({
      ideas: [previousIdea, ...state.ideas].sort(
        (a, b) => b.createdAt - a.createdAt,
      ),
    }));
    toast("Could not delete idea", { type: "error" });
  },
}));
