"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

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

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border border-destructive/20 text-center my-6">
      <EmptyState
        title="Dashboard Error"
        description={
          error.message ||
          "An unexpected error occurred loading this dashboard view."
        }
        action={<Button onClick={() => reset()}>Try again</Button>}
      />
    </div>
  );
}
