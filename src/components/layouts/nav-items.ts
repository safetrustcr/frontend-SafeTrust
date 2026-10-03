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
  badge?: "notifications" | "messages";
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
  },
  { href: "/dashboard/hotels/new", label: "New Hotel", icon: PlusCircle },
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
  { href: "/dashboard/favorites", label: "Favorite", icon: Heart },
  { href: "/dashboard/users", label: "Users", icon: Users },
  {
    href: "/dashboard/apartments",
    label: "My apartments",
    icon: Building2,
    matches: ["/dashboard/apartments/"],
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
  return (item.matches ?? []).some((p) => pathname.startsWith(p));
};
