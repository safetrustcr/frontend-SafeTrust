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
import { cn } from "@/lib/utils";

/**
 * Forwards its ref and rest props so it can be used as an `asChild` target of
 * Radix menu items (AccountMenu): the menu needs its `role`, `tabIndex`, event
 * handlers and item ref attached to the underlying button.
 */
export const LogoutButton = forwardRef<HTMLButtonElement, ButtonProps>(
  function LogoutButton({ className, onClick, ...props }, ref) {
    const router = useRouter();
    const { disconnect } = useWallet();
    const clearAuth = useGlobalAuthenticationStore((state) => state.clearAuth);

    const handleLogout = async (event: MouseEvent<HTMLButtonElement>) => {
      // Radix menu items pass their select/close handling through onClick.
      onClick?.(event);
      if (event.defaultPrevented) return;

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
        router.push("/login");
      }
    };

    return (
      <Button
        ref={ref}
        variant="outline"
        aria-label="Log out"
        {...props}
        onClick={handleLogout}
        className={cn(
          "flex items-center gap-2 w-full text-destructive hover:text-destructive cursor-pointer",
          className,
        )}
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <span className="md:hidden lg:block">Log out</span>
      </Button>
    );
  },
);
LogoutButton.displayName = "LogoutButton";
