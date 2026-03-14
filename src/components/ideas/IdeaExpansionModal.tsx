import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useIdeaStore } from "../../store/ideaStore";
import type { Idea } from "../../types/idea";
import { toast } from "../../utils/toast";
import PostPreviewModal from "../preview/PostPreviewModal";
import AutosaveIndicator from "../ui/AutosaveIndicator";
import Button from "../ui/Button";
import HookBlock from "./HookBlock";
import HookStrengthIndicator from "./HookStrengthIndicator";
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
  const [autosaveStatus, setAutosaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const updateIdea = useIdeaStore((state) => state.updateIdea);
  const deleteIdea = useIdeaStore((state) => state.deleteIdea);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tags = idea.tags ?? [];

  const updateIdeaWithAutosave = (
    patch: Partial<Omit<Idea, "id" | "createdAt">>,
  ) => {
    setAutosaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    updateIdea(idea.id, patch);

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
    await navigator.clipboard.writeText(idea.hook);
    toast("Hook copiado para o clipboard ✨", { type: "success" });
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
              deleteIdea(idea.id);
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
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview Post
          </Button>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-white/[0.06] bg-[#1C1C1C]/70 p-4">
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
              <TagInput onAddTag={handleAddTag} />
            </div>
          </section>

          <HookTemplatePicker ideaId={idea.id} />

          <HookBlock
            title="Hook"
            value={idea.hook}
            onChange={(value) => updateIdeaWithAutosave({ hook: value })}
            placeholder="Capture the opening hook..."
          />

          <HookStrengthIndicator hook={idea.hook} />

          <button
            onClick={handleCopyHook}
            disabled={!idea.hook.trim()}
            className="inline-flex items-center rounded-lg border border-white/[0.12] bg-[#1A1A1A] px-3 py-2 text-sm text-white/80 transition duration-200 hover:scale-105 hover:border-violet-400/60 hover:shadow-[0_0_16px_rgba(167,139,250,0.22)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/[0.12] disabled:hover:shadow-none"
          >
            Copy Hook
          </button>

          <HookBlock
            title="Insight"
            value={idea.insight}
            onChange={(value) => updateIdeaWithAutosave({ insight: value })}
            placeholder="Describe the core insight..."
          />

          <HookBlock
            title="Twist"
            value={idea.twist}
            onChange={(value) => updateIdeaWithAutosave({ twist: value })}
            placeholder="Add an unexpected angle..."
          />

          <HookBlock
            title="CTA"
            value={idea.cta}
            onChange={(value) => updateIdeaWithAutosave({ cta: value })}
            placeholder="Define the call to action..."
          />
        </div>
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
