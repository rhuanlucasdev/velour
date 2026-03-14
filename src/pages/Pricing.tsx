import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPlan, plans, type PlanId } from "../lib/plans";
import { useIdeaStore } from "../store/ideaStore";
import { toast } from "../utils/toast";

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

  const handleUpgrade = async (plan: PlanId) => {
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
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
            <span className="rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/12 px-3 py-1 text-xs font-medium text-[#d2c7ff]">
              Velour Plan
            </span>
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
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-wide text-white/40">
                Ideas used
              </p>
              <p className="mt-1 text-xl font-semibold text-white/90">
                {isLoadingIdeas
                  ? "..."
                  : `${Math.min(ideas.length, ideasLimit)}/${ideasLimit}`}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-wide text-white/40">
                Hooks generated
              </p>
              <p className="mt-1 text-xl font-semibold text-white/90">
                {isLoadingIdeas ? "..." : hooksGenerated}
              </p>
            </div>
          </motion.div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {planCards.map((plan, index) => {
            const isCurrent = plan.id === userPlan;
            const isBlocked = plan.id === "free";

            return (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: 0.07 * index,
                  ease: "easeOut",
                }}
                className={`group rounded-2xl border p-5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.45)] ${
                  isCurrent
                    ? "border-[#7C5CFF]/45 bg-gradient-to-b from-[#7C5CFF]/16 to-white/[0.04]"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.16]"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white/92">
                    {plan.label}
                  </h2>
                  {isCurrent ? (
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                      Current
                    </span>
                  ) : null}
                </div>

                <p className="text-2xl font-semibold tracking-tight text-white">
                  {plan.price}
                </p>
                <p className="mt-1 text-sm text-white/50">{plan.description}</p>

                <ul className="mt-4 space-y-2">
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

                <button
                  type="button"
                  disabled={
                    isCurrent || isBlocked || isRedirectingPlan !== null
                  }
                  onClick={() => void handleUpgrade(plan.id)}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white/85 transition-all duration-200 hover:border-[#7C5CFF]/45 hover:bg-[#7C5CFF]/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {isCurrent
                    ? "Current Plan"
                    : isBlocked
                      ? "Included"
                      : isRedirectingPlan === plan.id
                        ? "Redirecting..."
                        : `Upgrade to ${plan.label}`}
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
