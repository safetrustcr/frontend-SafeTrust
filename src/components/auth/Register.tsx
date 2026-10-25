"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { setSessionCookie } from "@/lib/auth/session";
import Illustration from "@/components/auth/ui/Illustration";
import {
  AuthMotion,
  AuthMotionPanel,
  AuthMotionItem,
  AuthMotionButton,
  AuthMotionError,
} from "@/components/auth/ui/AuthMotion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { toast } from "sonner";

const COUNTRY_CODES = [
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
];

const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/invalid-email": "Invalid email address",
};

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+506");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const isAnyAuthLoading = isLoading || isGoogleLoading;

  const clearError = () => setError("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Step 1 — create Firebase user
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(credential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });

      const token = await credential.user.getIdToken();

      // Step 2 — sync user to backend-SafeTrust (non-blocking)
      // This call is optional — frontend-SafeTrust runs standalone without
      // backend-SafeTrust. If the backend is not running or BACKEND_URL is
      // not set, the sync is skipped silently and registration still completes.
      // When backend-SafeTrust IS running, the sync writes the user to PostgreSQL.
      try {
        await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            country_code: phoneCountryCode,
            location,
          }),
        });
      } catch {
        // Backend not available — skip sync, continue registration normally
        console.warn("User sync skipped — backend-SafeTrust not available");
      }

      // Step 3 — set cookie and store token
      setSessionCookie(token);

      toast.success("Account created successfully!", {
        description: "Please sign in with your new credentials.",
        duration: 4000,
      });

      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        toast.error(
          ERROR_MESSAGES[err.code] ??
            "An unexpected error occurred. Please try again.",
          { duration: 4000 },
        );
        setError(
          ERROR_MESSAGES[err.code] ?? "Registration failed — please try again",
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          duration: 4000,
        });
        setError("Registration failed — please try again");
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
            <AuthMotionItem className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center space-x-2">
                <Image
                  src="/img/logo.png"
                  alt="SafeTrust"
                  width={32}
                  height={32}
                />
                <h1 className="text-2xl font-bold">SafeTrust</h1>
              </div>
              <ThemeToggle />
            </AuthMotionItem>

            <GoogleSignInButton
              redirectTo="/dashboard/escrow-dashboard"
              label="Sign up with Google"
              disabled={isAnyAuthLoading}
              onLoadingChange={setIsGoogleLoading}
            />

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
            <form
              method="post"
              className="space-y-5 overflow-visible"
              onSubmit={handleRegister}
            >
              {/* First Name + Last Name */}
              <AuthMotionItem className="flex gap-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="given-name"
                    autoComplete="given-name"
                    placeholder="First name"
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearError();
                    }}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="family-name"
                    autoComplete="family-name"
                    placeholder="Last name"
                    required
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearError();
                    }}
                  />
                </div>
              </AuthMotionItem>

              {/* Phone */}
              <AuthMotionItem className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <select
                    name="country-code"
                    aria-label="Country code"
                    value={phoneCountryCode}
                    onChange={(e) => {
                      setPhoneCountryCode(e.target.value);
                      clearError();
                    }}
                    className="flex h-9 w-full sm:w-32 items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900"
                  >
                    {COUNTRY_CODES.map(({ code, country, flag }) => (
                      <option
                        key={code}
                        value={code}
                        className="dark:bg-gray-900 text-foreground"
                      >
                        {flag} {code} — {country}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phone"
                    name="tel-national"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="Enter your phone number"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError();
                    }}
                  />
                </div>
              </AuthMotionItem>

              {/* Location */}
              <AuthMotionItem className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <select
                  id="location"
                  name="country-name"
                  aria-label="Location"
                  autoComplete="country-name"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    clearError();
                  }}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900"
                >
                  <option
                    value=""
                    disabled
                    className="dark:bg-gray-900 text-foreground"
                  >
                    Select your location
                  </option>
                  <option
                    value="cr"
                    className="dark:bg-gray-900 text-foreground"
                  >
                    Costa Rica
                  </option>
                  <option
                    value="us"
                    className="dark:bg-gray-900 text-foreground"
                  >
                    United States
                  </option>
                  <option
                    value="mx"
                    className="dark:bg-gray-900 text-foreground"
                  >
                    Mexico
                  </option>
                  <option
                    value="es"
                    className="dark:bg-gray-900 text-foreground"
                  >
                    Spain
                  </option>
                </select>
              </AuthMotionItem>

              {/* Email */}
              <AuthMotionItem className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                />
              </AuthMotionItem>

              {/* Password */}
              <AuthMotionItem className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                />
              </AuthMotionItem>

              <Button
                asChild
                type="submit"
                className="w-full"
                disabled={isAnyAuthLoading}
              >
                <AuthMotionButton disabled={isAnyAuthLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </AuthMotionButton>
              </Button>

              {error && <AuthMotionError>{error}</AuthMotionError>}
            </form>

            <AuthMotionItem className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
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
