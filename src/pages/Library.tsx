import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "../utils/toast";
import HookCard, { type LibraryHookItem } from "../components/library/HookCard";
import SectionHeader from "../components/ui/SectionHeader";
import Container from "../components/ui/Container";

const LIKED_HOOKS_STORAGE_KEY = "velour_liked_hooks";

export default function Library() {
  const [trendingHooks, setTrendingHooks] = useState<LibraryHookItem[]>([]);
  const [topHooks, setTopHooks] = useState<LibraryHookItem[]>([]);
  const [recentHooks, setRecentHooks] = useState<LibraryHookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copyingHookId, setCopyingHookId] = useState<string | null>(null);
  const [likingHookId, setLikingHookId] = useState<string | null>(null);
  const [likedHookIds, setLikedHookIds] = useState<Set<string>>(new Set());

  const allHookIds = useMemo(() => {
    const ids = new Set<string>();
    [...trendingHooks, ...topHooks, ...recentHooks].forEach((hook) =>
      ids.add(hook.id),
    );
    return ids;
  }, [recentHooks, topHooks, trendingHooks]);

  const loadHooks = async () => {
    setIsLoading(true);

    const [recentResult, topResult, trendingResult] = await Promise.all([
      supabase
        .from("hooks_library")
        .select(
          "id, hook_text, category, likes, copies, created_at, created_by",
        )
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("hooks_library")
        .select(
          "id, hook_text, category, likes, copies, created_at, created_by",
        )
        .order("likes", { ascending: false })
        .order("copies", { ascending: false })
        .limit(12),
      supabase
        .from("hooks_library")
        .select(
          "id, hook_text, category, likes, copies, created_at, created_by",
        )
        .order("copies", { ascending: false })
        .order("likes", { ascending: false })
        .limit(12),
    ]);

    if (recentResult.error || topResult.error || trendingResult.error) {
      setIsLoading(false);
      toast("Could not load hooks library", { type: "error" });
      return;
    }

    setRecentHooks((recentResult.data as LibraryHookItem[]) ?? []);
    setTopHooks((topResult.data as LibraryHookItem[]) ?? []);
    setTrendingHooks((trendingResult.data as LibraryHookItem[]) ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadHooks();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIKED_HOOKS_STORAGE_KEY);

      if (!raw) {
        setLikedHookIds(new Set());
        return;
      }

      const parsed = JSON.parse(raw) as string[];
      setLikedHookIds(new Set(Array.isArray(parsed) ? parsed : []));
    } catch {
      setLikedHookIds(new Set());
    }
  }, []);

  const patchCopiesInSections = (hookId: string) => {
    const patchList = (list: LibraryHookItem[]) =>
      list.map((entry) =>
        entry.id === hookId ? { ...entry, copies: entry.copies + 1 } : entry,
      );

    setTrendingHooks((current) => patchList(current));
    setTopHooks((current) => patchList(current));
    setRecentHooks((current) => patchList(current));
  };

  const patchLikesInSections = (hookId: string) => {
    const patchList = (list: LibraryHookItem[]) =>
      list.map((entry) =>
        entry.id === hookId ? { ...entry, likes: entry.likes + 1 } : entry,
      );

    setTrendingHooks((current) => patchList(current));
    setTopHooks((current) => patchList(current));
    setRecentHooks((current) => patchList(current));
  };

  const persistLikedHook = (hookId: string) => {
    setLikedHookIds((current) => {
      const next = new Set(current);
      next.add(hookId);

      localStorage.setItem(
        LIKED_HOOKS_STORAGE_KEY,
        JSON.stringify(Array.from(next)),
      );

      return next;
    });
  };

  const handleCopyHook = async (hook: LibraryHookItem) => {
    try {
      setCopyingHookId(hook.id);
      await navigator.clipboard.writeText(hook.hook_text);

      const { error } = await supabase
        .from("hooks_library")
        .update({ copies: hook.copies + 1 })
        .eq("id", hook.id);

      if (error) {
        throw error;
      }

      patchCopiesInSections(hook.id);
      toast("Hook copied ✨", { type: "success" });
    } catch {
      toast("Could not copy this hook", { type: "error" });
    } finally {
      setCopyingHookId(null);
    }
  };

  const handleLikeHook = async (hook: LibraryHookItem) => {
    if (likedHookIds.has(hook.id)) {
      toast("You already liked this hook", { type: "info" });
      return;
    }

    try {
      setLikingHookId(hook.id);

      const { error } = await supabase
        .from("hooks_library")
        .update({ likes: hook.likes + 1 })
        .eq("id", hook.id);

      if (error) {
        throw error;
      }

      patchLikesInSections(hook.id);
      persistLikedHook(hook.id);
      toast("Hook liked 💜", { type: "success" });
    } catch {
      toast("Could not like this hook", { type: "error" });
    } finally {
      setLikingHookId(null);
    }
  };

  const renderSection = (
    title: string,
    subtitle: string,
    hooks: LibraryHookItem[],
  ) => (
    <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#121212]/72 p-4 backdrop-blur-xl">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-white/92">
          {title}
        </h2>
        <p className="text-xs text-white/45">{subtitle}</p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white/45">
          Loading hooks...
        </div>
      ) : hooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-4 text-sm text-white/35">
          No hooks yet in this section.
        </div>
      ) : (
        <div className="space-y-3">
          {hooks.map((hook) => (
            <HookCard
              key={`${title}-${hook.id}`}
              hook={hook}
              onCopy={handleCopyHook}
              onLike={handleLikeHook}
              isCopying={copyingHookId === hook.id}
              isLiking={likingHookId === hook.id}
              isLiked={likedHookIds.has(hook.id)}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <Container className="py-8">
      <SectionHeader
        title="Viral Hooks Library"
        subtitle={`Explore high-performing hooks from the community (${allHookIds.size} unique hooks).`}
        className="mb-6"
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {renderSection("Trending", "Most copied hooks", trendingHooks)}
        {renderSection("Top", "Most liked hooks", topHooks)}
        {renderSection("Recent", "Latest added hooks", recentHooks)}
      </div>
    </Container>
  );
}
