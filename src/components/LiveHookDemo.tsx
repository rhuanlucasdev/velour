import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";

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
  const cardX = useMotionValue(0.5);
  const cardY = useMotionValue(0.5);
  const glowX = useMotionValue("50%");
  const glowY = useMotionValue("50%");

  const rotateXRaw = useTransform(cardY, [0, 1], [6, -6]);
  const rotateYRaw = useTransform(cardX, [0, 1], [-6, 6]);

  const rotateX = useSpring(rotateXRaw, {
    stiffness: 130,
    damping: 20,
    mass: 0.5,
  });
  const rotateY = useSpring(rotateYRaw, {
    stiffness: 130,
    damping: 20,
    mass: 0.5,
  });
  const pointerGlow = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(124,92,255,0.2), transparent 42%)`,
  );

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

  const handleCardMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width;
    const normalizedY = (event.clientY - rect.top) / rect.height;

    cardX.set(Math.max(0, Math.min(1, normalizedX)));
    cardY.set(Math.max(0, Math.min(1, normalizedY)));
    glowX.set(`${event.clientX - rect.left}px`);
    glowY.set(`${event.clientY - rect.top}px`);
  };

  const handleCardMouseLeave = () => {
    cardX.set(0.5);
    cardY.set(0.5);
    glowX.set("50%");
    glowY.set("50%");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative max-w-3xl mx-auto mb-24"
    >
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-16 left-1/2 h-44 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.34)_0%,rgba(124,92,255,0)_72%)] blur-2xl" />
      </div>

      <motion.div
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
          transformStyle: "preserve-3d",
        }}
        className="group relative isolate overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl shadow-[inset_0_0_36px_rgba(139,92,246,0.08),0_18px_56px_rgba(0,0,0,0.4)]"
      >
        <motion.div
          className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100"
          style={{ background: pointerGlow }}
        />
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />

        <div className="relative z-10">
          <h2 className="text-3xl font-semibold tracking-tight text-white/95">
            Try Velour Live
          </h2>
          <p className="mt-2 text-base text-white/55">
            Type an idea and watch Velour craft hooks instantly.
          </p>

          <div className="p-3 mt-6 border rounded-2xl border-white/10 bg-black/25 backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                placeholder="example: growing on Twitter"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-4 text-sm text-white/90 outline-none transition-all placeholder:text-white/35 focus:border-[#7C5CFF]/60 focus:shadow-[0_0_0_3px_rgba(124,92,255,0.15)]"
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
          </div>

          <div className="mt-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {hooks.map((hook, index) => (
                <motion.article
                  key={hook}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.28,
                    ease: "easeOut",
                    delay: index * 0.04,
                  }}
                  className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-white/85 transition-all duration-200 hover:border-[#7C5CFF]/40 hover:bg-black/55 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                >
                  {hook}
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          <a
            href="/app"
            className="mt-7 inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white/85 transition-all duration-200 hover:scale-[1.02] hover:border-white/30 hover:bg-[#1F1F1F]"
          >
            Open Velour
          </a>
        </div>
      </motion.div>
    </motion.section>
  );
}
