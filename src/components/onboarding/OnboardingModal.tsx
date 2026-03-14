import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface OnboardingModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onStartCreating: () => void;
}

const steps = [
  {
    title: "Welcome to Velour",
    description:
      "Capture and refine content ideas fast with a clean creative workspace.",
  },
  {
    title: "Create your first idea",
    description:
      "Start from a blank idea card and shape your concept in seconds.",
  },
  {
    title: "Generate your first hook",
    description:
      "Turn your idea into a compelling opening line to boost engagement.",
  },
];

export default function OnboardingModal({
  isOpen,
  onSkip,
  onStartCreating,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const isLastStep = currentStep === steps.length - 1;

  const progress = useMemo(
    () => ((currentStep + 1) / steps.length) * 100,
    [currentStep],
  );

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="First time onboarding"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.58)]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 20% 0%, rgba(124,92,255,0.18), transparent 45%)",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                  Onboarding
                </p>
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-xs font-medium transition-colors text-white/45 hover:text-white/80"
                >
                  Skip
                </button>
              </div>

              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                      <div
                        key={step.title}
                        className="flex items-center flex-1 min-w-0 gap-2"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-200 ${
                            isCompleted
                              ? "border-[#7C5CFF]/50 bg-[#7C5CFF]/20 text-[#c7b9ff]"
                              : isActive
                                ? "border-[#7C5CFF]/65 bg-[#7C5CFF]/25 text-white"
                                : "border-white/15 bg-white/[0.03] text-white/40"
                          }`}
                        >
                          {index + 1}
                        </span>

                        {index < steps.length - 1 ? (
                          <span
                            className={`h-px flex-1 ${
                              index < currentStep
                                ? "bg-[#7C5CFF]/55"
                                : "bg-white/12"
                            }`}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="w-full h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-[#7C5CFF]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                </div>
              </div>

              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <h2 className="text-xl font-semibold tracking-tight text-white/95">
                  {steps[currentStep].title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {steps[currentStep].description}
                </p>
              </motion.div>

              <div className="flex items-center justify-between gap-3 mt-6">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={currentStep === 0}
                  className="inline-flex items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/70 transition-all duration-150 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Back
                </button>

                {isLastStep ? (
                  <button
                    type="button"
                    onClick={onStartCreating}
                    className="inline-flex items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-5 py-2 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.01] hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.34)] active:scale-[0.99]"
                  >
                    Start Creating
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentStep((prev) =>
                        Math.min(prev + 1, steps.length - 1),
                      )
                    }
                    className="inline-flex items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-5 py-2 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.01] hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.34)] active:scale-[0.99]"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
