"use client";

import Link from "next/link";
import Image from "next/image";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Illustration from "@/components/auth/ui/Illustration";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "./wallet/hooks/wallet.hook";
import { WalletSelectionModal } from "./wallet/components/WalletSelectionModal";

export default function LoginPage() {
  const { address } = useGlobalAuthenticationStore();
  const { 
    handleConnect, 
    isModalOpen, 
    handleWalletSelected, 
    closeModal,
    connectStellarWallet = handleConnect
  } = useWallet();
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    if (address) {
      router.push("/dashboard");
    }
  }, [address, router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center px-4 md:w-1/2">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center space-x-2">
            <Image
              src="/img/logo.png"
              alt="SafeTrust"
              width={32}
              height={32}
              style={{ width: "auto", height: "auto" }}
            />
            <h1 className="text-2xl font-bold">SafeTrust</h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or username</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-[#2857B8] hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <Button className="w-full bg-[#2857B8] hover:bg-[#2857B8]/90">
              Login
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Login with Google
            </Button>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full bg-[#2857B8] text-white hover:bg-[#2857B8]/90"
                onClick={connectStellarWallet}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Connect Stellar Wallet
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleConnect}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Other Wallets
              </Button>
            </div>
          </div>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#2857B8] hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>

      <Illustration />
      
      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onWalletSelected={handleWalletSelected}
      />
    </div>
  );
}
