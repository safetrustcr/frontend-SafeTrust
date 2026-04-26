"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound, ArrowLeft } from "lucide-react";
import Buildings from "@/components/auth/ui/Buildings";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
      setMessage(
        "If an account exists with this email, you will receive password reset instructions.",
      );
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 dark:bg-gray-900">
      <Buildings />
      <div className="relative z-10 w-full max-w-sm space-y-6 rounded-2xl border border-gray-200 bg-white/95 p-6 text-center shadow-xl dark:border-gray-700 dark:bg-gray-900/90">
        <div className="flex justify-center">
          <div className="rounded-full bg-[#2857B8] p-3 dark:bg-blue-900">
            <KeyRound className="h-10 w-10 text-white dark:text-blue-300" />
          </div>
        </div>

        <h1 className="text-2xl font-bold dark:text-gray-100">Forgot password?</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No worries, we'll send you a temporary password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="dark:text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {message && (
            <Alert
              variant={status === "error" ? "destructive" : "default"}
              className={
                status === "error"
                  ? "dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : "dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
              }
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2857B8] text-white hover:bg-[#2857B8]/90 dark:bg-blue-600 dark:hover:bg-blue-500"
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
            className="flex w-full items-center justify-center text-sm text-[#2857B8] hover:underline dark:text-blue-400"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to log in
          </button>
        </form>
      </div>
    </div>
  );
}
