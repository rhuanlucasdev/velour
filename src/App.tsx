import AppLayout from "./components/AppLayout";
import CommandPalette from "./components/command/CommandPalette";
import Dashboard from "./components/Dashboard";
import ToastProvider from "./components/ui/ToastProvider";

export default function App() {
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
