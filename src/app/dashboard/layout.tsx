"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SideBar } from "@/components/layouts/SideBar";
import { Header } from "@/components/layouts/Header";
import type { ReactNode } from "react";

// Route protection lives in `middleware.ts`, which gates `/dashboard/*` and
// `/guest/*` on the `firebase-token` cookie. The client "auth check" that used
// to live here computed `isPublic` and `hasWalletInStorage` and then discarded
// both — its only visible effect was a full-screen spinner on first render.
const Layout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
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

      <main className={`flex-1 transition-all duration-300 ${pathname !== "/dashboard/profile" ? "md:ml-16 lg:ml-48" : ""}`}>
        <div className={`w-full h-full ${pathname !== "/dashboard/profile" ? "p-4 md:p-8 lg:p-10" : "p-4 md:p-6"}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
