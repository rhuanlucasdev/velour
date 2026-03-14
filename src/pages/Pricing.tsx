import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPlan, plans, type PlanId } from "../lib/plans";
import { useIdeaStore } from "../store/ideaStore";
import { toast } from "../utils/toast";
import CreatorEarlyAccessBadge from "../components/ui/CreatorEarlyAccessBadge";

type PlanCard = {
  id: PlanId;
  label: string;
  price: string;
  description: string;
  highlights: string[];
};

const planCards: PlanCard[] = [
  {
    id: "free",
    label: "Free",
    price: "$0",
    description: "Great for getting started",
    highlights: ["Up to 10 ideas", "Basic templates", "Manual editing"],
  },
  {
    id: "pro",
    label: "Pro",
    price: "$10/mo",
    description: "For consistent creators",
    highlights: [
      "Unlimited ideas",
      "All templates",
      "Hook strength scoring",
      "Export tools",
    ],
  },
  {
    id: "creator",
    label: "Creator",
    price: "$29/mo",
    description: "For advanced publishing workflows",
    highlights: ["Everything in Pro", "Advanced analytics", "Content calendar"],
  },
];

export default function Pricing() {
  const { user, profile } = useAuth();
  const loadIdeas = useIdeaStore((state) => state.loadIdeas);
  const ideas = useIdeaStore((state) => state.ideas);
  const isLoadingIdeas = useIdeaStore((state) => state.isLoading);
  const [isRedirectingPlan, setIsRedirectingPlan] = useState<PlanId | null>(
    null,
  );
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  const userPlan = getUserPlan({ user, profile });

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadIdeas(user.id);
  }, [loadIdeas, user?.id]);

  const hooksGenerated = useMemo(
    () => ideas.filter((idea) => idea.hook.trim().length > 0).length,
    [ideas],
  );

  const ideasLimit = plans.free.maxIdeas ?? 10;

  const startCheckout = async (plan: PlanId) => {
    if (!user?.id || !user?.email) {
      toast("You need to be logged in to upgrade", { type: "error" });
      return;
    }

    if (plan === "free") {
      return;
    }

    setIsRedirectingPlan(plan);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          plan,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      toast(error instanceof Error ? error.message : "Checkout failed", {
        type: "error",
      });
      setIsRedirectingPlan(null);
    }
  };

  const handleUpgrade = async (plan: PlanId) => {
    if (userPlan === "creator" && plan === "pro") {
      setShowDowngradeModal(true);
      return;
    }

    await startCheckout(plan);
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 0%, rgba(124,92,255,0.18), transparent 46%)",
            }}
          />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/35">
            Current Plan
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white/95">
              {userPlan === "creator"
                ? "Creator"
                : userPlan === "pro"
                  ? "Pro"
                  : "Free"}
            </h1>
            {userPlan === "creator" ? (
              <motion.div
                initial={{ scale: 0.96, opacity: 0.85 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.28, delay: 0.1 }}
              >
                <CreatorEarlyAccessBadge compact />
              </motion.div>
            ) : (
              <motion.span
                initial={{ scale: 0.96, opacity: 0.85 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.28, delay: 0.1 }}
                className="rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/12 px-3 py-1 text-xs font-medium text-[#d2c7ff]"
              >
                Velour Plan
              </motion.span>
            )}
          </div>
          <p className="mt-2 text-sm text-white/55">
            Choose the plan that matches your content workflow.
          </p>
        </motion.div>

        {userPlan === "free" ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
            className="mb-6 grid gap-4 md:grid-cols-2"
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-md"
            >
              <p className="text-[11px] uppercase tracking-wide text-white/40">
                Ideas used
              </p>
              <p className="mt-1 text-xl font-semibold text-white/90">
                {isLoadingIdeas
                  ? "..."
                  : `${Math.min(ideas.length, ideasLimit)}/${ideasLimit}`}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 360, damping: 26 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-md"
            >
              <p className="text-[11px] uppercase tracking-wide text-white/40">
                Hooks generated
              </p>
              <p className="mt-1 text-xl font-semibold text-white/90">
                {isLoadingIdeas ? "..." : hooksGenerated}
              </p>
            </motion.div>
          </motion.div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {planCards.map((plan, index) => {
            const isCurrent = plan.id === userPlan;
            const isBlocked = plan.id === "free";
            const isCreatorDowngrade =
              userPlan === "creator" && plan.id === "pro";

            return (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -4 }}
                transition={{
                  duration: 0.35,
                  delay: 0.07 * index,
                  ease: "easeOut",
                }}
                className={`group relative flex min-h-[360px] flex-col overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-200 hover:shadow-[0_16px_48px_rgba(0,0,0,0.45)] ${
                  isCurrent
                    ? "border-[#7C5CFF]/45 bg-gradient-to-b from-[#7C5CFF]/16 to-white/[0.04]"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.16]"
                }`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 0%, rgba(124,92,255,0.14), transparent 45%)",
                  }}
                />
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white/92">
                    {plan.label}
                  </h2>
                  {isCurrent && plan.id === "creator" ? (
                    <CreatorEarlyAccessBadge
                      compact
                      className="!py-1 !px-2.5"
                    />
                  ) : isCurrent ? (
                    <motion.span
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300"
                    >
                      Current
                    </motion.span>
                  ) : null}
                </div>

                <p className="text-2xl font-semibold tracking-tight text-white">
                  {plan.price}
                </p>
                <p className="mt-1 text-sm text-white/50">{plan.description}</p>

                <ul className="mt-4 flex-1 space-y-2">
                  {plan.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-white/75"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF]/70" />
                      {item}
                    </li>
                  ))}
                </ul>

                <motion.button
                  type="button"
                  disabled={
                    isCurrent || isBlocked || isRedirectingPlan !== null
                  }
                  onClick={() => void handleUpgrade(plan.id)}
                  whileHover={
                    isCurrent || isBlocked || isRedirectingPlan !== null
                      ? undefined
                      : { y: -1, scale: 1.01 }
                  }
                  whileTap={
                    isCurrent || isBlocked || isRedirectingPlan !== null
                      ? undefined
                      : { scale: 0.985 }
                  }
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 text-sm font-semibold text-white/85 transition-all duration-200 hover:border-[#7C5CFF]/45 hover:bg-[#7C5CFF]/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isCurrent
                    ? "Current Plan"
                    : isBlocked
                      ? "Included"
                      : isCreatorDowngrade
                        ? "Downgrade to Pro"
                        : isRedirectingPlan === plan.id
                          ? "Redirecting..."
                          : `Upgrade to ${plan.label}`}
                </motion.button>
              </motion.article>
            );
          })}
        </div>

        <AnimatePresence>
          {showDowngradeModal ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={() => setShowDowngradeModal(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Downgrade plan confirmation"
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212]/95 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.6)]"
              >
                <h2 className="text-lg font-semibold tracking-tight text-white/95">
                  Downgrade to Pro?
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  You will lose access to Creator-only benefits:
                </p>

                <ul className="mt-4 space-y-2 text-sm text-white/75">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    Content calendar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    Creator-exclusive workflows
                  </li>
                </ul>

                <div className="mt-6 flex items-center gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setShowDowngradeModal(false)}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition-all duration-150 hover:bg-white/[0.07] hover:text-white"
                  >
                    Keep Creator
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowDowngradeModal(false);
                      void startCheckout("pro");
                    }}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-amber-300/25 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100 transition-all duration-150 hover:bg-amber-500/25"
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
