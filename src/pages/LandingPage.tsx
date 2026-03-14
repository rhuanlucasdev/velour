import AuroraBackground from "../components/ui/AuroraBackground";
import LiveActivityFeed from "../components/LiveActivityFeed";
import LiveHookDemo from "../components/LiveHookDemo";
import SocialProof from "../components/SocialProof";
import GridBackground from "../components/ui/GridBackground";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type SVGProps,
} from "react";

const features = [
  {
    title: "Hook Templates",
    description:
      "Start from proven structures to write scroll-stopping intros.",
  },
  {
    title: "Hook Strength Score",
    description: "Get instant feedback to improve hook clarity and impact.",
  },
  {
    title: "Drag & Drop Idea Board",
    description:
      "Organize your ideas visually and prioritize what to publish next.",
  },
  {
    title: "Post Preview (Twitter / LinkedIn)",
    description: "Preview your content formatting before you publish.",
  },
  {
    title: "Idea Tags",
    description: "Label concepts by topic, angle, or campaign in seconds.",
  },
  {
    title: "Command Palette",
    description: "Move faster with keyboard-first actions and quick commands.",
  },
];

const steps = [
  {
    title: "Capture your idea",
    description:
      "Drop raw thoughts into your board so every concept has a place to grow.",
  },
  {
    title: "Craft a powerful hook",
    description:
      "Refine your opener with templates and score guidance built for creators.",
  },
  {
    title: "Export your post",
    description:
      "Preview and finalize your content for social channels with confidence.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0 / month",
    features: ["5 ideas", "basic templates", "post preview", "local storage"],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$12 / month",
    features: [
      "unlimited ideas",
      "all hook templates",
      "hook strength scoring",
      "export to Twitter and LinkedIn",
    ],
    badge: "Most Popular",
    cta: "Upgrade to Pro",
  },
  {
    name: "Creator",
    price: "$29 / month",
    features: [
      "everything in Pro",
      "advanced hook analytics",
      "content calendar",
      "priority updates",
    ],
    cta: "Go Creator",
  },
];

const heroWords = ["Hooks", "Threads", "Posts", "Content"];

function TwitterLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.543 7.104c.015.213.015.426.015.64 0 6.525-4.968 14.053-14.053 14.053A13.95 13.95 0 0 1 0 19.54c.396.046.777.061 1.188.061a9.883 9.883 0 0 0 6.124-2.107 4.942 4.942 0 0 1-4.617-3.428c.305.046.61.076.93.076.442 0 .884-.061 1.295-.168A4.935 4.935 0 0 1 .96 9.138V9.08c.655.366 1.417.594 2.214.624A4.93 4.93 0 0 1 1.646 3.12a13.998 13.998 0 0 0 10.148 5.153 5.57 5.57 0 0 1-.122-1.127 4.935 4.935 0 0 1 8.533-3.367A9.796 9.796 0 0 0 23.33 2.59a4.922 4.922 0 0 1-2.168 2.717A9.875 9.875 0 0 0 24 4.54a10.615 10.615 0 0 1-2.457 2.564Z" />
    </svg>
  );
}

function LinkedInLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554V14.89c0-1.327-.026-3.035-1.85-3.035-1.853 0-2.136 1.445-2.136 2.939v5.658H9.354V9h3.414v1.561h.048c.477-.9 1.637-1.85 3.37-1.85 3.602 0 4.266 2.37 4.266 5.455v6.286ZM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126ZM7.114 20.452H3.56V9h3.554v11.452Z" />
    </svg>
  );
}

function SubstackLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="2.2" rx="0.8" />
      <rect x="3" y="8" width="18" height="2.2" rx="0.8" />
      <rect x="3" y="12" width="18" height="2.2" rx="0.8" />
      <path d="M4 16h16v4.2a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8V16Z" />
    </svg>
  );
}

function MediumLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="6" cy="12" r="4.2" />
      <ellipse cx="13.7" cy="12" rx="3.2" ry="5.2" />
      <ellipse cx="19.8" cy="12" rx="1.9" ry="4.1" />
    </svg>
  );
}

function GhostLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 3a8 8 0 0 0-8 8v8.6a.4.4 0 0 0 .683.283L7.2 17.37a.4.4 0 0 1 .566 0l1.951 1.95a.4.4 0 0 0 .566 0l1.951-1.95a.4.4 0 0 1 .566 0l1.951 1.95a.4.4 0 0 0 .566 0l1.951-1.95a.4.4 0 0 1 .566 0l2.517 2.513A.4.4 0 0 0 20 19.6V11a8 8 0 0 0-8-8Zm-3 9a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 9 12Zm6 0a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 15 12Z" />
    </svg>
  );
}

const creatorPlatforms = [
  { name: "Twitter", Logo: TwitterLogo },
  { name: "LinkedIn", Logo: LinkedInLogo },
  { name: "Substack", Logo: SubstackLogo },
  { name: "Medium", Logo: MediumLogo },
  { name: "Ghost", Logo: GhostLogo },
];

const withoutVelourItems = [
  "blank page frustration",
  "weak hooks",
  "unstructured ideas",
  "slow writing",
];

const withVelourItems = [
  "idea capture board",
  "hook templates",
  "hook strength scoring",
  "post preview export",
];

function WithoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9 9l6 6M15 9l-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WithIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8.5 12.6 10.9 15l4.8-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepIcon({ index }: { index: number }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.12] bg-[#1A1A1A] text-sm font-semibold text-[#A78FFF]">
      {index + 1}
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  className?: string;
}

