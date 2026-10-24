"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearSessionCookie } from "@/lib/auth/session";
import { useWallet } from "@/hooks/useWallet";
import { useGlobalAuthenticationStore } from "@/core/store/data";

export function LogoutButton() {
  const router = useRouter();
  const { disconnect } = useWallet();
  const clearAuth = useGlobalAuthenticationStore((state) => state.clearAuth);
  const handleLogout = async () => {
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
      onClick={handleLogout}
      variant="ghost"
      aria-label="Log out"
      className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="md:hidden lg:block">Log out</span>
    </Button>
  );
}
