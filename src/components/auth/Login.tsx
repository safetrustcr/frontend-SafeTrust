"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Illustration from "@/components/auth/ui/Illustration";
import {
  AuthMotion,
  AuthMotionPanel,
  AuthMotionItem,
  AuthMotionButton,
  AuthMotionError,
} from "@/components/auth/ui/AuthMotion";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { applyRememberMe } from "@/lib/auth/persistence";
import { setSessionCookie } from "@/lib/auth/session";
import { resolveRedirectPath } from "@/lib/auth/redirect";
import { toast } from "sonner";
import { WalletProviderScoped } from "@/providers/WalletProviderScoped";

// Lazy-load FreighterSignInButton — pulls in stellar-wallets-kit.
// Only needed when the user interacts with wallet sign-in.
const FreighterSignInButton = dynamic(() => import("./FreighterSignInButton"), {
  ssr: false,
});

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Invalid email or password",
  "auth/too-many-requests": "Too many attempts — please try again later",
  "auth/invalid-email": "Invalid email address",
};

/**
 * Inner login form — rendered inside WalletProviderScoped so that the
 * wallet context (and stellar-wallets-kit) is only added to this subtree,
 * not to the whole app.
 */
function LoginForm() {
  const { address, token } = useGlobalAuthenticationStore();
  const walletLoginRedirect = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getSafeRedirect = useCallback(
    () => resolveRedirectPath(searchParams.get("redirect")),
    [searchParams],
  );

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
      // Use the lazy accessor from firebase-app so firebase/auth is NOT part
      // of the /login first-load chunk — it is only fetched when the user
      // submits the form.  firebase-app.ts has no static firebase/auth import.
      const [{ signInWithEmailAndPassword }, { getAuthInstance }] =
        await Promise.all([
          import("firebase/auth"),
          import("@/lib/firebase-app"),
        ]);
      const authInstance = await getAuthInstance();

      const credential = await signInWithEmailAndPassword(
        authInstance,
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
    <AuthMotion>
      <div className="flex min-h-screen">
        <div className="flex w-full flex-col items-center justify-center px-4 md:w-1/2">
          <AuthMotionPanel className="w-full max-w-sm space-y-6 py-8">
            <AuthMotionItem className="flex items-center space-x-2">
              <Image src="/img/logo.png" alt="SafeTrust" width={32} height={32} />
              <h1 className="text-2xl font-bold">SafeTrust</h1>
            </AuthMotionItem>

            <form method="post" className="space-y-4" onSubmit={handleLogin}>
              <AuthMotionItem className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={isAnyAuthLoading}
                  className="bg-muted/50 dark:bg-zinc-800"
                />
              </AuthMotionItem>

              <AuthMotionItem className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={isAnyAuthLoading}
                  className="bg-muted/50 dark:bg-zinc-800"
                />
              </AuthMotionItem>

              <AuthMotionItem className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    name="remember"
                    aria-label="Keep me signed in on this device"
                    checked={remember}
                    disabled={isAnyAuthLoading}
                    onCheckedChange={(v) => setRemember(v === true)}
                  />
                  <Label
                    htmlFor="remember"
                    className="font-normal text-sm cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
                  >
                    Keep me signed in on this device
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-700 dark:text-orange-400 underline hover:no-underline"
                >
                  Forgot your password?
                </Link>
              </AuthMotionItem>

              <Button
                asChild
                type="submit"
                className="w-full"
                disabled={isAnyAuthLoading}
              >
                <AuthMotionButton disabled={isAnyAuthLoading}>
                  {isLoading ? "Signing in..." : "Login"}
                </AuthMotionButton>
              </Button>

              {error && <AuthMotionError>{error}</AuthMotionError>}
            </form>

            <AuthMotionItem className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </AuthMotionItem>

            <AuthMotionItem className="space-y-3">
              <GoogleSignInButton
                redirectTo={getSafeRedirect()}
                label="Continue with Google"
                disabled={isAnyAuthLoading}
                onLoadingChange={setIsGoogleLoading}
                onBeforeSignIn={() => applyRememberMe(remember)}
              />

              <FreighterSignInButton redirectTo={getSafeRedirect()} />
            </AuthMotionItem>

            <AuthMotionItem className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-orange-700 dark:text-orange-400 underline hover:no-underline"
              >
                Register here
              </Link>
            </AuthMotionItem>
          </AuthMotionPanel>
        </div>

        <AuthMotionPanel className="hidden md:block md:w-1/2">
          <AuthMotionItem className="h-full">
            <Illustration className="h-full md:w-full" />
          </AuthMotionItem>
        </AuthMotionPanel>
      </div>
    </AuthMotion>
  );
}

/**
 * Login wraps the form with a scoped WalletProvider so that
 * stellar-wallets-kit is contained to this subtree only.
 */
export default function Login() {
  return (
    <WalletProviderScoped>
      <LoginForm />
    </WalletProviderScoped>
  );
}
