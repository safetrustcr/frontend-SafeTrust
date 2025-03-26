"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { SideBar } from "@/components/layouts/SideBar";
import { Header } from "@/components/layouts/Header";
import type { ReactNode } from 'react';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/dashboard/hotel/payment",
  "/dashboard/hotel/details",
  "/dashboard/hotel/search",
];

const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const address = useGlobalAuthenticationStore((state) => state.address);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route);
        
        // Only redirect if not authenticated and trying to access a protected route
        if (!address && !isPublicRoute) {
          router.push("/");
          setIsAuthError(true);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthError(true);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [address, pathname, router]);

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
  if (isAuthError && !PUBLIC_ROUTES.some(route => pathname === route)) {
    return null;
  }

  // Always show dashboard layout, regardless of route type
  return (
    <div className="flex h-full bg-gray-100">
      <Header />
      <SideBar notificationCount={1} />
      <main className="flex-1 p-2 pt-16 md:p-10 md:ml-48 bg-gray-100">
        {children}
      </main>
    </div>
  );
};

export default Layout;
