import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import GridBackground from "../components/ui/GridBackground";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSuccessMessage(
        "Password reset email sent. Check your inbox for the recovery link.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send reset email. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, rgba(139,92,246,0.22), transparent 45%)",
          }}
        />

        <Link
          to="/login"
          className="group relative inline-flex items-center gap-1 text-sm text-white/60 transition-all duration-200 hover:-translate-x-0.5 hover:text-white"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
            ←
          </span>
          <span>Back</span>
          <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 group-hover:scale-x-100" />
        </Link>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white/95">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Enter your account email and we will send a recovery link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm text-white/75"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/35 focus:border-[#7C5CFF]/80 focus:ring-2 focus:ring-[#7C5CFF]/25"
              placeholder="you@example.com"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:bg-[#6B4EE0] hover:shadow-[0_0_20px_rgba(124,92,255,0.36)] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting ? "Sending..." : "Send recovery email"}
          </button>
        </form>
      </motion.main>
    </div>
  );
}
