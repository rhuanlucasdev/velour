import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUpgradeStore } from "../../store/upgradeStore";
import { toast } from "../../utils/toast";

export default function UpgradeModal() {
  const { user } = useAuth();
  const isOpen = useUpgradeStore((state) => state.isOpen);
  const closeUpgradeModal = useUpgradeStore((state) => state.closeUpgradeModal);
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleUpgrade = async () => {
    if (!user?.id) {
      toast("You need to be logged in to upgrade", { type: "error" });
      return;
    }

    try {
      setIsRedirecting(true);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
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
      setIsRedirecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={closeUpgradeModal}
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Velour Pro"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212]/95 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.6)]"
      >
        <h2 className="text-xl font-semibold tracking-tight text-white/95">
          Upgrade to Velour Pro
        </h2>

        <ul className="mt-4 space-y-2 text-sm text-white/70">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />
            Unlimited ideas
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />
            All hook templates
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />
            Export features
          </li>
        </ul>

        <button
          type="button"
          onClick={() => void handleUpgrade()}
          disabled={isRedirecting}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#6B4EE0] hover:shadow-[0_0_24px_rgba(124,92,255,0.32)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRedirecting ? "Redirecting..." : "Upgrade with Stripe"}
        </button>

        <button
          type="button"
          onClick={closeUpgradeModal}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition-all duration-150 hover:bg-white/[0.07] hover:text-white"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
