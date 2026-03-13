import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import {
  useToastStore,
  type ToastItem,
  type ToastType,
} from "../../store/toastStore";

// ── icons ────────────────────────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  );
}

// ── type config ───────────────────────────────────────────────────────────────

const typeConfig: Record<
  ToastType,
  {
    iconWrapper: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    iconWrapper: "bg-emerald-500/15 text-emerald-400",
    border: "border-emerald-500/20",
    icon: <SuccessIcon />,
  },
  error: {
    iconWrapper: "bg-red-500/15 text-red-400",
    border: "border-red-500/20",
    icon: <ErrorIcon />,
  },
  info: {
    iconWrapper: "bg-[#7C5CFF]/15 text-[#9B80FF]",
    border: "border-[#7C5CFF]/20",
    icon: <InfoIcon />,
  },
};

// ── single toast ──────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 4000;

function Toast({ id, message, type }: ToastItem) {
  const removeToast = useToastStore((state) => state.removeToast);
  const config = typeConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 rounded-xl border bg-[#1A1A1A]/95 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm ${config.border}`}
    >
      {/* icon badge */}
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${config.iconWrapper}`}
      >
        {config.icon}
      </span>

      {/* message */}
      <p className="text-[13px] font-medium leading-snug text-white/85">
        {message}
      </p>

      {/* dismiss button */}
      <button
        type="button"
        onClick={() => removeToast(id)}
        aria-label="Dismiss notification"
        className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/60"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="11" y2="11" />
          <line x1="11" y1="1" x2="1" y2="11" />
        </svg>
      </button>
    </motion.div>
  );
}

// ── provider (stack) ───────────────────────────────────────────────────────────

export default function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
