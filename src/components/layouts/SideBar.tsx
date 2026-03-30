"use client";

import { cn } from "@/lib/utils";
import { Bell, Heart, Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideBarProps {
  className?: string;
  notificationCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: "drawer" | "permanent";
}

export function SideBar({
  className,
  notificationCount = 0,
  isOpen,
  onClose,
  variant = "permanent",
}: SideBarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed top-16 flex flex-col h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300 z-40",
        variant === "drawer"
          ? cn(
              "left-0 w-64 md:hidden transform",
              isOpen ? "translate-x-0" : "-translate-x-full",
            )
          : "hidden md:flex md:w-16 lg:w-48 left-0",
        className,
      )}
    >
      <div className="flex flex-col items-start gap-4 py-4 px-2 lg:px-4">
        <Link
          href="/dashboard/escrow"
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 w-full",
            pathname === "/dashboard/escrow"
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent",
          )}
        >
          <Shield className="w-6 h-6" />
          <span>Escrows</span>
        </Link>
        <Link
          href="/dashboard/escrow-dashboard"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors duration-200 w-full group relative",
            pathname === "/dashboard/escrow-dashboard" && "bg-accent font-medium",
          )}
        >
          <Shield className="w-6 h-6" />
          <span className="md:hidden lg:block">Escrow Dashboard</span>
          <span className="hidden md:group-hover:block lg:group-hover:hidden absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded shadow-md text-xs z-50 whitespace-nowrap">
            Escrow Dashboard
          </span>
        </Link>
        <Link
          href="/notifications"
          onClick={onClose}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors duration-200 w-full relative group"
        >
          <Bell className="w-6 h-6 shrink-0" />
          <span className="md:hidden lg:block">Notifications</span>
          {notificationCount > 0 && (
            <div className="absolute right-2 bg-blue-500 text-white rounded-full min-w-[18px] h-4.5 flex items-center justify-center text-[10px] font-bold px-1">
              {notificationCount}
            </div>
          )}
          {/* Tooltip for rail mode */}
          <span className="hidden md:group-hover:block lg:group-hover:hidden absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded shadow-md text-xs z-50 whitespace-nowrap">
            Notifications
          </span>
        </Link>
        <Link
          href="/favorites"
          onClick={onClose}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors duration-200 w-full group relative"
        >
          <Heart className="w-6 h-6 shrink-0" />
          <span className="md:hidden lg:block">Favorite</span>
          {/* Tooltip for rail mode */}
          <span className="hidden md:group-hover:block lg:group-hover:hidden absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded shadow-md text-xs z-50 whitespace-nowrap">
            Favorite
          </span>
        </Link>
        <Link
          href="/dashboard/users"
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors duration-200 w-full",
            pathname === "/dashboard/users" && "bg-accent font-medium",
          )}
        >
          <Users className="w-6 h-6" />
          <span>Users</span>
        </Link>
      </div>
    </div>
  );
}
