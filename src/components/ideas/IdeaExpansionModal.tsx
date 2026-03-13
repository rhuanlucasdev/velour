import { motion } from "framer-motion";
import { useEffect } from "react";
import { useIdeaStore } from "../../store/ideaStore";
import type { Idea } from "../../types/idea";

interface IdeaExpansionModalProps {
  idea: Idea;
  onClose: () => void;
}

export default function IdeaExpansionModal({
  idea,
  onClose,
}: IdeaExpansionModalProps) {
  const updateIdea = useIdeaStore((state) => state.updateIdea);

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

        <div className="space-y-4">
          <section className="rounded-xl border border-white/[0.06] bg-[#1C1C1C]/70 p-4">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
              Hook
            </h3>
            <textarea
              value={idea.hook}
              onChange={(event) =>
                updateIdea(idea.id, { hook: event.target.value })
              }
              className="min-h-[90px] w-full resize-y bg-transparent text-[14px] leading-relaxed text-white/85 outline-none placeholder:text-white/25"
              placeholder="Capture the opening hook..."
            />
          </section>

          <section className="rounded-xl border border-white/[0.06] bg-[#1C1C1C]/70 p-4">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
              Insight
            </h3>
            <textarea
              value={idea.insight}
              onChange={(event) =>
                updateIdea(idea.id, { insight: event.target.value })
              }
              className="min-h-[90px] w-full resize-y bg-transparent text-[14px] leading-relaxed text-white/85 outline-none placeholder:text-white/25"
              placeholder="Describe the core insight..."
            />
          </section>

          <section className="rounded-xl border border-white/[0.06] bg-[#1C1C1C]/70 p-4">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
              Twist
            </h3>
            <textarea
              value={idea.twist}
              onChange={(event) =>
                updateIdea(idea.id, { twist: event.target.value })
              }
              className="min-h-[90px] w-full resize-y bg-transparent text-[14px] leading-relaxed text-white/85 outline-none placeholder:text-white/25"
              placeholder="Add an unexpected angle..."
            />
          </section>

          <section className="rounded-xl border border-white/[0.06] bg-[#1C1C1C]/70 p-4">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/45">
              CTA
            </h3>
            <textarea
              value={idea.cta}
              onChange={(event) =>
                updateIdea(idea.id, { cta: event.target.value })
              }
              className="min-h-[90px] w-full resize-y bg-transparent text-[14px] leading-relaxed text-white/85 outline-none placeholder:text-white/25"
              placeholder="Define the call to action..."
            />
          </section>
        </div>
      </motion.div>
    </div>
  );
}
