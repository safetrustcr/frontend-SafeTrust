"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { UnreadBadge } from "@/components/messages/UnreadBadge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { NAV_ITEMS, isActive } from "./nav-items";
import { navItemClass, navIconClass } from "./nav-item-styles";

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
  // Identity comes from verified Firebase ID token claims, never from a
  // hardcoded mock user or client-controlled storage.
  const { user } = useCurrentUser();

  return (
    <div
      className={cn(
        "fixed top-16 flex h-[calc(100vh-4rem)] flex-col border-r border-border",
        variant === "drawer"
          ? cn("left-0 w-64 md:hidden transform bg-background", isOpen ? "translate-x-0" : "-translate-x-full")
          : "hidden md:flex md:w-16 lg:w-48 left-0 bg-background/80 backdrop-blur-md supports-[not(backdrop-filter:blur(0))]:bg-background dark:bg-slate-950/90",
        className,
      )}
    >
      <div className="flex flex-1 flex-col overflow-y-auto scrollbar-scroball">
        <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={navItemClass(active)}
              >
                <Icon className={navIconClass(active)} aria-hidden="true" />
                <span className="md:hidden lg:block">{item.label}</span>
                <span className="absolute left-14 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md md:group-hover:block lg:group-hover:hidden">
                  {item.label}
                </span>
                {item.badge === "messages" && user?.uid && (
                  <UnreadBadge userId={user.uid} />
                )}
                {item.badge === "notifications" && notificationCount > 0 && (
                  <span className="ml-auto rounded-full bg-destructive px-1.5 text-xs text-white">
                    {notificationCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto w-full px-2 pb-4 pt-4 lg:px-4">
        <LogoutButton />
      </div>
    </div>
  );
}
