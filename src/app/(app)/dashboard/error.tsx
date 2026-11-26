"use client";

import { useEffect, useRef } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { clientEnv } from "@/config/env";

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error("Dashboard error:", error);
    if (clientEnv.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          segment: "dashboard",
          route:
            typeof window !== "undefined"
              ? window.location.pathname
              : "/dashboard",
        },
      });
    }
  }, [error]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="dashboard-glass-card my-6 flex flex-col items-center justify-center rounded-xl p-8 text-center">
      <EmptyState
        title="This page couldn't load"
        titleRef={headingRef}
        description="Something went wrong on our side. Try again, or go back to your dashboard."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => reset()}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/escrow-dashboard">Go to dashboard</Link>
            </Button>
          </div>
        }
      />
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground">
          Error reference: <code>{error.digest}</code>
        </p>
      )}
      {clientEnv.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-full overflow-auto text-left text-xs">
          {error.message}
        </pre>
      )}
    </div>
  );
}
