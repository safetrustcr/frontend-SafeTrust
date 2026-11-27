"use client";

import dynamic from "next/dynamic";
import {
  HostPayoutReadinessBanner,
  useHostPayoutReadiness,
} from "@/features/escrow";

const MyApartmentsTable = dynamic(
  () =>
    import("@/components/dashboard/apartments/MyApartmentsTable").then(
      (mod) => mod.MyApartmentsTable,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading apartments"
        className="h-64 rounded-lg bg-muted motion-safe:animate-pulse"
      />
    ),
  },
);

export function ApartmentsPageContent() {
  const { status, retry } = useHostPayoutReadiness();
  return (
    <div className="space-y-6">
      <HostPayoutReadinessBanner status={status} onRetry={retry} />
      <MyApartmentsTable payoutReady={status !== "not-ready"} />
    </div>
  );
}
