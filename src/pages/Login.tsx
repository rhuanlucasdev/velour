import { useState, type FormEvent } from "react";
import GridBackground from "../components/ui/GridBackground";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loginWithPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState<
    "google" | "github" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await loginWithPassword(email.trim(), password);
      window.location.href = "/app";
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

      <main className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <a
          href="/"
          className="text-sm text-white/60 transition-colors hover:text-white"
        >
          ← Back to landing
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
            className="inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-[#7C5CFF] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6B4EE0] hover:shadow-[0_0_20px_rgba(124,92,255,0.36)] disabled:cursor-not-allowed disabled:opacity-65"
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
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {oauthSubmitting === "google" ? "Redirecting..." : "Google"}
          </button>

          <button
            type="button"
            onClick={() => void handleOAuth("github")}
            disabled={isSubmitting || oauthSubmitting !== null}
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
          >
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
      </main>
    </div>
  );
}
