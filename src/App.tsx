import AppLayout from "./components/AppLayout";
import CommandPalette from "./components/command/CommandPalette";
import Dashboard from "./components/Dashboard";
import ToastProvider from "./components/ui/ToastProvider";
import LandingPage from "./pages/LandingPage";

export default function App() {
  if (window.location.pathname === "/landing") {
    return <LandingPage />;
  }

  return (
    <>
      <AppLayout>
        <Dashboard />
      </AppLayout>
      <CommandPalette />
      <ToastProvider />
    </>
  );
}
