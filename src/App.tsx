import AppLayout from "./components/AppLayout";
import CommandPalette from "./components/command/CommandPalette";
import Dashboard from "./components/Dashboard";

export default function App() {
  return (
    <>
      <AppLayout>
        <Dashboard />
      </AppLayout>
      <CommandPalette />
    </>
  );
}
