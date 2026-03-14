import { useAuth } from "../../context/AuthContext";

export default function AuthButtons() {
  const { session } = useAuth();

  if (session) {
    return (
      <a
        href="/app"
        className="rounded-lg border border-white/[0.12] bg-[#151515] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-200 hover:border-[#7C5CFF]/60 hover:text-white hover:shadow-[0_0_18px_rgba(124,92,255,0.28)]"
      >
        Open App
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/login"
        className="rounded-lg border border-white/[0.12] bg-[#151515] px-4 py-2 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white/[0.24] hover:text-white"
      >
        Login
      </a>
      <a
        href="/register"
        className="rounded-lg border border-transparent bg-[#7C5CFF] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6B4EE0] hover:shadow-[0_0_18px_rgba(124,92,255,0.32)]"
      >
        Register
      </a>
    </div>
  );
}
