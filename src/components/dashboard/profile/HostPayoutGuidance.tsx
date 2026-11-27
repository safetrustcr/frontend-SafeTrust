"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  HostPayoutReadinessBanner,
  useHostPayoutReadiness,
} from "@/features/escrow";

/** Host payout guidance on the profile pages (#762). Hosts only. */
export function HostPayoutGuidance({ className }: { className?: string }) {
  const { user } = useCurrentUser();
  const { status, retry } = useHostPayoutReadiness();
  if (user?.activeRole !== "host") return null;
  return (
    <HostPayoutReadinessBanner
      status={status}
      onRetry={retry}
      className={className}
    />
  );
}
