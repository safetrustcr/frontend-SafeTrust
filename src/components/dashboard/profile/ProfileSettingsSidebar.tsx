"use client";

import { cn } from "@/lib/utils";
import { Home, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_LINKS = [
  {
    section: "General",
    items: [{ label: "Account", href: "/dashboard/profile", icon: User }],
  },
  {
    section: "Other",
    items: [
      { label: "Apartments", href: "/dashboard/apartments", icon: Home },
      {
        label: "Offers",
        href: "/dashboard/apartments/offers",
        icon: Users,
      },
    ],
  },
];

export function ProfileSettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-44 shrink-0 border-r border-gray-200 dark:border-gray-700 p-6">
      {SIDEBAR_LINKS.map((group) => (
        <div key={group.section} className="mb-6">
          <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2 px-2">
            {group.section}
          </p>
          <ul className="space-y-1">
            {group.items.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-orange-50 text-orange-600 font-medium dark:bg-orange-950/30 dark:text-orange-400"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-orange-500" : "")} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
