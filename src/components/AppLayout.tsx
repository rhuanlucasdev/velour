import React from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0A]">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.08) 0.8px, transparent 0.8px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(124,92,255,0.11) 0 1px, transparent 1px 14px)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 20% 0%, rgba(124,92,255,0.16), transparent 38%), radial-gradient(circle at 100% 100%, rgba(67,56,202,0.12), transparent 35%)",
            }}
          />
        </div>

        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
