import { motion } from "framer-motion";
import GridBackground from "../components/ui/GridBackground";

interface RedirectLoadingProps {
  title?: string;
  subtitle?: string;
}

export default function RedirectLoading({
  title = "Redirecting...",
  subtitle = "Taking you to the next page.",
}: RedirectLoadingProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 py-12 text-white">
      <GridBackground />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(124,92,255,0.2), transparent 40%)",
        }}
      />

      <motion.main
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, rgba(139,92,246,0.2), transparent 45%)",
          }}
        />

        <div className="relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-7 w-7 rounded-full border-2 border-[#7C5CFF]/25 border-t-[#7C5CFF]"
            />
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-tight text-white/95">
            {title}
          </h1>
          <p className="mt-2 text-sm text-white/55">{subtitle}</p>
        </div>
      </motion.main>
    </div>
  );
}
