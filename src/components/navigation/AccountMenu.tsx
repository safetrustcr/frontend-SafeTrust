"use client";

import Link from "next/link";
import {
  Bell,
  CircleUserRound,
  Heart,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  UserPlus,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLogout } from "@/components/auth/LogoutButton";
import { ACCOUNT_ROUTES as R, loginHref, registerHref } from "./account-routes";

const ITEM_CLASS = "min-h-11 cursor-pointer gap-3 px-3";

const initials = (name: string | null, email: string | null) =>
  (name ?? email ?? "?")
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

/** Account dropdown shared by the guest and dashboard headers. */
export function AccountMenu() {
  const { user, loading } = useCurrentUser();
  const logout = useLogout();
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
        data-testid="account-menu-trigger"
        className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-2 py-1 text-foreground transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
        {user ? (
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
          >
            {initials(user.displayName, user.email)}
          </span>
        ) : (
          <CircleUserRound
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        {user && (
          <>
            <DropdownMenuLabel className="truncate px-3 font-semibold">
              {user.displayName ?? user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild className={ITEM_CLASS}>
          <Link href={protectedHref(R.messages)}>
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Messages
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM_CLASS}>
          <Link href={protectedHref(R.wishlists)}>
            <Heart className="h-4 w-4" aria-hidden="true" />
            Wishlists
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM_CLASS}>
          <Link href={protectedHref(R.notifications)}>
            <Bell className="h-4 w-4" aria-hidden="true" />
            Notifications
          </Link>
        </DropdownMenuItem>
        {/* Signed-out Profile goes through login until the public guest profile page exists. */}
        <DropdownMenuItem asChild className={ITEM_CLASS}>
          <Link href={protectedHref(R.profile)}>
            <UserRound className="h-4 w-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem
            className={`${ITEM_CLASS} text-destructive focus:text-destructive`}
            onSelect={() => void logout()}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild className={ITEM_CLASS}>
              <Link href={loginHref(R.profile)}>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Log in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className={ITEM_CLASS}>
              <Link href={registerHref(R.profile)}>
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Sign up
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
