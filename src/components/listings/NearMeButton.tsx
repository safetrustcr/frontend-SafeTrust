"use client";

import { Loader2, LocateFixed, X } from "lucide-react";
import type { GeoStatus, useGeolocation } from "@/features/location";

// Persistent (not toast-only) so the reason stays readable and is announced.
const STATUS_MESSAGES: Partial<Record<GeoStatus, string>> = {
  denied:
    "Location is blocked for this site. You can re-enable it in your browser settings, or pick a destination instead.",
  timeout: "Finding your location took too long.",
  error: "We couldn't find your location. Pick a destination instead.",
};

export function NearMeButton({
  geo,
  onClear,
}: {
  geo: ReturnType<typeof useGeolocation>;
  onClear?: () => void;
}) {
  if (geo.status === "unavailable") return null;

  const isPrompting = geo.status === "prompting";
  const isGranted = geo.status === "granted";
  const message = STATUS_MESSAGES[geo.status];

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={isGranted ? (onClear ?? geo.clear) : () => geo.request()}
        disabled={isPrompting}
        aria-busy={isPrompting}
        className="inline-flex min-h-11 items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
      >
        {isPrompting ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isGranted ? (
          <X className="mr-1 h-4 w-4" aria-hidden="true" />
        ) : (
          <LocateFixed className="mr-1 h-4 w-4" aria-hidden="true" />
        )}
        {isPrompting
          ? "Finding your location…"
          : isGranted
            ? "Clear location"
            : geo.status === "timeout"
              ? "Try again"
              : "Use my location"}
      </button>
      {/* Always mounted so screen readers announce the message when it appears. */}
      <p
        aria-live="polite"
        data-testid="location-status"
        className="text-sm text-gray-700 empty:hidden dark:text-gray-300"
      >
        {message}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Used only in your browser to sort results.
      </p>
    </div>
  );
}
