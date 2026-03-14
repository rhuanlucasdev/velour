import { useEffect, useState } from "react";
import AppLayout from "./components/AppLayout";
import LoginModal from "./components/auth/LoginModal";
import UpgradeModal from "./components/billing/UpgradeModal";
import CommandPalette from "./components/command/CommandPalette";
import Dashboard from "./components/Dashboard";
import ToastProvider from "./components/ui/ToastProvider";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";

export default function App() {
  const { session, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = window.location.pathname;
  const isAppRoute = pathname === "/app" || pathname === "/dashboard";

  useEffect(() => {
    if (!isLoading && session) {
      setIsLoginModalOpen(false);
      return;
    }

    if (!isLoading && isAppRoute && !session) {
      window.history.replaceState({}, "", "/");
      setIsLoginModalOpen(true);
    }
  }, [isAppRoute, isLoading, session]);

  if (isAppRoute && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-sm text-white/70">
        Loading authentication...
      </div>
    );
  }

  if (isAppRoute && !session) {
    return (
      <>
        <LandingPage />
        <LoginModal isOpen={true} onClose={() => setIsLoginModalOpen(false)} />
      </>
    );
  }

  if (pathname === "/" || pathname === "/landing") {
    return (
      <>
        <LandingPage />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  if (!isAppRoute) {
    return (
      <>
        <LandingPage />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <AppLayout>
        <Dashboard />
      </AppLayout>
      <CommandPalette />
      <UpgradeModal />
      <ToastProvider />
    </>
  );
}
