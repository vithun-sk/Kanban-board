import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import { useApp } from "@/context/AppContext";
import { isDemoMode } from "@/config/env";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { apiError } = useApp();

  return (
    <div className="flex min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        {isDemoMode() ? (
          <div className="bg-[var(--primary-container)] px-4 py-2 text-center text-xs text-[var(--on-primary-container)] sm:text-sm">
            Demo workspace — changes are saved in this browser only and are not sent to a server.
          </div>
        ) : null}
        {apiError ? (
          <div
            role="alert"
            className="flex items-start gap-2 bg-[var(--error-container)] px-4 py-2 text-sm text-[var(--on-error-container)]"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{apiError}</span>
          </div>
        ) : null}
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
