import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useIdeaStore } from "../../store/ideaStore";
import type { Idea } from "../../types/idea";
import PostPreviewModal from "../preview/PostPreviewModal";
import Button from "../ui/Button";
import HookBlock from "./HookBlock";
import HookStrengthIndicator from "./HookStrengthIndicator";
import HookTemplatePicker from "./HookTemplatePicker";

interface IdeaExpansionModalProps {
  idea: Idea;
  onClose: () => void;
}

export default function IdeaExpansionModal({
  idea,
  onClose,
}: IdeaExpansionModalProps) {
  const updateIdea = useIdeaStore((state) => state.updateIdea);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

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
        <input
          value={idea.title}
          onChange={(event) =>
            updateIdea(idea.id, { title: event.target.value })
          }
          className="mb-6 w-full bg-transparent text-[26px] font-semibold tracking-tight text-white/95 outline-none placeholder:text-white/30"
          placeholder="Untitled Idea"
          aria-label="Idea title"
        />

        <div className="mb-6 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview Post
          </Button>
        </div>

        <div className="space-y-5">
          <HookTemplatePicker ideaId={idea.id} />

          <HookBlock
            title="Hook"
            value={idea.hook}
            onChange={(value) => updateIdea(idea.id, { hook: value })}
            placeholder="Capture the opening hook..."
          />

          <HookStrengthIndicator hook={idea.hook} />

          <HookBlock
            title="Insight"
            value={idea.insight}
            onChange={(value) => updateIdea(idea.id, { insight: value })}
            placeholder="Describe the core insight..."
          />

          <HookBlock
            title="Twist"
            value={idea.twist}
            onChange={(value) => updateIdea(idea.id, { twist: value })}
            placeholder="Add an unexpected angle..."
          />

          <HookBlock
            title="CTA"
            value={idea.cta}
            onChange={(value) => updateIdea(idea.id, { cta: value })}
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
