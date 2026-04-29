"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound, ArrowLeft } from "lucide-react";
import Buildings from "@/components/auth/ui/Buildings";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Firebase imports per Issue #313
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  // Error mapping per Issue #313 description
  const ERROR_MESSAGES: Record<string, string> = {
    "auth/user-not-found": "No account found with this email",
    "auth/invalid-email": "Invalid email address",
    "auth/too-many-requests": "Too many requests. Please try again later",
    "auth/internal-error": "Authentication server error",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Safety guard: Ensure auth is initialized (Prevents crash if API key is missing)
    if (!auth) {
      setStatus("error");
      setMessage("Configuration error: Authentication service not found.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // Execute Firebase password reset
      await sendPasswordResetEmail(auth, email);

      setStatus("success");
      setMessage("Check your email for reset instructions");
      setEmail(""); // Clear email input on success
    } catch (error: any) {
      console.error("Firebase Reset Error:", error.code);
      setStatus("error");

      // Map specific Firebase error codes or use generic fallback
      setMessage(
        ERROR_MESSAGES[error.code] ?? "Something went wrong — please try again",
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 transition-colors duration-300 dark:bg-gray-900">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <Buildings />

      <div className="relative z-10 w-full max-w-sm space-y-6 rounded-2xl border border-gray-200 bg-white/95 p-6 text-center shadow-xl transition-colors duration-300 dark:border-gray-700 dark:bg-gray-900/90">
        <div className="flex justify-center">
          <div className="rounded-full bg-[#2857B8] p-3 transition-colors duration-300 dark:bg-blue-900">
            <KeyRound className="h-10 w-10 text-white transition-colors duration-300 dark:text-blue-300" />
          </div>
        </div>

        <h1 className="text-2xl font-bold transition-colors duration-300 dark:text-gray-100">
          Forgot password?
        </h1>
        <p className="text-sm text-gray-500 transition-colors duration-300 dark:text-gray-400">
          No worries, we'll send you a temporary password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label
              htmlFor="email"
              className="transition-colors duration-300 dark:text-gray-200"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="transition-colors duration-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {message && (
            <Alert
              variant={status === "error" ? "destructive" : "default"}
              className={`transition-colors duration-300 ${
                status === "error"
                  ? "dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : "dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
              }`}
            >
              <AlertDescription className="transition-colors duration-300">
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2857B8] text-white transition-colors duration-300 hover:bg-[#2857B8]/90 dark:bg-blue-600 dark:hover:bg-blue-500"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send password"
            )}
          </Button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex w-full items-center justify-center text-sm text-[#2857B8] transition-colors duration-300 hover:underline dark:text-blue-400"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to log in
          </button>
        </form>
      </div>
    </div>
  );
}
