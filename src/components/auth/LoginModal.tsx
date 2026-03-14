import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<"google" | "github" | null>(
    null,
  );

  if (!isOpen) {
    return null;
  }

  const handleLogin = async (provider: "google" | "github") => {
    try {
      setIsSubmitting(provider);
      await login(provider);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212]/95 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white/95">
              Continue to Velour
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Sign in to access your creator dashboard.
            </p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/60 transition-colors hover:text-white"
            >
              Close
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => void handleLogin("google")}
            disabled={isSubmitting !== null}
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting === "google" ? "Redirecting..." : "Login with Google"}
          </button>

          <button
            type="button"
            onClick={() => void handleLogin("github")}
            disabled={isSubmitting !== null}
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting === "github" ? "Redirecting..." : "Login with GitHub"}
          </button>
        </div>
      </div>
    </div>
  );
}