function FeatureCard({ title, description, className = "" }: FeatureCardProps) {
  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    card.style.setProperty("--x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group relative rounded-2xl p-px transition-all duration-300 hover:scale-[1.02] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-transparent transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-purple-500/30 group-hover:to-indigo-500/30" />

      <article className="relative h-full rounded-2xl border border-white/[0.08] bg-[#141414] p-5 transition-all duration-300 group-hover:border-transparent">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at var(--x) var(--y), rgba(139,92,246,0.15), transparent 40%)",
          }}
        />

        <div className="relative z-10">
          <h3 className="text-[15px] font-semibold tracking-tight text-white/92">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {description}
          </p>
        </div>
      </article>
    </div>
  );
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const landingRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const heroCtaX = useMotionValue(0);
  const heroCtaY = useMotionValue(0);
  const previewX = useMotionValue(0.5);
  const previewY = useMotionValue(0.5);
  const glowX = useMotionValue("50%");
  const glowY = useMotionValue("50%");

  const rotateXRaw = useTransform(previewY, [0, 1], [8, -8]);
  const rotateYRaw = useTransform(previewX, [0, 1], [-8, 8]);

  const rotateX = useSpring(rotateXRaw, {
    stiffness: 140,
    damping: 22,
    mass: 0.5,
  });
  const heroCtaSpringX = useSpring(heroCtaX, {
    stiffness: 220,
    damping: 18,
    mass: 0.5,
  });
  const heroCtaSpringY = useSpring(heroCtaY, {
    stiffness: 220,
    damping: 18,
    mass: 0.5,
  });
  const rotateY = useSpring(rotateYRaw, {
    stiffness: 140,
    damping: 22,
    mass: 0.5,
  });
  const previewGlow = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(139,92,246,0.14), transparent 45%)`,
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 18);
  });

  useEffect(() => {
    let frameId = 0;
    let latestX = window.innerWidth / 2;
    let latestY = window.innerHeight / 2;

    const applySpotlightPosition = () => {
      frameId = 0;

      if (!landingRef.current) {
        return;
      }

      landingRef.current.style.setProperty("--spotlight-x", `${latestX}px`);
      landingRef.current.style.setProperty("--spotlight-y", `${latestY}px`);
    };

    const handleMouseMove = (event: MouseEvent) => {
      latestX = event.clientX;
      latestY = event.clientY;

      if (!frameId) {
        frameId = window.requestAnimationFrame(applySpotlightPosition);
      }
    };

    applySpotlightPosition();
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeroWordIndex((current) => (current + 1) % heroWords.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handlePreviewMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    previewX.set(Math.max(0, Math.min(1, px)));
    previewY.set(Math.max(0, Math.min(1, py)));
    glowX.set(`${event.clientX - rect.left}px`);
    glowY.set(`${event.clientY - rect.top}px`);
  };

  const handlePreviewMouseLeave = () => {
    previewX.set(0.5);
    previewY.set(0.5);
    glowX.set("50%");
    glowY.set("50%");
  };

  const handleHeroCtaMouseMove = (
    event: ReactMouseEvent<HTMLAnchorElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - rect.left - rect.width / 2;
    const relativeY = event.clientY - rect.top - rect.height / 2;
    const maxOffset = 12;

    heroCtaX.set(Math.max(-maxOffset, Math.min(maxOffset, relativeX * 0.2)));
    heroCtaY.set(Math.max(-maxOffset, Math.min(maxOffset, relativeY * 0.25)));
  };

  const handleHeroCtaMouseLeave = () => {
    heroCtaX.set(0);
    heroCtaY.set(0);
  };

  return (
    <div
      ref={landingRef}
      className="relative min-h-screen bg-[#0A0A0A] text-white"
    >
      <GridBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle 200px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(139,92,246,0.15), transparent 80%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='white'%3E%3Ccircle cx='12' cy='20' r='1'/%3E%3Ccircle cx='44' cy='72' r='1'/%3E%3Ccircle cx='88' cy='28' r='1'/%3E%3Ccircle cx='132' cy='60' r='1'/%3E%3Ccircle cx='164' cy='134' r='1'/%3E%3Ccircle cx='18' cy='146' r='1'/%3E%3Ccircle cx='70' cy='112' r='1'/%3E%3Ccircle cx='116' cy='158' r='1'/%3E%3Ccircle cx='152' cy='18' r='1'/%3E%3Ccircle cx='98' cy='92' r='1'/%3E%3Ccircle cx='36' cy='168' r='1'/%3E%3Ccircle cx='172' cy='86' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
      />

      <div className="relative z-[60] h-10 w-full bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="group mx-auto flex h-full w-full max-w-6xl items-center justify-center gap-2 px-4 text-center text-sm text-white/95 md:text-[13px]">
          <span>🚀 Velour Beta is Live — Try it now</span>
          <a
            href="/app"
            className="launch-cta font-semibold underline underline-offset-4 transition-opacity duration-200 hover:opacity-90 group-hover:animate-pulse"
          >
            Open Velour
          </a>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 md:px-8 lg:px-12">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: isScrolled ? 0.99 : 1,
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="sticky top-4 z-50 mx-auto mt-6 mb-20 flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        >
          <a
            href="/"
            className="text-[17px] font-semibold tracking-tight text-white/90"
          >
            Velour
          </a>
          <a
            href="/app"
            className="rounded-lg border border-white/[0.12] bg-[#151515] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-200 hover:border-[#7C5CFF]/60 hover:text-white hover:shadow-[0_0_18px_rgba(124,92,255,0.28)]"
          >
            Open App
          </a>
        </motion.header>

        <section className="relative isolate mx-auto mb-24 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-16 py-20 text-center backdrop-blur-xl shadow-[inset_0_0_40px_rgba(139,92,246,0.08),0_20px_80px_rgba(139,92,246,0.15)] before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:p-px before:opacity-70 before:content-[''] before:bg-gradient-to-br before:from-purple-300/40 before:via-indigo-300/20 before:to-blue-300/30 before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor]">
          <AuroraBackground />

          <div className="relative z-10">
            <h1 className="flex flex-wrap items-baseline justify-center gap-x-2 text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.05]">
              <span>Craft Viral</span>
              <span className="relative inline-grid place-items-center align-baseline text-center">
                <span className="invisible col-start-1 row-start-1 select-none bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Threads
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={heroWords[heroWordIndex]}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="col-start-1 row-start-1 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"
                  >
                    {heroWords[heroWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
              Velour helps creators structure ideas, write powerful hooks, and
              publish content faster.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <motion.a
                href="/app"
                onMouseMove={handleHeroCtaMouseMove}
                onMouseLeave={handleHeroCtaMouseLeave}
                style={{ x: heroCtaSpringX, y: heroCtaSpringY }}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.38)]"
              >
                Open Velour
              </motion.a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.12] bg-[#151515] px-5 py-2.5 text-sm font-medium text-white/75 transition-all duration-200 hover:scale-105 hover:border-white/[0.22] hover:text-white"
              >
                View Features
              </a>
            </div>
          </div>
        </section>

        <section className="mb-24 text-center">
          <p className="text-sm font-medium text-white/55 md:text-base">
            Used by creators publishing on
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-10">
            {creatorPlatforms.map(({ name, Logo }) => (
              <span
                key={name}
                className="inline-flex h-7 w-7 items-center justify-center text-white grayscale opacity-50 transition-opacity duration-200 hover:opacity-100"
                aria-label={name}
                title={name}
              >
                <Logo className="h-full w-full" />
                <span className="sr-only">{name}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
            Writing content without Velour vs with Velour.
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <motion.article
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.35 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-semibold text-white/90">
                Without Velour
              </h3>
              <ul className="mt-5 space-y-3">
                {withoutVelourItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/70 md:text-base"
                  >
                    <WithoutIcon className="h-4 w-4 flex-none text-white/60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
              viewport={{ once: true, amount: 0.35 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-semibold text-white/90">
                With Velour
              </h3>
              <ul className="mt-5 space-y-3">
                {withVelourItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/70 md:text-base"
                  >
                    <WithIcon className="h-4 w-4 flex-none text-white/85" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          </div>
        </section>

        <LiveHookDemo />
        <SocialProof />

        <motion.section
          id="features"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-24"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
              Product Features
            </h2>
            <p className="mt-2 text-sm text-white/50 md:text-base">
              Everything you need to go from raw idea to publish-ready post.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[150px]">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                className={`${
                  index === 0 || index === 3 ? "lg:col-span-2" : "lg:col-span-1"
                }`}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-24"
        >
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.4),inset_0_0_30px_rgba(139,92,246,0.1)] md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.22),rgba(139,92,246,0)_52%)]" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/[0.06]" />

            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full border border-purple-300/30 bg-purple-500/15 px-3 py-1 text-[11px] font-medium tracking-[0.06em] text-purple-100/90">
                LIMITED BETA ACCESS
              </span>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
                Join the Velour Creator Beta
              </h2>
              <p className="mt-3 text-sm text-white/60 md:text-base">
                Get early access features and updates.
              </p>

              <form className="mx-auto mt-7 flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-2.5 sm:flex-row">
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#121212]/75 px-4 py-3 text-sm text-white/90 placeholder:text-white/40 outline-none transition-all duration-200 focus:border-purple-400/70 focus:shadow-[0_0_0_3px_rgba(124,92,255,0.24),0_0_30px_rgba(124,92,255,0.28)]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-transparent bg-[#7C5CFF] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6B4EE0] hover:shadow-[0_0_28px_rgba(124,92,255,0.45)]"
                >
                  Join Beta
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <p className="mt-3 text-xs text-white/45">
                No spam. Just product updates.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="relative mb-24"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
            <div className="h-[320px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.28)_0%,rgba(99,102,241,0.18)_35%,rgba(59,130,246,0)_70%)] blur-3xl" />
          </div>

          <div className="mx-auto max-w-5xl">
            <motion.div
              onMouseMove={handlePreviewMouseMove}
              onMouseLeave={handlePreviewMouseLeave}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                rotateX,
                rotateY,
                transformPerspective: 1100,
                transformStyle: "preserve-3d",
              }}
              className="group relative rounded-xl border border-white/[0.08] bg-[#121212] p-4 shadow-[0_26px_70px_rgba(0,0,0,0.55),0_0_35px_rgba(124,92,255,0.16)]"
            >
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: previewGlow }}
              />

              <div className="rounded-lg border border-white/[0.06] bg-[#0F0F0F] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-white/[0.07] bg-[#171717] p-4">
                    <p className="text-xs uppercase tracking-[0.08em] text-white/40">
                      Idea Board
                    </p>
                    <p className="mt-3 text-sm text-white/80">
                      Viral CTO Story Angle
                    </p>
                    <p className="mt-2 text-xs text-white/45">
                      #storytelling #startup
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.07] bg-[#171717] p-4 md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.08em] text-white/40">
                      Hook Composer
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-white/72">
                      "Most founders don&apos;t fail because of product — they
                      fail because their message sounds like everyone else."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <p className="mt-4 text-center text-sm text-white/50">
            Organize, write and refine your content ideas in one place.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-24"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
            How It Works
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-white/[0.08] bg-[#141414] p-5"
              >
                <StepIcon index={index} />
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-white/92">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto mb-24 max-w-6xl py-12 md:py-16"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white/95 md:text-4xl">
            Simple Pricing
          </h2>
          <p className="mt-3 text-base text-white/55 md:text-lg">
            Start free and upgrade when you need more power.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:mt-9 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <article
                key={plan.name}
                className={`pricing-card group relative rounded-3xl border border-white/10 bg-white/5 p-[1px] backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_24px_70px_rgba(124,92,255,0.2)] ${
                  index === 1
                    ? "pricing-card-popular md:scale-[1.05] md:shadow-[0_0_80px_rgba(139,92,246,0.3)] md:hover:shadow-[0_0_100px_rgba(139,92,246,0.36)]"
                    : ""
                }`}
              >
                <div
                  className={`relative h-full rounded-3xl ${
                    index === 1
                      ? "border border-white/10 bg-[linear-gradient(180deg,rgba(28,20,48,0.96),rgba(18,18,18,0.96))] p-7 backdrop-blur-lg"
                      : "border border-white/[0.08] bg-[linear-gradient(180deg,rgba(38,38,38,0.9),rgba(28,28,28,0.86))] p-7 backdrop-blur-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white/75">
                      {plan.name}
                    </p>
                    {plan.badge ? (
                      <span className="rounded-full border border-purple-300/40 bg-purple-500/20 px-2.5 py-1 text-[11px] font-medium text-purple-100 shadow-[0_0_18px_rgba(139,92,246,0.22)]">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-3xl font-semibold tracking-tight text-white/95">
                    {plan.price}
                  </p>

                  <ul className="mt-5 space-y-2.5 text-sm text-white/65">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#A78FFF]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/app"
                    className={`mt-7 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      index === 1
                        ? "border-transparent bg-[#7C5CFF] text-white hover:bg-[#6B4EE0] hover:shadow-[0_0_28px_rgba(124,92,255,0.45)]"
                        : "border-white/15 bg-[#171717] text-white/85 hover:border-white/30 hover:bg-[#1F1F1F]"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
          className="mb-20 rounded-2xl border border-white/[0.1] bg-[#121212] px-6 py-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:px-8"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Start Writing Better Hooks Today
          </h2>
          <a
            href="/app"
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.42)]"
          >
            Launch Velour
          </a>
        </motion.section>

        <footer className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] pt-6 text-sm text-white/45 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-white/80">Velour</p>
            <p className="mt-1">Built for creators</p>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://twitter.com"
              className="transition-colors hover:text-white/80"
            >
              Twitter
            </a>
            <a
              href="https://github.com"
              className="transition-colors hover:text-white/80"
            >
              GitHub
            </a>
            <a href="#" className="transition-colors hover:text-white/80">
              Privacy
            </a>
          </div>
        </footer>
      </div>

      <LiveActivityFeed />
    </div>
  );
}
