import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

const hookTemplates = [
  "Most people trying to {idea} are making this mistake.",
  "If you're struggling with {idea}, read this.",
  "The truth about {idea} that nobody talks about.",
  "Here's how I improved my {idea} in 30 days.",
  "Stop doing this if you want better results with {idea}.",
];

const shuffle = <T,>(items: T[]) => {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }

  return next;
};

export default function LiveHookDemo() {
  const [idea, setIdea] = useState("");
  const [hooks, setHooks] = useState<string[]>([]);

  const canGenerate = useMemo(() => idea.trim().length > 0, [idea]);

  const handleGenerateHooks = () => {
    const normalizedIdea = idea.trim();
    if (!normalizedIdea) {
      return;
    }

    const selectedTemplates = shuffle(hookTemplates).slice(0, 3);
    const generatedHooks = selectedTemplates.map((template) =>
      template.replace(/\{idea\}/g, normalizedIdea),
    );

    setHooks(generatedHooks);
  };

  return (
    <section className="max-w-3xl p-10 mx-auto mb-24 border rounded-3xl border-white/10 bg-white/5 backdrop-blur-xl">
      <h2 className="text-3xl font-semibold tracking-tight text-white/95">
        Try Velour Live
      </h2>
      <p className="mt-2 text-base text-white/55">
        Type an idea and watch Velour craft hooks instantly.
      </p>

      <div className="flex flex-col gap-3 mt-6 sm:flex-row">
        <input
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="example: growing on Twitter"
          className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition-colors placeholder:text-white/35 focus:border-[#7C5CFF]/60"
          aria-label="Type your idea"
        />
        <button
          onClick={handleGenerateHooks}
          disabled={!canGenerate}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-transparent bg-[#7C5CFF] px-5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.35)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Generate Hooks
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <AnimatePresence mode="popLayout">
          {hooks.map((hook) => (
            <motion.article
              key={hook}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white/85 transition-colors duration-200 hover:border-[#7C5CFF]/40 hover:bg-black/55"
            >
              {hook}
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      <a
        href="/app"
        className="mt-6 inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white/85 transition-all duration-200 hover:border-white/30 hover:bg-[#1F1F1F]"
      >
        Open Velour
      </a>
    </section>
  );
}
