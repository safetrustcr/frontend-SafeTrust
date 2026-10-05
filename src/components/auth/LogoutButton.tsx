"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearSessionCookie } from "@/lib/auth/session";
import { kit } from "@/components/auth/wallet/constants/wallet-kit.constant";
import { useGlobalAuthenticationStore } from "@/core/store/data";

export function LogoutButton() {
  const router = useRouter();
  const clearAuth = useGlobalAuthenticationStore((state) => state.clearAuth);
  const handleLogout = async () => {
    try {
      await kit.disconnect();
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
      onClick={handleLogout}
      variant="outline"
      aria-label="Log out"
      className="flex items-center gap-2 w-full text-destructive hover:text-destructive cursor-pointer"
    >
      <LogOut className="w-4 h-4 shrink-0" />
      <span className="md:hidden lg:block">Log out</span>
    </Button>
  );
}
