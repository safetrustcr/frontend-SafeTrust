"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    const authMethod =
      typeof window !== "undefined"
        ? localStorage.getItem("safetrust_auth_method") || "password"
        : "password";
    const route = typeof window !== "undefined" ? window.location.pathname : "";

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          auth_method: authMethod,
          route,
        },
      });
    }
  }, [error]);

  return (
    <main className="grid min-h-[70dvh] place-items-center px-4">
      <EmptyState
        title="Something went wrong"
        description={error.digest ? `Reference: ${error.digest}` : "Please try again."}
        action={<Button onClick={reset}>Try again</Button>}
      />
    </main>
  );
}
