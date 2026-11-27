/**
 * Pure types and logic for the Escrow Lifecycle (issue #758).
 *
 * Covers the full lifecycle:
 *   Escrow created → Payment locked → Stay completed → Approved → Released
 * With dispute side branch:
 *   Disputed → Resolved
 */

export type EscrowLifecycleStatus =
  | "created"
  | "funded"
  | "stay_completed"
  | "approved"
  | "released"
  | "disputed"
  | "resolved";

export type EscrowUserRole =
  "host" | "guest" | "platform" | "resolver" | "viewer";

/**
 * Release option decided by the team:
 * - Option A ("platform"): platform releases funds after guest approval; admin Releases screen needed.
 * - Option B ("guest"): guest directly triggers "Approve and release" with confirmation; no admin screen needed.
 */
export type ReleaseOption = "guest" | "platform";

export type WalletSigningStatus =
  "idle" | "awaiting-signature" | "submitting" | "done" | "failed";

export interface DisputeDetails {
  reason: string;
  description: string;
  openedBy: EscrowUserRole | string;
  openedAt: string;
  txHash?: string;
}

export interface DisputeResolution {
  guestAmount: number;
  hostAmount: number;
  resolverNotes?: string;
  resolvedAt: string;
  resolverAddress: string;
  txHash?: string;
}

export interface TimelineStepDetail {
  id: number | string;
  key: EscrowLifecycleStatus;
  title: string;
  description?: string;
  actor?: string;
  date?: string;
  txHash?: string;
  txUrl?: string;
}

export const DISPUTE_REASONS = [
  {
    value: "property_not_as_described",
    label: "Property not as described",
  },
  {
    value: "host_no_show",
    label: "Host unavailable or check-in failed",
  },
  {
    value: "cleanliness_safety",
    label: "Cleanliness or safety violation",
  },
  {
    value: "amenities_missing",
    label: "Critical amenities missing or unusable",
  },
  {
    value: "early_checkout",
    label: "Early checkout or cancellation dispute",
  },
  {
    value: "other",
    label: "Other issue",
  },
] as const;

export type DisputeReasonKey = (typeof DISPUTE_REASONS)[number]["value"];

/**
 * Validates that guestAmount + hostAmount equals totalBalance within a 0.001 delta,
 * and that neither amount is negative.
 */
export function validateDisputeSplit(
  guestAmount: number,
  hostAmount: number,
  totalBalance: number,
): { valid: boolean; difference: number; error?: string } {
  if (
    typeof guestAmount !== "number" ||
    typeof hostAmount !== "number" ||
    typeof totalBalance !== "number" ||
    isNaN(guestAmount) ||
    isNaN(hostAmount) ||
    isNaN(totalBalance)
  ) {
    return {
      valid: false,
      difference: totalBalance,
      error: "Please enter valid numeric amounts.",
    };
  }

  if (guestAmount < 0 || hostAmount < 0) {
    return {
      valid: false,
      difference: totalBalance - (guestAmount + hostAmount),
      error: "Amounts cannot be negative.",
    };
  }

  // Reject precision beyond supported two decimal places
  if (
    Math.abs(guestAmount - Math.round(guestAmount * 100) / 100) > 1e-6 ||
    Math.abs(hostAmount - Math.round(hostAmount * 100) / 100) > 1e-6 ||
    Math.abs(totalBalance - Math.round(totalBalance * 100) / 100) > 1e-6
  ) {
    return {
      valid: false,
      difference: totalBalance - (guestAmount + hostAmount),
      error: "Amounts cannot have more than two decimal places.",
    };
  }

  const guestCents = Math.round(guestAmount * 100);
  const hostCents = Math.round(hostAmount * 100);
  const targetCents = Math.round(totalBalance * 100);

  const diffCents = targetCents - (guestCents + hostCents);
  if (diffCents !== 0) {
    const diffAmount = Math.abs(diffCents) / 100;
    const direction = diffCents > 0 ? "under" : "over";
    const sum = (guestCents + hostCents) / 100;
    const target = targetCents / 100;
    return {
      valid: false,
      difference: diffCents / 100,
      error: `Split totals ${sum.toFixed(2)}, which is ${diffAmount.toFixed(2)} ${direction} the balance of ${target.toFixed(2)}.`,
    };
  }

  return {
    valid: true,
    difference: 0,
  };
}

/**
 * Checks whether the specified role is permitted to perform an action given the current state.
 */
export function canPerformAction(
  role: EscrowUserRole,
  status: EscrowLifecycleStatus,
  options?: {
    isCheckOutPast?: boolean;
    releaseOption?: ReleaseOption;
  },
): { canAct: boolean; actionName?: string; reason?: string } {
  if (status === "disputed") {
    if (role === "resolver") {
      return { canAct: true, actionName: "resolve_dispute" };
    }
    return {
      canAct: false,
      reason: "Dispute opened. Awaiting resolver determination.",
    };
  }

  if (status === "funded") {
    if (role === "host") {
      if (options?.isCheckOutPast) {
        return { canAct: true, actionName: "mark_stay_completed" };
      }
      return {
        canAct: false,
        reason:
          "Stay is currently in progress. Host can complete after checkout.",
      };
    }
    return {
      canAct: false,
      reason: "Payment is locked in escrow. Stay in progress.",
    };
  }

  if (status === "stay_completed") {
    if (role === "guest") {
      const releaseOpt = options?.releaseOption ?? "guest";
      return {
        canAct: true,
        actionName:
          releaseOpt === "guest" ? "approve_and_release" : "approve_stay",
      };
    }
    return {
      canAct: false,
      reason: "Host marked stay completed. Awaiting guest review and approval.",
    };
  }

  if (status === "approved") {
    const releaseOpt = options?.releaseOption ?? "guest";
    if (releaseOpt === "platform") {
      if (role === "platform") {
        return { canAct: true, actionName: "platform_release" };
      }
      return {
        canAct: false,
        reason: "Stay approved. Platform release in progress.",
      };
    }
    return {
      canAct: false,
      reason: "Stay approved.",
    };
  }

  if (status === "released") {
    return { canAct: false, reason: "Escrow funds have been released." };
  }

  if (status === "resolved") {
    return { canAct: false, reason: "Dispute has been resolved." };
  }

  return { canAct: false, reason: "Escrow created, awaiting deposit." };
}
