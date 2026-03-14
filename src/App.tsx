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
import RedirectLoading from "./pages/RedirectLoading";
import Register from "./pages/Register";

export default function App() {
  const { session, isLoading } = useAuth();
  const pathname = window.location.pathname;
  const isAppRoute = pathname === "/app" || pathname === "/dashboard";
  const isLoginRoute = pathname === "/login";
  const isRegisterRoute = pathname === "/register";
  const isForgotPasswordRoute = pathname === "/forgot-password";
  const isAuthRoute = isLoginRoute || isRegisterRoute || isForgotPasswordRoute;
  const shouldRedirectToLogin = !isLoading && isAppRoute && !session;
  const shouldRedirectToApp = !isLoading && isAuthRoute && !!session;

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
      <RedirectLoading
        title="Checking authentication..."
        subtitle="Securing your session before navigation."
      />
    );
  }

  if (shouldRedirectToLogin) {
    return (
      <RedirectLoading
        title="Redirecting to login..."
        subtitle="Please sign in to continue."
      />
    );
  }

  if (shouldRedirectToApp) {
    return (
      <RedirectLoading
        title="Opening your workspace..."
        subtitle="You are already authenticated."
      />
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
