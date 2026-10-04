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
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { applyRememberMe } from "@/lib/auth/persistence";
import { setSessionCookie } from "@/lib/auth/session";
import { WalletSelectionModal } from "./wallet/components/WalletSelectionModal";
import type { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { kit } from "./wallet/constants/wallet-kit.constant";
import { isValidStellarAddress } from "./wallet/utils/walletValidation";
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
  const connectWalletStore = useGlobalAuthenticationStore(
    (s) => s.connectWalletStore,
  );
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const walletLoginRedirect = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleStellarWalletSelected = async (wallet: ISupportedWallet) => {
    setWalletError(null);
    try {
      kit.setWallet(wallet.id);
      const { address } = await kit.getAddress();
      if (!isValidStellarAddress(address)) {
        throw new Error("Wallet returned an invalid Stellar address");
      }
      walletLoginRedirect.current = true;
      connectWalletStore(address, wallet.name);
      setWalletModalOpen(false);
      router.push("/dashboard");
    } catch (err) {
      setWalletError(
        err instanceof Error ? err.message : "Could not connect wallet",
      );
    }
  };

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
      if (walletLoginRedirect.current) {
        walletLoginRedirect.current = false;
        return;
      }
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
              className="w-full bg-black text-white hover:bg-black/90 hover:text-white"
              onClick={() => setWalletModalOpen(true)}
              disabled={isAnyAuthLoading}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Stellar wallet
            </Button>
            {walletError && (
              <p role="alert" className="text-center text-sm text-destructive">
                {walletError}
              </p>
            )}
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

      <WalletSelectionModal
        isOpen={isWalletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onWalletSelected={handleStellarWalletSelected}
      />
    </div>
  );
}
