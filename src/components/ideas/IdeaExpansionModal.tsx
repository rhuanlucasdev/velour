import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { canUseFeature, getUserPlan } from "../../lib/plans";
import { useIdeaStore } from "../../store/ideaStore";
import { useUpgradeStore } from "../../store/upgradeStore";
import type { Idea } from "../../types/idea";
import { toast } from "../../utils/toast";
import PostPreviewModal from "../preview/PostPreviewModal";
import AutosaveIndicator from "../ui/AutosaveIndicator";
import Button from "../ui/Button";
import HookBlock from "./HookBlock";
import HookStrengthIndicator from "./HookStrengthIndicator";
import HookAnalyticsPanel from "./HookAnalyticsPanel";
import HookShareCard from "./HookShareCard";
import HookTemplatePicker from "./HookTemplatePicker";
import TagInput from "./TagInput";
import TagPill from "./TagPill";

interface IdeaExpansionModalProps {
  idea: Idea;
  onClose: () => void;
}

export default function IdeaExpansionModal({
  idea,
  onClose,
}: IdeaExpansionModalProps) {
  const { user, profile } = useAuth();
  const userPlan = getUserPlan({ user, profile });
  const canUseHookScore = canUseFeature("hookScore", userPlan);
  const canUseExport = canUseFeature("export", userPlan);
  const canUseAnalytics = canUseFeature("analytics", userPlan);
  const openUpgradeModal = useUpgradeStore((state) => state.openUpgradeModal);
  const [autosaveStatus, setAutosaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const updateIdea = useIdeaStore((state) => state.updateIdea);
  const deleteIdea = useIdeaStore((state) => state.deleteIdea);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [isTwistOpen, setIsTwistOpen] = useState(false);
  const [isCtaOpen, setIsCtaOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tags = idea.tags ?? [];

  const hasInsight = idea.insight.trim().length > 0;
  const hasTwist = idea.twist.trim().length > 0;
  const hasCta = idea.cta.trim().length > 0;

  const updateIdeaWithAutosave = (
    patch: Partial<Omit<Idea, "id" | "createdAt">>,
  ) => {
    setAutosaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    void updateIdea(idea.id, patch);

    saveTimeoutRef.current = setTimeout(() => {
      setAutosaveStatus("saved");
    }, 700);
  };

  const handleAddTag = (newTag: string) => {
    const normalizedTag = newTag.trim();
    if (!normalizedTag) {
      return;
    }

    const alreadyExists = tags.some(
      (tag) => tag.toLowerCase() === normalizedTag.toLowerCase(),
    );

    if (alreadyExists) {
      return;
    }

    updateIdeaWithAutosave({
      tags: [...tags, normalizedTag],
    });
    toast("Tag added", { type: "success" });
  };

  const handleCopyHook = async () => {
    if (!canUseExport) {
      toast("Export is available on Pro and Creator plans.", {
        type: "info",
      });
      openUpgradeModal();
      return;
    }

    await navigator.clipboard.writeText(idea.hook);
    toast("Hook copiado para o clipboard ✨", { type: "success" });
  };

  const handleSaveHookToLibrary = async () => {
    if (!idea.hook.trim()) {
      toast("Write a hook first before saving to library.", { type: "info" });
      return;
    }

    if (!user?.id) {
      toast("You need to be logged in to save hooks.", { type: "error" });
      return;
    }

    setIsSavingToLibrary(true);

    try {
      const primaryCategory =
        idea.tags
          .find((tag) => tag.trim().length > 0)
          ?.trim()
          .toLowerCase() || "general";

      const { error } = await supabase.from("hooks_library").insert({
        hook_text: idea.hook.trim(),
        category: primaryCategory,
        likes: 0,
        copies: 0,
        created_by: user.id,
      });

      if (error) {
        throw error;
      }

      toast("Hook saved to Viral Library 🚀", { type: "success" });
    } catch {
      toast("Could not save hook to library", { type: "error" });
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (hasInsight) {
      setIsInsightOpen(true);
    }
  }, [hasInsight]);

  useEffect(() => {
    if (hasTwist) {
      setIsTwistOpen(true);
    }
  }, [hasTwist]);

  useEffect(() => {
    if (hasCta) {
      setIsCtaOpen(true);
    }
  }, [hasCta]);

  const renderCollapsibleBlock = ({
    title,
    value,
    placeholder,
    isOpen,
    onToggle,
    onChange,
  }: {
    title: string;
    value: string;
    placeholder: string;
    isOpen: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
  }) => {
    const isFilled = value.trim().length > 0;

    return (
      <section className="rounded-xl">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-left"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/55">
              {title}
            </h3>
            {isFilled ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                Filled
              </span>
            ) : null}
          </div>

          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-white/45"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6.5L8 10.5L12 6.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              key={`${title}-content`}
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden pt-2"
            >
              <HookBlock
                title={title}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                hideTitle
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Idea expansion view"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[800px] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#121212]/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <input
            value={idea.title}
            onChange={(event) =>
              updateIdeaWithAutosave({ title: event.target.value })
            }
            className="w-full bg-transparent pr-2 text-[26px] font-semibold tracking-tight text-white/95 outline-none placeholder:text-white/30"
            placeholder="Untitled Idea"
            aria-label="Idea title"
          />
          <AutosaveIndicator status={autosaveStatus} />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              void deleteIdea(idea.id);
              toast("Idea deleted 🗑️", { type: "info" });
              onClose();
            }}
            aria-label="Delete idea"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] text-white/35 transition-all duration-150 hover:bg-red-500/10 hover:text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete idea
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!canUseExport) {
                toast("Export is available on Pro and Creator plans.", {
                  type: "info",
                });
                openUpgradeModal();
                return;
              }

              setIsPreviewOpen(true);
            }}
          >
            Preview Post
          </Button>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.035 },
            },
          }}
          className="space-y-5"
        >
          <motion.section
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            className="rounded-xl border border-white/[0.06] bg-[#1C1C1C]/70 p-4"
          >
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
              <TagInput onAddTag={handleAddTag} />
            </div>
          </motion.section>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <HookTemplatePicker ideaId={idea.id} />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <HookBlock
              title="Hook"
              value={idea.hook}
              onChange={(value) => updateIdeaWithAutosave({ hook: value })}
              placeholder="Capture the opening hook..."
            />
          </motion.div>

          {canUseHookScore ? (
            <HookStrengthIndicator hook={idea.hook} />
          ) : (
            <div className="rounded-lg border border-purple-400/25 bg-purple-500/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-medium text-purple-200">
                    Hook Strength Scoring
                  </p>
                  <p className="mt-0.5 text-[11px] text-purple-200/70">
                    Available on Pro and Creator plans.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openUpgradeModal}
                  className="rounded-md border border-purple-300/35 bg-purple-500/20 px-2.5 py-1 text-[11px] font-medium text-purple-100 transition-colors hover:bg-purple-500/30"
                >
                  Upgrade
                </button>
              </div>
            </div>
          )}

          {canUseAnalytics ? (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <HookAnalyticsPanel hook={idea.hook} />
            </motion.div>
          ) : null}

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <motion.button
              onClick={handleCopyHook}
              disabled={!idea.hook.trim()}
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-lg border border-white/[0.12] bg-[#1A1A1A] px-3 py-2 text-sm text-white/80 transition duration-200 hover:scale-105 hover:border-violet-400/60 hover:shadow-[0_0_16px_rgba(167,139,250,0.22)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/[0.12] disabled:hover:shadow-none"
              aria-label="Copy hook"
            >
              {canUseExport ? "Copy Hook" : "Copy Hook (Pro)"}
            </motion.button>

            <motion.button
              type="button"
              onClick={() => void handleSaveHookToLibrary()}
              disabled={!idea.hook.trim() || isSavingToLibrary}
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-lg border border-[#7C5CFF]/35 bg-[#7C5CFF]/12 px-3 py-2 text-sm text-[#d8cfff] transition-all duration-200 hover:border-[#9f85ff]/45 hover:bg-[#7C5CFF]/20 hover:shadow-[0_0_18px_rgba(124,92,255,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingToLibrary ? "Saving..." : "Save to Library"}
            </motion.button>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <HookShareCard hook={idea.hook} />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {renderCollapsibleBlock({
              title: "Insight",
              value: idea.insight,
              placeholder: "Describe the core insight...",
              isOpen: isInsightOpen,
              onToggle: () => setIsInsightOpen((current) => !current),
              onChange: (value) => updateIdeaWithAutosave({ insight: value }),
            })}
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {renderCollapsibleBlock({
              title: "Twist",
              value: idea.twist,
              placeholder: "Add an unexpected angle...",
              isOpen: isTwistOpen,
              onToggle: () => setIsTwistOpen((current) => !current),
              onChange: (value) => updateIdeaWithAutosave({ twist: value }),
            })}
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            {renderCollapsibleBlock({
              title: "CTA",
              value: idea.cta,
              placeholder: "Define the call to action...",
              isOpen: isCtaOpen,
              onToggle: () => setIsCtaOpen((current) => !current),
              onChange: (value) => updateIdeaWithAutosave({ cta: value }),
            })}
          </motion.div>
        </motion.div>
      </motion.div>

      {isPreviewOpen && (
        <PostPreviewModal
          hook={idea.hook}
          insight={idea.insight}
          twist={idea.twist}
          cta={idea.cta}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
