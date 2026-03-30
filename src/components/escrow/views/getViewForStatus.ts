export type EscrowViewKind = "paid" | "blocked" | "released" | "pending";

/**
 * Maps backend escrow.status to the detail-page view.
 * @see issue: status-driven escrow detail waterfall
 */
export function getViewForStatus(status: string): EscrowViewKind {
  switch (status) {
    case "funded":
      return "paid";
    case "active":
      return "blocked";
    case "completed":
    case "released":
      return "released";
    default:
      return "pending";
  }
}
