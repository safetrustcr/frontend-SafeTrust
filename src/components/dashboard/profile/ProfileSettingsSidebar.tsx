"use client";

import {
  navIconClass,
  navItemClass,
} from "@/components/layouts/nav-item-styles";
import { Home, User, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const OFFERS_ROUTE = /^\/dashboard\/apartments\/([^/]+\/)?offers\/?$/;

type SidebarLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Extra routes that also select this link. */
  match?: RegExp;
};

const SIDEBAR_LINKS: { section: string; items: SidebarLink[] }[] = [
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
        // Also selected on a single apartment's offers page.
        match: OFFERS_ROUTE,
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
            {group.items.map(({ label, href, icon: Icon, match }) => {
              const isActive =
                pathname === href || (match?.test(pathname) ?? false);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={navItemClass(isActive)}
                  >
                    <Icon
                      aria-hidden="true"
                      className={navIconClass(isActive)}
                    />
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
