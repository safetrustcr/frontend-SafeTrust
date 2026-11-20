"use client";

import { DEMO_MODE } from "@/lib/demo";
import type { HostPayoutStatus } from "../model/readiness";

export interface HostPayoutReadiness {
  status: HostPayoutStatus;
  retry?: () => void;
}

/**
 * Whether the signed-in host's wallet can receive USDC payouts (#762).
 *
 * The real trustline check (Horizon) is a separate issue. Until it lands the
 * status is "unknown", so no banner or badge is shown. Demo mode reports
 * "not-ready" so the host guidance can be reviewed end to end.
 */
export function useHostPayoutReadiness(): HostPayoutReadiness {
  return { status: DEMO_MODE ? "not-ready" : "unknown" };
}
