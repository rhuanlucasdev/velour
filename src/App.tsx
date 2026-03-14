import { useEffect } from "react";
import AppLayout from "./components/AppLayout";
import UpgradeModal from "./components/billing/UpgradeModal";
import CommandPalette from "./components/command/CommandPalette";
import Dashboard from "./components/Dashboard";
import ToastProvider from "./components/ui/ToastProvider";
import { useAuth } from "./context/AuthContext";
import ForgotPassword from "./pages/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const { session, isLoading } = useAuth();
  const pathname = window.location.pathname;
  const isAppRoute = pathname === "/app" || pathname === "/dashboard";
  const isLoginRoute = pathname === "/login";
  const isRegisterRoute = pathname === "/register";
  const isForgotPasswordRoute = pathname === "/forgot-password";
  const isAuthRoute = isLoginRoute || isRegisterRoute || isForgotPasswordRoute;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAppRoute && !session) {
      window.location.replace("/login");
      return;
    }

    if (isAuthRoute && session) {
      window.location.replace("/app");
    }
  }, [isAppRoute, isAuthRoute, isLoading, session]);

  if (isLoading && (isAppRoute || isAuthRoute)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-sm text-white/70">
        Loading authentication...
      </div>
    );
  }

  if (isLoginRoute) {
    return <Login />;
  }

  if (isRegisterRoute) {
    return <Register />;
  }

  if (isForgotPasswordRoute) {
    return <ForgotPassword />;
  }

  if (isAppRoute && !session) {
    return null;
  }

  if (!isAppRoute) {
    return <LandingPage />;
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
