import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AppLayout from "./components/AppLayout";
import UpgradeModal from "./components/billing/UpgradeModal";
import CommandPalette from "./components/command/CommandPalette";
import Dashboard from "./components/Dashboard";
import ToastProvider from "./components/ui/ToastProvider";
import { useAuth } from "./context/AuthContext";
import Calendar from "./pages/Calendar";
import ForgotPassword from "./pages/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import RedirectLoading from "./pages/RedirectLoading";
import Register from "./pages/Register";

export default function App() {
  const { session, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isProfileRoute = pathname === "/profile";
  const isPricingRoute = pathname === "/pricing";
  const isCalendarRoute = pathname === "/calendar";
  const isAppRoute =
    pathname === "/app" ||
    pathname === "/dashboard" ||
    isProfileRoute ||
    isPricingRoute ||
    isCalendarRoute;
  const isLoginRoute = pathname === "/login";
  const isRegisterRoute = pathname === "/register";
  const isForgotPasswordRoute = pathname === "/forgot-password";
  const isLogoutRoute = pathname === "/logout";
  const isAuthRoute =
    isLoginRoute || isRegisterRoute || isForgotPasswordRoute || isLogoutRoute;
  const isGuestAuthRoute =
    isLoginRoute || isRegisterRoute || isForgotPasswordRoute;
  const shouldRedirectToLogin = !isLoading && isAppRoute && !session;
  const shouldRedirectToApp = !isLoading && isGuestAuthRoute && !!session;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAppRoute && !session) {
      const timeout = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 120);

      return () => clearTimeout(timeout);
    }

    if (isGuestAuthRoute && session) {
      const timeout = setTimeout(() => {
        navigate("/app", { replace: true });
      }, 120);

      return () => clearTimeout(timeout);
    }

    return;
  }, [isAppRoute, isGuestAuthRoute, isLoading, navigate, session]);

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

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={session ? <Navigate to="/app" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={session ? <Navigate to="/app" replace /> : <Register />}
      />
      <Route
        path="/forgot-password"
        element={session ? <Navigate to="/app" replace /> : <ForgotPassword />}
      />
      <Route path="/logout" element={<Logout />} />
      <Route
        path="/profile"
        element={
          session ? (
            <>
              <AppLayout>
                <Profile />
              </AppLayout>
              <ToastProvider />
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/pricing"
        element={
          session ? (
            <>
              <AppLayout>
                <Pricing />
              </AppLayout>
              <UpgradeModal />
              <ToastProvider />
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/calendar"
        element={
          session ? (
            <>
              <AppLayout>
                <Calendar />
              </AppLayout>
              <CommandPalette />
              <UpgradeModal />
              <ToastProvider />
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/app"
        element={
          session ? (
            <>
              <AppLayout>
                <Dashboard />
              </AppLayout>
              <CommandPalette />
              <UpgradeModal />
              <ToastProvider />
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          session ? (
            <>
              <AppLayout>
                <Dashboard />
              </AppLayout>
              <CommandPalette />
              <UpgradeModal />
              <ToastProvider />
            </>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
