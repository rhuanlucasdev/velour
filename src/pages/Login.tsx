import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import GridBackground from "../components/ui/GridBackground";
import { useAuth } from "../context/AuthContext";
import RedirectLoading from "./RedirectLoading";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M21.805 10.023H12v3.954h5.625c-.242 1.27-.967 2.345-2.06 3.067v2.545h3.334c1.952-1.798 3.081-4.45 3.081-7.589 0-.664-.06-1.301-.175-1.977Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.89 6.619-2.411l-3.334-2.545c-.927.621-2.11.988-3.285.988-2.525 0-4.663-1.705-5.429-3.995H3.13v2.624A9.996 9.996 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.571 14.037A5.998 5.998 0 0 1 6.26 12c0-.708.122-1.392.311-2.037V7.34H3.13A9.996 9.996 0 0 0 2 12c0 1.611.383 3.136 1.13 4.66l3.441-2.623Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.968c1.469 0 2.788.506 3.827 1.5l2.87-2.87C16.957 2.978 14.693 2 12 2A9.996 9.996 0 0 0 3.13 7.34l3.441 2.624C7.337 7.673 9.475 5.968 12 5.968Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M12 .5C5.648.5.5 5.648.5 12a11.5 11.5 0 0 0 7.863 10.908c.575.106.787-.25.787-.556 0-.275-.01-1.005-.016-1.973-3.2.695-3.876-1.542-3.876-1.542-.524-1.332-1.28-1.687-1.28-1.687-1.046-.715.08-.7.08-.7 1.157.08 1.765 1.188 1.765 1.188 1.028 1.762 2.697 1.252 3.354.958.104-.745.402-1.252.73-1.54-2.554-.29-5.238-1.277-5.238-5.684 0-1.255.448-2.282 1.183-3.085-.119-.29-.513-1.458.112-3.04 0 0 .965-.31 3.163 1.178a11.02 11.02 0 0 1 5.758 0c2.196-1.488 3.16-1.178 3.16-1.178.627 1.582.233 2.75.114 3.04.737.803 1.181 1.83 1.181 3.085 0 4.418-2.689 5.39-5.252 5.674.413.355.78 1.055.78 2.127 0 1.536-.014 2.774-.014 3.151 0 .308.208.668.793.554A11.5 11.5 0 0 0 23.5 12C23.5 5.648 18.352.5 12 .5Z" />
    </svg>
  );
}

export default function Login() {
  const { login, loginWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState<
    "google" | "github" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await loginWithPassword(email.trim(), password);
      setIsRedirecting(true);
      window.location.replace("/app");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setErrorMessage(null);
    setOauthSubmitting(provider);

    try {
      await login(provider);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start OAuth login. Please try again.";
      setErrorMessage(message);
      setOauthSubmitting(null);
    }
  };

  if (isRedirecting) {
    return (
      <RedirectLoading
        title="Login successful"
        subtitle="Taking you to your dashboard."
      />
    );
  }

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

        <a
          href="/"
          className="group relative inline-flex items-center gap-1 text-sm text-white/60 transition-all duration-200 hover:-translate-x-0.5 hover:text-white"
        >
          <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
            ←
          </span>
          <span>Back</span>
          <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white/60 transition-transform duration-300 group-hover:scale-x-100" />
        </a>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white/95">
          Login to Velour
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Continue with email and password to access your dashboard.
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

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm text-white/75"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/35 focus:border-[#7C5CFF]/80 focus:ring-2 focus:ring-[#7C5CFF]/25"
              placeholder="••••••••"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || oauthSubmitting !== null}
            className="inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:bg-[#6B4EE0] hover:shadow-[0_0_20px_rgba(124,92,255,0.36)] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-white/35">
          <span className="h-px flex-1 bg-white/10" />
          or continue with
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void handleOAuth("google")}
            disabled={isSubmitting || oauthSubmitting !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 transition-all duration-200 hover:scale-[1.01] hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            {oauthSubmitting === "google" ? "Redirecting..." : "Google"}
          </button>

          <button
            type="button"
            onClick={() => void handleOAuth("github")}
            disabled={isSubmitting || oauthSubmitting !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 transition-all duration-200 hover:scale-[1.01] hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GitHubIcon />
            {oauthSubmitting === "github" ? "Redirecting..." : "GitHub"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm">
          <a
            href="/forgot-password"
            className="text-white/65 transition-colors hover:text-white"
          >
            Forgot password?
          </a>
          <p className="text-white/55">
            No account?{" "}
            <a
              href="/register"
              className="font-medium text-[#B8A6FF] hover:text-white"
            >
              Register
            </a>
          </p>
        </div>
      </motion.main>
    </div>
  );
}
