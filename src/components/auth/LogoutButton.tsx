"use client";

import { forwardRef, type MouseEvent } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearSessionCookie } from "@/lib/auth/session";
import { useWallet } from "@/hooks/useWallet";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { resetLocation } from "@/features/location";
import { cn } from "@/lib/utils";

/**
 * Signs out of the wallet and Firebase, clears the session and the in-memory
 * location, and goes to /login.
 */
export function useLogout() {
  const router = useRouter();
  const { disconnect } = useWallet();
  const clearAuth = useGlobalAuthenticationStore((state) => state.clearAuth);

  return async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Error disconnecting wallet during logout:", error);
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out during logout:", error);
    } finally {
      clearSessionCookie();
      clearAuth();
      resetLocation();
      router.push("/login");
    }
  };
}

/**
 * Forwards its ref and rest props so it can be used as an `asChild` target of
 * Radix menu items (AccountMenu): the menu needs its `role`, `tabIndex`, event
 * handlers and item ref attached to the underlying button.
 */
export const LogoutButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function LogoutButton({ className, onClick, ...props }, ref) {
    const logout = useLogout();

    const handleLogout = async (event: MouseEvent<HTMLButtonElement>) => {
      // Radix menu items pass their select/close handling through onClick.
      onClick?.(event);
      if (event.defaultPrevented) return;
      await logout();
    };

    return (
      <Button
        ref={ref}
        variant="ghost"
        aria-label="Log out"
        {...props}
        onClick={handleLogout}
        className={cn(
          "w-full cursor-pointer justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive md:justify-center lg:justify-start",
          className,
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="md:hidden lg:block">Log out</span>
      </Button>
    );
  },
);
LogoutButton.displayName = "LogoutButton";
