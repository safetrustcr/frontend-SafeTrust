"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Loader2, MailCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Buildings from "@/components/auth/ui/Buildings";
import { clearSessionCookie } from "@/lib/auth/session";
import { resolveRedirectPath } from "@/lib/auth/redirect";
import {
  RESEND_COOLDOWN_MS,
  refreshVerification,
  sendVerification,
} from "@/lib/auth/email-verification";

type Message = { text: string; tone: "info" | "error" } | null;

const VERIFY_PAGE_PATH = "/verify-email";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = resolveRedirectPath(searchParams.get("redirect"));

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
      if (next) setVerified(next.emailVerified);
    });
  }, []);

  // Countdown for the resend cooldown; stops itself once it expires.
  useEffect(() => {
    if (cooldownUntil === 0) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  useEffect(() => {
    if (cooldownUntil !== 0 && now >= cooldownUntil) setCooldownUntil(0);
  }, [now, cooldownUntil]);

  // Re-check when the visitor comes back from their mail tab.
  useEffect(() => {
    if (!user || verified) return;
    const onFocus = () => {
      refreshVerification(user)
        .then(setVerified)
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, verified]);

  const secondsLeft =
    cooldownUntil === 0
      ? 0
      : Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  const resend = async () => {
    if (!user || sending || secondsLeft > 0) return;
    setSending(true);
    setMessage(null);
    try {
      await sendVerification(user, redirect);
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      setMessage({
        text: "We sent a new link. It can take a minute to arrive.",
        tone: "info",
      });
    } catch (e) {
      setMessage(
        e instanceof FirebaseError && e.code === "auth/too-many-requests"
          ? {
              text: "Too many attempts. Please wait a few minutes and try again.",
              tone: "error",
            }
          : {
              text: "We couldn't send the email. Check your connection and try again.",
              tone: "error",
            },
      );
    } finally {
      setSending(false);
    }
  };

  const checkNow = async () => {
    if (!user || checking) return;
    setChecking(true);
    setMessage(null);
    try {
      const isVerified = await refreshVerification(user);
      setVerified(isVerified);
      if (!isVerified) {
        setMessage({
          text: "We couldn't confirm it yet. Open the link in the email, then try again.",
          tone: "error",
        });
      }
    } catch {
      setMessage({
        text: "We couldn't confirm it yet. Open the link in the email, then try again.",
        tone: "error",
      });
    } finally {
      setChecking(false);
    }
  };

  const useDifferentAccount = async () => {
    try {
      await signOut(auth);
    } catch {
      // Leave for the sign-in page even if sign-out fails.
    } finally {
      clearSessionCookie();
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  };

  if (loading) return <VerifySkeleton />;

  if (!user) {
    return (
      <VerifyShell>
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-muted-foreground text-sm">
          Please sign in to verify your email address.
        </p>
        <Button asChild className="w-full">
          <Link
            href={`/login?redirect=${encodeURIComponent(
              `${VERIFY_PAGE_PATH}?redirect=${encodeURIComponent(redirect)}`,
            )}`}
          >
            Sign in
          </Link>
        </Button>
      </VerifyShell>
    );
  }

  if (verified) {
    return (
      <VerifyShell>
        <div className="flex justify-center">
          <div className="bg-primary p-3 rounded-full">
            <MailCheck
              className="h-10 w-10 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Email verified</h1>
        <p className="text-muted-foreground text-sm">
          Your email address is verified. You&apos;re all set.
        </p>
        <Button asChild className="w-full">
          <Link href={redirect}>Continue</Link>
        </Button>
      </VerifyShell>
    );
  }

  if (!user.email) {
    return (
      <VerifyShell>
        <h1 className="text-2xl font-bold">No email to verify</h1>
        <p className="text-muted-foreground text-sm">
          This account doesn&apos;t have an email address. You can continue to
          SafeTrust.
        </p>
        <Button asChild className="w-full">
          <Link href={redirect}>Continue</Link>
        </Button>
      </VerifyShell>
    );
  }

  return (
    <VerifyShell>
      <div className="flex justify-center">
        <div className="bg-primary p-3 rounded-full">
          <MailCheck
            className="h-10 w-10 text-primary-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold">Verify your email</h1>
      <p className="text-muted-foreground text-sm">
        We sent a link to{" "}
        <span className="font-semibold text-foreground">{user.email}</span>.
        Open it to verify your account.
      </p>

      <div
        role="status"
        aria-live="polite"
        className={`min-h-5 text-sm ${
          message?.tone === "error"
            ? "text-destructive"
            : "text-muted-foreground"
        }`}
      >
        {message?.text ?? ""}
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={checkNow}
          disabled={checking}
          aria-busy={checking}
        >
          {checking && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          I&apos;ve verified my email
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={resend}
          disabled={sending || secondsLeft > 0}
          aria-busy={sending}
        >
          {sending
            ? "Sending…"
            : secondsLeft > 0
              ? `Resend in ${secondsLeft} s`
              : "Resend email"}
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={useDifferentAccount}
        >
          Use a different account
        </Button>
      </div>
    </VerifyShell>
  );
}

function VerifyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">{children}</div>
      <Buildings />
    </div>
  );
}

function VerifySkeleton() {
  return (
    <VerifyShell>
      <p role="status" className="sr-only">
        Loading verification status…
      </p>
      <Skeleton className="mx-auto h-16 w-16 rounded-full" />
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="mx-auto h-5 w-64" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </VerifyShell>
  );
}
