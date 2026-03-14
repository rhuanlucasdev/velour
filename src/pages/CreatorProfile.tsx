import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import CreatorEarlyAccessBadge from "../components/ui/CreatorEarlyAccessBadge";
import Container from "../components/ui/Container";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "../utils/toast";

interface CreatorPublicProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  plan?: "free" | "pro" | "creator" | null;
}

interface CreatorHook {
  id: string;
  hook_text: string;
  category: string;
  likes: number;
  copies: number;
  created_at: string;
}

export default function CreatorProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [creator, setCreator] = useState<CreatorPublicProfile | null>(null);
  const [hooks, setHooks] = useState<CreatorHook[]>([]);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const totalHooks = hooks.length;
  const totalLikes = useMemo(
    () => hooks.reduce((sum, hook) => sum + (hook.likes ?? 0), 0),
    [hooks],
  );
  const totalCopies = useMemo(
    () => hooks.reduce((sum, hook) => sum + (hook.copies ?? 0), 0),
    [hooks],
  );
  const creatorPlan = creator?.plan ?? "free";
  const creatorPlanLabel =
    creatorPlan === "creator"
      ? "Creator"
      : creatorPlan === "pro"
        ? "Pro"
        : "Free";

  const canFollow = !!user?.id && !!creator?.id && user.id !== creator.id;

  const loadCreatorProfile = async () => {
    if (!username) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const { data: profileWithPlan, error: profileWithPlanError } =
      await supabase
        .from("creator_profiles")
        .select("id, username, display_name, avatar_url, plan")
        .eq("username", username)
        .maybeSingle();

    let profile: CreatorPublicProfile | null =
      (profileWithPlan as CreatorPublicProfile | null) ?? null;
    let profileError = profileWithPlanError;

    if (profileWithPlanError?.message?.toLowerCase().includes("plan")) {
      const { data: legacyProfile, error: legacyProfileError } = await supabase
        .from("creator_profiles")
        .select("id, username, display_name, avatar_url")
        .eq("username", username)
        .maybeSingle();

      if (legacyProfileError) {
        profileError = legacyProfileError;
      } else {
        profileError = null;
        profile = legacyProfile
          ? ({ ...legacyProfile, plan: "free" } as CreatorPublicProfile)
          : null;
      }
    }

    if (profileError || !profile) {
      setCreator(null);
      setHooks([]);
      setFollowersCount(0);
      setIsFollowing(false);
      setIsLoading(false);
      return;
    }

    setCreator(profile as CreatorPublicProfile);

    const [hooksResult, followersResult, followingResult] = await Promise.all([
      supabase
        .from("hooks_library")
        .select("id, hook_text, category, likes, copies, created_at")
        .eq("created_by", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("creator_follows")
        .select("creator_id", { count: "exact", head: true })
        .eq("creator_id", profile.id),
      user?.id
        ? supabase
            .from("creator_follows")
            .select("follower_id", { count: "exact", head: true })
            .eq("follower_id", user.id)
            .eq("creator_id", profile.id)
        : Promise.resolve({ data: null, error: null, count: 0 }),
    ]);

    if (hooksResult.error) {
      toast("Could not load creator hooks", { type: "error" });
      setHooks([]);
    } else {
      setHooks((hooksResult.data as CreatorHook[]) ?? []);
    }

    if (followersResult.error) {
      setFollowersCount(0);
    } else {
      setFollowersCount(followersResult.count ?? 0);
    }

    if (followingResult.error) {
      setIsFollowing(false);
    } else {
      setIsFollowing((followingResult.count ?? 0) > 0);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadCreatorProfile();
  }, [username, user?.id]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [creator?.avatar_url]);

  const handleToggleFollow = async () => {
    if (!creator) {
      return;
    }

    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (user.id === creator.id) {
      return;
    }

    setIsTogglingFollow(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("creator_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("creator_id", creator.id);

        if (error) {
          throw error;
        }

        setIsFollowing(false);
        setFollowersCount((current) => Math.max(0, current - 1));
      } else {
        const { error } = await supabase.from("creator_follows").insert({
          follower_id: user.id,
          creator_id: creator.id,
        });

        if (error) {
          throw error;
        }

        setIsFollowing(true);
        setFollowersCount((current) => current + 1);
      }
    } catch {
      toast("Could not update follow status", { type: "error" });
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const fallbackInitial =
    creator?.display_name?.trim().charAt(0).toUpperCase() || "C";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090909] py-10">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: [0.88, 1, 0.88] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgba(124,92,255,0.2), transparent 36%), radial-gradient(circle at 92% 95%, rgba(124,92,255,0.14), transparent 34%)",
        }}
      />

      <Container className="relative z-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.16 }}>
            <Link
              to="/creators"
              className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/75 transition-colors hover:border-white/[0.16] hover:text-white"
            >
              ← Back to Creators
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, delay: 0.04, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
          >
            <CreatorEarlyAccessBadge compact />
          </motion.div>
        </motion.div>

        {isLoading ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-white/55 backdrop-blur-xl"
          >
            Loading creator profile...
          </motion.section>
        ) : !creator ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.02] p-8 text-center text-sm text-white/50 backdrop-blur-xl"
          >
            Creator not found.
          </motion.section>
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 18% 0%, rgba(124,92,255,0.22), transparent 42%)",
                }}
              />

              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.06, ease: "easeOut" }}
                  className="flex items-center gap-4"
                >
                  {creator.avatar_url && !avatarLoadError ? (
                    <motion.img
                      whileHover={{ scale: 1.03 }}
                      src={creator.avatar_url}
                      alt={creator.display_name}
                      onError={() => setAvatarLoadError(true)}
                      className="h-16 w-16 rounded-full border border-[#8C71FF]/40 object-cover shadow-[0_0_24px_rgba(124,92,255,0.32)]"
                    />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-[#8C71FF]/40 bg-[#7C5CFF]/15 text-xl font-semibold text-[#DACFFF]"
                    >
                      {fallbackInitial}
                    </motion.div>
                  )}

                  <div>
                    <p className="text-lg font-semibold tracking-tight text-white/92">
                      {creator.display_name}
                    </p>
                    <p className="text-sm text-white/45">@{creator.username}</p>
                  </div>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={() => void handleToggleFollow()}
                  disabled={!canFollow || isTogglingFollow}
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={
                    isFollowing
                      ? {
                          boxShadow: [
                            "0 0 0 rgba(16,185,129,0)",
                            "0 0 20px rgba(16,185,129,0.28)",
                            "0 0 0 rgba(16,185,129,0)",
                          ],
                        }
                      : undefined
                  }
                  transition={
                    isFollowing
                      ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.15 }
                  }
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-55 ${
                    isFollowing
                      ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-200"
                      : "border-[#8C71FF]/45 bg-[#7C5CFF]/18 text-[#E4DCFF] hover:border-[#A58DFF]/55 hover:bg-[#7C5CFF]/24"
                  }`}
                >
                  {isTogglingFollow
                    ? "Saving..."
                    : isFollowing
                      ? "Following"
                      : "Follow"}
                </motion.button>
              </div>

              <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.08 }}
                  whileHover={{ y: -2, scale: 1.015 }}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
                    Total Hooks
                  </p>
                  <p className="mt-1 text-xl font-semibold text-white/92">
                    {totalHooks}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.11 }}
                  whileHover={{ y: -2, scale: 1.015 }}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
                    Total Likes
                  </p>
                  <p className="mt-1 text-xl font-semibold text-white/92">
                    {totalLikes}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.14 }}
                  whileHover={{ y: -2, scale: 1.015 }}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
                    Total Copies
                  </p>
                  <p className="mt-1 text-xl font-semibold text-white/92">
                    {totalCopies}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.17 }}
                  whileHover={{ y: -2, scale: 1.015 }}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
                    Followers
                  </p>
                  <p className="mt-1 text-xl font-semibold text-white/92">
                    {followersCount}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.2 }}
                  whileHover={{ y: -2, scale: 1.015 }}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] p-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
                    Velour Plan
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#D7C9FF]">
                    {creatorPlanLabel}
                  </p>
                </motion.div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.06, ease: "easeOut" }}
              className="space-y-3"
            >
              <div className="flex items-end justify-between">
                <h2 className="text-base font-semibold text-white/90">
                  Creator Hooks
                </h2>
                <p className="text-xs text-white/45">Grid view</p>
              </div>

              {hooks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.15] bg-white/[0.02] p-8 text-sm text-white/45">
                  This creator has not published hooks yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {hooks.map((hook) => (
                    <motion.article
                      key={hook.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl"
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            "radial-gradient(circle at 16% 0%, rgba(124,92,255,0.14), transparent 50%)",
                        }}
                      />

                      <p className="relative z-10 line-clamp-5 text-sm leading-relaxed text-white/90">
                        {hook.hook_text}
                      </p>

                      <div className="relative z-10 mt-4 flex items-center justify-between text-xs text-white/55">
                        <span className="rounded-md border border-white/[0.1] bg-white/[0.02] px-2 py-1">
                          {hook.category}
                        </span>
                        <div className="flex items-center gap-3">
                          <span>💜 {hook.likes}</span>
                          <span>📋 {hook.copies}</span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.section>
          </>
        )}
      </Container>
    </div>
  );
}
