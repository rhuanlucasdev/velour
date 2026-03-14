import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

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

interface GeneratedHook {
  id: string;
  text: string;
  isComplete: boolean;
}

export default function LiveHookDemo() {
  const [idea, setIdea] = useState("");
  const [hooks, setHooks] = useState<GeneratedHook[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardX = useMotionValue(0.5);
  const cardY = useMotionValue(0.5);
  const glowX = useMotionValue("50%");
  const glowY = useMotionValue("50%");
  const generationTimeoutsRef = useRef<number[]>([]);

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

  const clearGenerationTimeouts = () => {
    generationTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    generationTimeoutsRef.current = [];
  };

  const handleGenerateHooks = () => {
    const normalizedIdea = idea.trim();
    if (!normalizedIdea) {
      return;
    }

    const selectedTemplates = shuffle(hookTemplates).slice(0, 3);
    const generatedHooks = selectedTemplates.map((template) =>
      template.replace(/\{idea\}/g, normalizedIdea),
    );

    clearGenerationTimeouts();
    setHooks([]);
    setIsGenerating(true);

    const typeHook = (hookIndex: number, charIndex = 0) => {
      const fullHook = generatedHooks[hookIndex];

      if (!fullHook) {
        setIsGenerating(false);
        return;
      }

      const typingTimeout = window.setTimeout(() => {
        const nextText = fullHook.slice(0, charIndex + 1);

        setHooks((currentHooks) => {
          const nextHooks = [...currentHooks];

          if (!nextHooks[hookIndex]) {
            nextHooks[hookIndex] = {
              id: `${hookIndex}-${fullHook}`,
              text: nextText,
              isComplete: false,
            };
          } else {
            nextHooks[hookIndex] = {
              ...nextHooks[hookIndex],
              text: nextText,
            };
          }

          return nextHooks;
        });

        if (charIndex + 1 < fullHook.length) {
          typeHook(hookIndex, charIndex + 1);
          return;
        }

        setHooks((currentHooks) => {
          const nextHooks = [...currentHooks];
          const currentHook = nextHooks[hookIndex];

          if (currentHook) {
            nextHooks[hookIndex] = {
              ...currentHook,
              isComplete: true,
            };
          }

          return nextHooks;
        });

        const nextHookTimeout = window.setTimeout(() => {
          if (hookIndex + 1 < generatedHooks.length) {
            typeHook(hookIndex + 1, 0);
            return;
          }

          setIsGenerating(false);
        }, 260);

        generationTimeoutsRef.current.push(nextHookTimeout);
      }, 28);

      generationTimeoutsRef.current.push(typingTimeout);
    };

    typeHook(0, 0);
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

  useEffect(() => {
    return () => {
      clearGenerationTimeouts();
    };
  }, []);

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

          {isGenerating ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-sm text-white/60 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8B5CF6]/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
              </span>
              <span>Velour AI generating hooks</span>
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {hooks.map((hook, index) => (
                <motion.article
                  key={hook.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: 0.28,
                    ease: "easeOut",
                    delay: index * 0.04,
                  }}
                  className={`rounded-xl border bg-black/40 p-4 text-sm leading-relaxed text-white/85 transition-all duration-300 hover:border-[#7C5CFF]/40 hover:bg-black/55 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] ${
                    hook.isComplete
                      ? "border-[#7C5CFF]/35 shadow-[0_0_26px_rgba(124,92,255,0.16)]"
                      : "border-white/10"
                  }`}
                >
                  {hook.text}
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {!isGenerating &&
          hooks.length === 3 &&
          hooks.every((hook) => hook.isComplete) ? (
            <a
              href="/app"
              className="mt-7 inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white/85 transition-all duration-200 hover:scale-[1.02] hover:border-white/30 hover:bg-[#1F1F1F]"
            >
              Open Velour to save this idea
            </a>
          ) : null}
        </div>
      </motion.div>
    </motion.section>
  );
}
