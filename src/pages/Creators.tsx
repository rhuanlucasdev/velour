import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Container from "../components/ui/Container";
import SectionHeader from "../components/ui/SectionHeader";
import CreatorEarlyAccessBadge from "../components/ui/CreatorEarlyAccessBadge";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "../utils/toast";

interface CreatorPublicProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface CreatorMetrics {
  totalHooks: number;
  totalLikes: number;
  totalCopies: number;
  followers: number;
}

export default function Creators() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<CreatorPublicProfile[]>([]);
  const [metricsByCreator, setMetricsByCreator] = useState<
    Record<string, CreatorMetrics>
  >({});
  const [followingCreatorIds, setFollowingCreatorIds] = useState<Set<string>>(
    new Set(),
  );
  const [brokenAvatarIds, setBrokenAvatarIds] = useState<Set<string>>(
    new Set(),
  );
  const [togglingCreatorId, setTogglingCreatorId] = useState<string | null>(
    null,
  );

  const filteredCreators = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return profiles;
    }

    return profiles.filter((creator) => {
      const username = creator.username.toLowerCase();
      const displayName = creator.display_name.toLowerCase();
      return (
        username.includes(normalizedQuery) ||
        displayName.includes(normalizedQuery)
      );
    });
  }, [profiles, query]);

  const loadCreators = async () => {
    setIsLoading(true);

    const { data: creatorData, error: creatorError } = await supabase
      .from("creator_profiles")
      .select("id, username, display_name, avatar_url")
      .order("display_name", { ascending: true })
      .limit(60);

    if (creatorError) {
      toast("Could not load creators", { type: "error" });
      setProfiles([]);
      setMetricsByCreator({});
      setFollowingCreatorIds(new Set());
      setIsLoading(false);
      return;
    }

    const creatorProfiles = (creatorData as CreatorPublicProfile[]) ?? [];
    setProfiles(creatorProfiles);
    setBrokenAvatarIds(new Set());

    const creatorIds = creatorProfiles.map((creator) => creator.id);

    if (creatorIds.length === 0) {
      setMetricsByCreator({});
      setFollowingCreatorIds(new Set());
      setIsLoading(false);
      return;
    }

    const [{ data: hooksData, error: hooksError }, followingResult] =
      await Promise.all([
        supabase
          .from("hooks_library")
          .select("created_by, likes, copies")
          .in("created_by", creatorIds),
        user?.id
          ? supabase
              .from("creator_follows")
              .select("creator_id")
              .eq("follower_id", user.id)
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (hooksError) {
      toast("Could not load creator metrics", { type: "error" });
      setMetricsByCreator({});
    } else {
      const nextMetrics: Record<string, CreatorMetrics> = {};

      creatorIds.forEach((creatorId) => {
        nextMetrics[creatorId] = {
          totalHooks: 0,
          totalLikes: 0,
          totalCopies: 0,
          followers: 0,
        };
      });

      (hooksData ?? []).forEach((hook) => {
        const creatorId = hook.created_by as string;
        if (!nextMetrics[creatorId]) {
          return;
        }

        nextMetrics[creatorId].totalHooks += 1;
        nextMetrics[creatorId].totalLikes += Number(hook.likes ?? 0);
        nextMetrics[creatorId].totalCopies += Number(hook.copies ?? 0);
      });

      const followerCountRequests = creatorIds.map(async (creatorId) => {
        const { count } = await supabase
          .from("creator_follows")
          .select("creator_id", { count: "exact", head: true })
          .eq("creator_id", creatorId);

        return {
          creatorId,
          followers: count ?? 0,
        };
      });

      const followerCounts = await Promise.all(followerCountRequests);

      followerCounts.forEach(({ creatorId, followers }) => {
        if (!nextMetrics[creatorId]) {
          return;
        }

        nextMetrics[creatorId].followers = followers;
      });

      setMetricsByCreator(nextMetrics);
    }

    if (followingResult.error) {
      setFollowingCreatorIds(new Set());
    } else {
      const followingIds = new Set(
        (followingResult.data ?? []).map((entry) => entry.creator_id as string),
      );
      setFollowingCreatorIds(followingIds);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    void loadCreators();
  }, [user?.id]);

  const handleToggleFollow = async (creator: CreatorPublicProfile) => {
    if (!user?.id) {
      toast("Login to follow creators", { type: "info" });
      return;
    }

    if (user.id === creator.id) {
      return;
    }

    const isFollowing = followingCreatorIds.has(creator.id);
    setTogglingCreatorId(creator.id);

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

        setFollowingCreatorIds((current) => {
          const next = new Set(current);
          next.delete(creator.id);
          return next;
        });

        setMetricsByCreator((current) => ({
          ...current,
          [creator.id]: {
            ...(current[creator.id] ?? {
              totalHooks: 0,
              totalLikes: 0,
              totalCopies: 0,
              followers: 0,
            }),
            followers: Math.max(0, (current[creator.id]?.followers ?? 1) - 1),
          },
        }));
      } else {
        const { error } = await supabase.from("creator_follows").insert({
          follower_id: user.id,
          creator_id: creator.id,
        });

        if (error) {
          throw error;
        }

        setFollowingCreatorIds((current) => {
          const next = new Set(current);
          next.add(creator.id);
          return next;
        });

        setMetricsByCreator((current) => ({
          ...current,
          [creator.id]: {
            ...(current[creator.id] ?? {
              totalHooks: 0,
              totalLikes: 0,
              totalCopies: 0,
              followers: 0,
            }),
            followers: (current[creator.id]?.followers ?? 0) + 1,
          },
        }));
      }
    } catch {
      toast("Could not update follow status", { type: "error" });
    } finally {
      setTogglingCreatorId(null);
    }
  };

  return (
    <Container className="relative py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: "easeOut" }}
      >
        <SectionHeader
          title="Creators"
          subtitle="Discover profiles, explore top hooks, and follow creators."
          className="mb-6"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.03, ease: "easeOut" }}
        whileHover={{ y: -1 }}
        className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#111111]/72 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between"
      >
        <div className="max-w-xl">
          <p className="text-sm font-medium text-white/85">
            Creator discovery is live
          </p>
          <p className="mt-1 text-xs text-white/45">
            Search by username or display name to find more creators to follow.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.16 }}
        >
          <CreatorEarlyAccessBadge compact className="shrink-0" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.06, ease: "easeOut" }}
        className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 backdrop-blur-xl"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search creators by name or username"
          className="w-full rounded-lg border border-white/[0.1] bg-[#0e0e0e] px-3 py-2 text-sm text-white/90 outline-none transition-colors placeholder:text-white/30 focus:border-[#7C5CFF]/45"
        />
      </motion.div>

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white/55"
        >
          Loading creators...
        </motion.div>
      ) : filteredCreators.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] p-6 text-sm text-white/45"
        >
          No creators found for this search.
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
          }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredCreators.map((creator) => {
            const metrics = metricsByCreator[creator.id] ?? {
              totalHooks: 0,
              totalLikes: 0,
              totalCopies: 0,
              followers: 0,
            };
            const isFollowing = followingCreatorIds.has(creator.id);
            const isSelf = !!user?.id && user.id === creator.id;
            const fallbackInitial =
              creator.display_name.trim().charAt(0).toUpperCase() || "C";

            return (
              <motion.article
                key={creator.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, scale: 1.008 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212]/72 p-4 backdrop-blur-xl"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 18% 0%, rgba(124,92,255,0.16), transparent 48%)",
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <Link
                    to={`/creator/${creator.username}`}
                    className="flex items-center gap-3"
                  >
                    {creator.avatar_url && !brokenAvatarIds.has(creator.id) ? (
                      <motion.img
                        whileHover={{ scale: 1.04 }}
                        src={creator.avatar_url}
                        alt={creator.display_name}
                        onError={() =>
                          setBrokenAvatarIds((current) => {
                            const next = new Set(current);
                            next.add(creator.id);
                            return next;
                          })
                        }
                        className="h-10 w-10 rounded-full border border-[#8C71FF]/35 object-cover"
                      />
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8C71FF]/35 bg-[#7C5CFF]/14 text-sm font-semibold text-[#D9CCFF]"
                      >
                        {fallbackInitial}
                      </motion.div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-white/92">
                        {creator.display_name}
                      </p>
                      <p className="text-xs text-white/45">
                        @{creator.username}
                      </p>
                    </div>
                  </Link>

                  {!isSelf ? (
                    <motion.button
                      type="button"
                      disabled={togglingCreatorId === creator.id}
                      onClick={() => void handleToggleFollow(creator)}
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      animate={
                        isFollowing
                          ? {
                              boxShadow: [
                                "0 0 0 rgba(16,185,129,0)",
                                "0 0 18px rgba(16,185,129,0.24)",
                                "0 0 0 rgba(16,185,129,0)",
                              ],
                            }
                          : undefined
                      }
                      transition={
                        isFollowing
                          ? {
                              duration: 2.3,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : { duration: 0.15 }
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isFollowing
                          ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-200"
                          : "border-[#8C71FF]/45 bg-[#7C5CFF]/16 text-[#E3DAFF] hover:bg-[#7C5CFF]/24"
                      }`}
                    >
                      {togglingCreatorId === creator.id
                        ? "..."
                        : isFollowing
                          ? "Following"
                          : "Follow"}
                    </motion.button>
                  ) : (
                    <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[11px] text-white/55">
                      You
                    </span>
                  )}
                </div>

                <div className="relative z-10 mt-4 grid grid-cols-2 gap-2 text-xs">
                  <motion.div
                    whileHover={{ y: -1, scale: 1.01 }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2"
                  >
                    <p className="text-white/40">Hooks</p>
                    <p className="mt-0.5 text-sm font-semibold text-white/90">
                      {metrics.totalHooks}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -1, scale: 1.01 }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2"
                  >
                    <p className="text-white/40">Followers</p>
                    <p className="mt-0.5 text-sm font-semibold text-white/90">
                      {metrics.followers}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -1, scale: 1.01 }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2"
                  >
                    <p className="text-white/40">Likes</p>
                    <p className="mt-0.5 text-sm font-semibold text-white/90">
                      {metrics.totalLikes}
                    </p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -1, scale: 1.01 }}
                    className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2"
                  >
                    <p className="text-white/40">Copies</p>
                    <p className="mt-0.5 text-sm font-semibold text-white/90">
                      {metrics.totalCopies}
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15 }}
                >
                  <Link
                    to={`/creator/${creator.username}`}
                    className="relative z-10 mt-4 inline-flex rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:border-white/[0.16] hover:text-white"
                  >
                    View profile
                  </Link>
                </motion.div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </Container>
  );
}
