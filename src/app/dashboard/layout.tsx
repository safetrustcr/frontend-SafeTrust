"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SideBar } from "@/components/layouts/SideBar";
import { Header } from "@/components/layouts/Header";
import { WalletProviderScoped } from "@/providers/WalletProviderScoped";
import type { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
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
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 text-center max-w-md p-6">
          <h1 className="text-2xl font-bold text-destructive">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">
            Failed to load authentication data. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <WalletProviderScoped>
      <div className="flex h-screen bg-background">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {pathname !== "/dashboard/profile" && (
          <>
            <SideBar
              variant="drawer"
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <SideBar variant="permanent" notificationCount={1} />
          </>
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
