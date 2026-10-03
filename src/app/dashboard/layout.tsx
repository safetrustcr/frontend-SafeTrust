"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { SideBar } from "@/components/layouts/SideBar";
import { Header } from "@/components/layouts/Header";
import { WalletProviderScoped } from "@/providers/WalletProviderScoped";
import type { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const address = useGlobalAuthenticationStore((state) => state.address);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthError, setIsAuthError] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthError(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [address, pathname, router]);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (isAuthError) {
    return null;
  }

  return (
    // WalletProviderScoped scopes stellar-wallets-kit to the dashboard
    // subtree only, keeping it out of public-browse route bundles.
    <WalletProviderScoped>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        {pathname !== "/dashboard/profile" && (
          <SideBar
            variant="drawer"
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Desktop Permanent Sidebar */}
        {pathname !== "/dashboard/profile" && (
          <SideBar variant="permanent" notificationCount={1} />
        )}

        <main
          className={`flex-1 transition-all duration-300 ${
            pathname !== "/dashboard/profile" ? "md:ml-16 lg:ml-48" : ""
          }`}
        >
          <div
            className={`w-full h-full ${
              pathname !== "/dashboard/profile"
                ? "p-4 md:p-8 lg:p-10"
                : "p-4 md:p-6"
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </WalletProviderScoped>
  );
};

export default Layout;
