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
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { applyRememberMe } from "@/lib/auth/persistence";
import { setSessionCookie } from "@/lib/auth/session";
import { useMultiWallet } from "./wallet/hooks/multi-wallet.hook";
import { MainWalletSelectionModal } from "./wallet/components/MainWalletSelectionModal";
import { WalletSelectionModal } from "./wallet/components/WalletSelectionModal";
import { MetaMaskWalletModal } from "./wallet/components/MetaMaskWalletModal";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Invalid email or password",
  "auth/too-many-requests": "Too many attempts — please try again later",
  "auth/invalid-email": "Invalid email address",
};

export default function LoginPage() {
  const { address, token } = useGlobalAuthenticationStore();
  const {
    handleConnect,
    isMainModalOpen,
    isStellarModalOpen,
    isMetaMaskModalOpen,
    closeMainModal,
    closeStellarModal,
    closeMetaMaskModal,
    handleWalletTypeSelected,
    handleStellarWalletSelected,
    handleMetaMaskSelected,
  } = useMultiWallet();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getSafeRedirect = useCallback(() => {
    const redirect = searchParams.get("redirect");
    if (
      redirect &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//") &&
      !redirect.startsWith("/\\") &&
      !redirect.includes("://")
    ) {
      return redirect;
    }
    return "/dashboard/escrow-dashboard";
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const isAnyAuthLoading = isLoading || isGoogleLoading;

  useEffect(() => {
    if ((address || token) && pathname === "/login") {
      router.push(getSafeRedirect());
    }
  }, [address, token, router, pathname, getSafeRedirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await applyRememberMe(remember);
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await credential.user.getIdToken();

      setSessionCookie(idToken);
      useGlobalAuthenticationStore.getState().setToken(idToken);

      toast.success("Login successful!", {
        description: "Redirecting to your dashboard...",
      });
      router.push(getSafeRedirect());
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        toast.error(
          ERROR_MESSAGES[err.code] ??
            "An unexpected error occurred. Please try again.",
          { duration: 4000 },
        );
        setError(ERROR_MESSAGES[err.code] ?? "Login failed — please try again");
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          duration: 4000,
        });
        setError("Login failed — please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onStellarWalletSelected = async (wallet: {
    id: string;
    name: string;
  }) => {
    await applyRememberMe(remember);
    await handleStellarWalletSelected(wallet);
  };

  const onMetaMaskSelected = async () => {
    await applyRememberMe(remember);
    await handleMetaMaskSelected();
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center px-4 md:w-1/2">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center space-x-2">
            <Image src="/img/logo.png" alt="SafeTrust" width={32} height={32} />
            <h1 className="text-2xl font-bold">SafeTrust</h1>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                <Label
                  htmlFor="remember"
                  className="font-normal text-sm cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Keep me signed in on this device
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isAnyAuthLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </Button>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <GoogleSignInButton
              redirectTo={getSafeRedirect()}
              label="Continue with Google"
              disabled={isAnyAuthLoading}
              onLoadingChange={setIsGoogleLoading}
              onBeforeSignIn={() => applyRememberMe(remember)}
            />

            <Button
              type="button"
              variant="outline"
              className="w-full bg-black text-white"
              onClick={handleConnect}
              disabled={isAnyAuthLoading}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Login with wallet
            </Button>
          </div>

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>

      <Illustration />

      <MainWalletSelectionModal
        isOpen={isMainModalOpen}
        onClose={closeMainModal}
        onWalletTypeSelected={handleWalletTypeSelected}
      />
      <WalletSelectionModal
        isOpen={isStellarModalOpen}
        onClose={closeStellarModal}
        onWalletSelected={onStellarWalletSelected}
      />
      <MetaMaskWalletModal
        isOpen={isMetaMaskModalOpen}
        onClose={closeMetaMaskModal}
        onWalletConnected={onMetaMaskSelected}
      />
    </div>
  );
}
