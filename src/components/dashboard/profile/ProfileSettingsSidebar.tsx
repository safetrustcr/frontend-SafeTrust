"use client";

import { Home, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItemClass, navIconClass } from "@/components/layouts/nav-item-styles";

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
    <nav className="w-44 shrink-0 border-r border-border p-6">
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
                    aria-current={isActive ? "page" : undefined}
                    className={navItemClass(isActive)}
                  >
                    <Icon className={navIconClass(isActive)} aria-hidden="true" />
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
