import { motion } from "framer-motion";
import Button from "../ui/Button";

interface EmptyStateProps {
  onCreate: () => void;
}

export default function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex min-h-[58vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28 }}
        className="mx-auto w-full max-w-[560px] rounded-2xl border border-white/[0.08] bg-[#121212] px-8 py-10 text-center shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1C1C1C] text-[#7C5CFF]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M11 4v14M4 11h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2 className="text-[22px] font-semibold tracking-tight text-white/90">
          No ideas yet
        </h2>
        <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-relaxed text-white/45">
          Start your first idea and craft viral hooks!
        </p>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onCreate}
          className="group mt-7 rounded-lg px-4 hover:scale-[1.03] hover:shadow-[0_0_22px_rgba(124,92,255,0.4)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Create New Idea
        </Button>
      </motion.div>
    </div>
  );
}
