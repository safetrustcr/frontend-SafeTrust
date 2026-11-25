import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Heart,
  Home,
  Hotel,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  PlusSquare,
  Shield,
  User,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra path prefixes that should also mark this item active. */
  matches?: string[];
  /** Paths that `matches` would catch but that belong to another nav context. */
  excludes?: RegExp[];
  badge?: "notifications" | "messages";
  /** Feature is a demo whose data is never stored. */
  demo?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/escrow", label: "Escrows", icon: Shield },
  {
    href: "/dashboard/escrow-dashboard",
    label: "Escrow Dashboard",
    icon: LayoutDashboard,
  },
  { href: "/guest/suggestions", label: "Suggestions view", icon: Home },
  { href: "/rent", label: "Rent", icon: Home },
  {
    href: "/dashboard/hotels",
    label: "Hotels",
    icon: Hotel,
    matches: ["/dashboard/hotels/"],
    demo: true,
  },
  {
    href: "/dashboard/hotels/new",
    label: "New Hotel",
    icon: PlusCircle,
    demo: true,
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    badge: "notifications",
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: MessageSquare,
    badge: "messages",
    matches: ["/dashboard/messages/"],
  },
  { href: "/dashboard/favorites", label: "Wishlists", icon: Heart },
  { href: "/dashboard/users", label: "Users", icon: Users },
  {
    href: "/dashboard/apartments",
    label: "My apartments",
    icon: Building2,
    matches: ["/dashboard/apartments/"],
    // Offers routes are shown as selected by the profile sidebar instead.
    excludes: [/\/offers(\/|$)/],
  },
  {
    href: "/dashboard/apartments/new",
    label: "New Apartment",
    icon: PlusSquare,
  },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export const isActive = (
  pathname: string,
  item: NavItem,
  items: NavItem[] = NAV_ITEMS,
) => {
  if (pathname === item.href) {
    return true;
  }
  const hasExactMatch = items.some((i) => i.href === pathname);
  if (hasExactMatch) {
    return false;
  }
  if ((item.excludes ?? []).some((re) => re.test(pathname))) {
    return false;
  }
  return (item.matches ?? []).some((p) => pathname.startsWith(p));
};
