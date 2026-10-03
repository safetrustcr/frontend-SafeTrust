"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { UnreadBadge } from "@/components/messages/UnreadBadge";
import { NAV_ITEMS, isActive } from "./nav-items";

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
  const user = { uid: "mock-guest-1" };

  return (
    <div
      className={cn(
        "fixed top-16 flex flex-col h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300 z-40 dark:bg-gray-900 dark:border-gray-700",
        variant === "drawer"
          ? cn(
              "left-0 w-64 md:hidden transform",
              isOpen ? "translate-x-0" : "-translate-x-full",
            )
          : "hidden md:flex md:w-16 lg:w-48 left-0",
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
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-lg p-2 transition-colors duration-200 hover:bg-accent dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
                  active && "bg-accent",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="md:hidden lg:block">{item.label}</span>
                <span className="absolute left-14 z-50 hidden whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md md:group-hover:block lg:group-hover:hidden">
                  {item.label}
                </span>
                {item.badge === "messages" && <UnreadBadge userId={user.uid} />}
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
