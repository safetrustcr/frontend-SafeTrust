import { auth } from "@/lib/firebase";
import { DEMO_MODE } from "@/lib/demo";

/** Demo mode has no claims backend, so Send is shown as unavailable. */
export const CLAIMS_AVAILABLE = !DEMO_MODE;

export type ClaimReceipt = {
  id: string;
  status: "submitted" | "in_review" | "resolved" | "rejected";
  createdAt: string;
};

export class ClaimError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = "ClaimError";
  }
}

/**
 * Submit a claim on a released escrow through the Next proxy (backend IC-11).
 * `clientOpId` makes retries idempotent: the backend returns the existing
 * claim instead of creating a duplicate.
 */
export async function submitClaim(
  escrowId: string,
  body: string,
  clientOpId: string,
): Promise<ClaimReceipt> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new ClaimError("UNAUTHENTICATED");

  let res: Response;
  try {
    res = await fetch(`/api/escrow-claims/${encodeURIComponent(escrowId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body, clientOpId }),
      cache: "no-store",
    });
  } catch {
    throw new ClaimError("NETWORK");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ClaimError(
      res.status === 429
        ? "RATE_LIMITED"
        : (data.error ?? `HTTP_${res.status}`),
    );
  }
  return data as ClaimReceipt;
}

const MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "Your session has expired. Sign in again to send a claim.",
  ESCROW_NOT_RELEASED:
    "Claims can only be sent once the deposit has been released.",
  RATE_LIMITED:
    "You've sent too many claims in a short time. Wait a minute and try again.",
  NETWORK: "We couldn't reach SafeTrust. Check your connection and try again.",
  BACKEND_NOT_CONFIGURED:
    "Sending claims isn't available yet in this environment.",
};

export function claimErrorMessage(error: unknown): string {
  const code = error instanceof ClaimError ? error.code : undefined;
  return (
    (code && MESSAGES[code]) ??
    "We couldn't send your claim. Your text is kept, so you can try again."
  );
}
