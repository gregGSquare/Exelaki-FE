import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
      {/* Off-canvas menu for mobile */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Static sidebar for desktop */}
      <div className="md:pl-64">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="py-4 px-3 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;


