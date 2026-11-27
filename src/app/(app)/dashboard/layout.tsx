"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SideBar } from "@/components/layouts/SideBar";
import { Header } from "@/components/layouts/Header";
import { WalletProviderScoped } from "@/providers/WalletProviderScoped";
import { LazyMotionProvider } from "@/components/ui/LazyMotionProvider";
import { DashboardReveal } from "@/components/dashboard/ui/DashboardReveal";
import "@/components/dashboard/ui/dashboard-glass.css";
import type { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isProfileSettingsPage = pathname.startsWith("/dashboard/profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <WalletProviderScoped>
      <LazyMotionProvider>
        <div className="dashboard-shell flex min-h-dvh">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {!isProfileSettingsPage && (
            <>
              <SideBar
                variant="drawer"
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
              <SideBar variant="permanent" />
            </>
          )}

          <main
            className={`min-w-0 flex-1 pt-16 ${
              !isProfileSettingsPage ? "md:ml-16 lg:ml-48" : ""
            }`}
          >
            <div
              className={`w-full min-w-0 ${
                !isProfileSettingsPage ? "p-4 md:p-8 lg:p-10" : "p-4 md:p-6"
              }`}
            >
              <DashboardReveal key={pathname}>{children}</DashboardReveal>
            </div>
          </main>
        </div>
      </LazyMotionProvider>
    </WalletProviderScoped>
  );
};

export default Layout;
