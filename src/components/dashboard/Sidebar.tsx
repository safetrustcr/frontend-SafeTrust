"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ScrollText,
  Users,
  Wallet,
  LogOut,
  Globe,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMultiWallet } from "@/components/auth/wallet/hooks/useMultiWallet";

// Firebase and Store imports per Issue #313
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useGlobalAuthenticationStore } from "@/core/store/data";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/escrow", label: "Escrow", icon: ScrollText },
  {
    href: "/dashboard/escrow-dashboard",
    label: "Escrow Dashboard",
    icon: Shield,
  },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
];

export function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedWallet, disconnectWallet } = useMultiWallet();
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
  const isTestnet = network.toLowerCase() === "testnet";

  // Logout logic per Issue #313
  const handleLogout = async () => {
    await signOut(auth); // Clears Firebase session
    useGlobalAuthenticationStore.getState().clearAuth(); // Clears Zustand/Local storage
    router.push("/login"); // Redirects user
  };

  const handleDisconnect = async () => {
    if (selectedWallet?.walletType) {
      await disconnectWallet(selectedWallet.walletType);
      if (onClose) onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transition-transform duration-300 transform md:translate-x-0 dark:bg-gray-900 dark:border-gray-700",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              <span className="font-bold text-xl tracking-tight">
                SafeTrust
              </span>
            </Link>
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-accent rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-6 px-4 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium dark:bg-gray-800 dark:text-white"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 dark:text-gray-400",
                      isActive
                        ? "text-primary-foreground dark:text-white"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Area */}
          <div className="p-4 border-t space-y-2">
            {/* Network Badge */}
            <div className="flex items-center justify-between px-3 py-2 bg-accent/50 rounded-lg mb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium">Network</span>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  isTestnet
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                )}
              >
                {network}
              </span>
            </div>

            {/* Logout Button per Issue #313 */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>

            {/* Disconnect Button (Existing) */}
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
