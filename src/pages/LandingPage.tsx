import AuroraBackground from "../components/ui/AuroraBackground";

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

function StepIcon({ index }: { index: number }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.12] bg-[#1A1A1A] text-sm font-semibold text-[#A78FFF]">
      {index + 1}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-8 lg:px-12">
        <header className="mb-20 flex items-center justify-between">
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
        </header>

        <section className="relative isolate mx-auto mb-24 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-16 py-20 text-center backdrop-blur-xl shadow-[inset_0_0_40px_rgba(139,92,246,0.08),0_20px_80px_rgba(139,92,246,0.15)] before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:p-px before:opacity-70 before:content-[''] before:bg-gradient-to-br before:from-purple-300/40 before:via-indigo-300/20 before:to-blue-300/30 before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[-webkit-mask-composite:xor]">
          <AuroraBackground />

          <div className="relative z-10">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.05]">
              Craft{" "}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Viral Hooks
              </span>{" "}
              in Seconds
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
              Velour helps creators structure ideas, write powerful hooks, and
              publish content faster.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/app"
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.38)]"
              >
                Open Velour
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.12] bg-[#151515] px-5 py-2.5 text-sm font-medium text-white/75 transition-all duration-200 hover:scale-105 hover:border-white/[0.22] hover:text-white"
              >
                View Features
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="mb-24">
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
              <article
                key={feature.title}
                className={`rounded-2xl border border-white/[0.08] bg-[#141414] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_18px_36px_rgba(0,0,0,0.45)] ${
                  index === 0 || index === 3 ? "lg:col-span-2" : "lg:col-span-1"
                }`}
              >
                <h3 className="text-[15px] font-semibold tracking-tight text-white/92">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-24">
          <div className="mx-auto max-w-5xl rounded-xl border border-white/[0.08] bg-[#121212] p-4 shadow-[0_26px_70px_rgba(0,0,0,0.55),0_0_35px_rgba(124,92,255,0.16)]">
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
          </div>
          <p className="mt-4 text-center text-sm text-white/50">
            Organize, write and refine your content ideas in one place.
          </p>
        </section>

        <section className="mb-24">
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
        </section>

        <section className="mb-20 rounded-2xl border border-white/[0.1] bg-[#121212] px-6 py-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Start Writing Better Hooks Today
          </h2>
          <a
            href="/app"
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.42)]"
          >
            Launch Velour
          </a>
        </section>

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
    </div>
  );
}
