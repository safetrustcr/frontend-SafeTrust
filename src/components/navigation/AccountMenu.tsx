"use client";

import Link from "next/link";
import {
  Bell,
  CircleUserRound,
  Heart,
  LogIn,
  Menu,
  MessageSquare,
  UserPlus,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ACCOUNT_ROUTES as R, loginHref, registerHref } from "./account-routes";

const initials = (name: string | null, email: string | null) =>
  (name ?? email ?? "?")
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

const itemIcon = "h-4 w-4 shrink-0";

/**
 * Account menu shared by the guest header (HotelHeader) and the dashboard
 * header: Messages, Wishlists, Notifications and Profile, plus Log in /
 * Sign up when signed out and Log out when signed in.
 *
 * Identity comes from `useCurrentUser` (verified Firebase ID-token claims) and
 * the trigger is disabled while auth resolves so a visitor never sees a flash
 * of somebody else's name. Signed-out Profile opens the public
 * `/guest/profile` landing (issue #655).
 */
export function AccountMenu() {
  const { user, loading } = useCurrentUser();
  const protectedHref = (href: string) => (user ? href : loginHref(href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={
          user
            ? `Account menu for ${user.displayName ?? user.email}`
            : "Account menu"
        }
        disabled={loading}
        data-testid="header-account-menu"
        className="flex min-h-11 items-center gap-2 rounded-full border border-border px-2 py-1 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu aria-hidden="true" className="h-4 w-4" />
        {user ? (
          <span
            aria-hidden="true"
            data-testid="header-account-initials"
            className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
          >
            {initials(user.displayName, user.email)}
          </span>
        ) : (
          <CircleUserRound
            aria-hidden="true"
            data-testid="header-account-guest"
            className="h-8 w-8 text-muted-foreground"
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem asChild>
          <Link href={protectedHref(R.messages)}>
            <MessageSquare aria-hidden="true" className={itemIcon} />
            Messages
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={protectedHref(R.wishlists)}>
            <Heart aria-hidden="true" className={itemIcon} />
            Wishlists
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={protectedHref(R.notifications)}>
            <Bell aria-hidden="true" className={itemIcon} />
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={user ? R.profile : R.guestProfile}>
            <UserRound aria-hidden="true" className={itemIcon} />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem asChild>
            <LogoutButton />
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href={loginHref(R.profile)}>
                <LogIn aria-hidden="true" className={itemIcon} />
                Log in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={registerHref(R.profile)}>
                <UserPlus aria-hidden="true" className={itemIcon} />
                Sign up
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
