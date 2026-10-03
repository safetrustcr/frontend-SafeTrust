"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="grid min-h-[70dvh] place-items-center px-4">
          <EmptyState
            title="Something went wrong"
            description={error.digest ? `Reference: ${error.digest}` : "Please try again."}
            action={<Button onClick={reset}>Try again</Button>}
          />
        </main>
      </body>
    </html>
  );
}
