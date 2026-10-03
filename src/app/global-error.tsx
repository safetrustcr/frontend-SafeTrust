"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Critical Error Occurred
            </h2>
            <p className="text-sm text-gray-600">
              A critical application error occurred. Please reload the page.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
            >
              Reload application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
