"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <Buildings />
      <div className="relative z-10 w-full max-w-sm space-y-6 text-center">
        <div className="flex justify-center">
          <div className="bg-[#2857B8] p-3 rounded-full">
            <KeyRound className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-gray-500 text-sm">
          No worries, we'll send you a temporary password
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {message && (
            <Alert variant={status === "error" ? "destructive" : "default"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2857B8] hover:bg-[#2857B8]/90"
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
            className="flex items-center justify-center text-sm text-[#2857B8] hover:underline w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to log in
          </button>
        </form>
      </div>
    </div>
  );
}
