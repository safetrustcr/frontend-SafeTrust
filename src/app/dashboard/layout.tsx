"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { SideBar } from "@/components/layouts/SideBar";
import { Header } from "@/components/layouts/Header";
import type { ReactNode } from "react";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/dashboard/hotel",
  "/dashboard/hotel/payment",
  "/dashboard/hotel/details",
  "/dashboard/hotel/search",
  "/dashboard/hotel/escrow",
  "/dashboard/hotel/create-escrow",
];

// Routes that match patterns (for dynamic routes)
const PUBLIC_ROUTE_PATTERNS = [
  /^\/dashboard\/hotel\/booking\/.+\/escrow$/,
];

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
        const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
        const matchesPublicPattern = PUBLIC_ROUTE_PATTERNS.some((pattern) =>
          pattern.test(pathname)
        );
        const isPublic = isPublicRoute || matchesPublicPattern;

        // Check for wallet in localStorage as fallback (for Trustless Work wallet)
        const hasWalletInStorage = 
          localStorage.getItem("walletAddress") || 
          localStorage.getItem("address-wallet");

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state only for protected routes that failed authentication
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const matchesPublicPattern = PUBLIC_ROUTE_PATTERNS.some((pattern) =>
    pattern.test(pathname)
  );
  const isPublic = isPublicRoute || matchesPublicPattern;

  if (isAuthError && !isPublic) {
    return null;
  }

  return (
    <div className="flex h-full bg-gray-100">
      <Header />
      <SideBar notificationCount={1} />
      <main className="flex-1 p-2 pt-16 md:px-10 md:pb-10 md:ml-48 bg-gray-100">
        {children}
      </main>
    </div>
  );
};


export default Layout;
