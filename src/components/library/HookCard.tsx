import { motion } from "framer-motion";

export interface LibraryHookItem {
  id: string;
  hook_text: string;
  category: string;
  likes: number;
  copies: number;
  created_at: string;
  created_by: string;
}

interface HookCardProps {
  hook: LibraryHookItem;
  onCopy: (hook: LibraryHookItem) => Promise<void>;
  isCopying?: boolean;
}

export default function HookCard({
  hook,
  onCopy,
  isCopying = false,
}: HookCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl transition-all duration-200 hover:border-[#7C5CFF]/28 hover:shadow-[0_16px_36px_rgba(0,0,0,0.4),0_0_20px_rgba(124,92,255,0.18)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 18% 0%, rgba(124,92,255,0.16), transparent 45%)",
        }}
      />

      <div className="relative z-10">
        <p className="text-sm leading-relaxed text-white/90">
          {hook.hook_text}
        </p>

        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2 text-xs text-white/55">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 13.5s-4.5-2.7-4.5-6.2A2.8 2.8 0 0 1 8 5.1a2.8 2.8 0 0 1 4.5 2.2c0 3.5-4.5 6.2-4.5 6.2Z"
                  stroke="currentColor"
                  strokeOpacity="0.8"
                  strokeWidth="1.1"
                  fill="none"
                />
              </svg>
              {hook.likes}
            </span>
            <span className="text-white/35">{hook.category}</span>
          </div>

          <button
            type="button"
            onClick={() => void onCopy(hook)}
            disabled={isCopying}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 transition-all duration-150 hover:border-[#7C5CFF]/38 hover:bg-[#7C5CFF]/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="2"
                width="8"
                height="10"
                rx="1.5"
                stroke="currentColor"
                strokeOpacity="0.85"
                strokeWidth="1.1"
              />
              <rect
                x="3"
                y="4"
                width="8"
                height="10"
                rx="1.5"
                stroke="currentColor"
                strokeOpacity="0.55"
                strokeWidth="1.1"
              />
            </svg>
            {isCopying ? "Copying..." : "Copy"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
