"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Illustration from "@/components/auth/ui/Illustration";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { setSessionCookie } from "@/lib/auth/session";
import { toast } from "sonner";
import { GoogleSignInButton } from "./GoogleSignInButton";
import FreighterSignInButton from "./FreighterSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Invalid email or password",
  "auth/too-many-requests": "Too many attempts — please try again later",
  "auth/invalid-email": "Invalid email address",
};

export default function LoginPage() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const token = useGlobalAuthenticationStore((state) => state.token);

  const isAnyAuthLoading = isLoading || isGoogleLoading;

  useEffect(() => {
    if (token && pathname === "/login") {
      router.replace(getSafeRedirect());
    }
  }, [token, router, pathname, getSafeRedirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idToken = await credential.user.getIdToken();

      setSessionCookie(idToken);

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
              <Label htmlFor="email">Email or username</Label>
              <Input
                id="email"
                type="email"
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
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
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
              label="Login with Google"
              disabled={isAnyAuthLoading}
              onLoadingChange={setIsGoogleLoading}
            />

            <FreighterSignInButton redirectTo={getSafeRedirect()} />
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
    </div>
  );
}
