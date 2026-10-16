"use client";

import { Loader2, LocateFixed, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { useGeolocation } from "@/hooks/useGeolocation";

export function NearMeButton({
  geo,
  onClear,
}: {
  geo: ReturnType<typeof useGeolocation>;
  onClear?: () => void;
}) {
  useEffect(() => {
    if (geo.status === "denied") {
      toast.info(
        "Location is off. Pick a destination instead, or enable it in your browser settings.",
      );
    }
    if (geo.status === "error") {
      toast.error(
        "We couldn't get your location. Try again or choose a destination.",
      );
    }
  }, [geo.status]);

  if (geo.status === "unavailable") return null;

  const isPrompting = geo.status === "prompting";
  const isGranted = geo.status === "granted";

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={isGranted ? (onClear ?? geo.clear) : geo.request}
        disabled={isPrompting || geo.status === "denied"}
        className="inline-flex min-h-11 items-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-800"
      >
        {isPrompting ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isGranted ? (
          <X className="mr-1 h-4 w-4" aria-hidden="true" />
        ) : (
          <LocateFixed className="mr-1 h-4 w-4" aria-hidden="true" />
        )}
        {isGranted ? "Clear location" : "Use my location"}
      </button>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Used only in your browser to sort results.
      </p>
    </div>
  );
}
