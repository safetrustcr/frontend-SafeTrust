import axios from "axios";

/** Fetch pending escrow notifications for an escrow. */
export async function checkPendingNotifications(escrowId: string) {
  const { data } = await axios.get("/notifications/test/check-pending", {
    params: { escrowId },
  });
  return data;
}

/** Fetch milestone notifications for an escrow. */
export async function checkMilestoneUpdates(escrowId: string) {
  // TODO: point at the milestone endpoint; this previously reused the pending-check route.
  const { data } = await axios.get("/notifications/test/check-pending", {
    params: { escrowId },
  });
  return data;
}

/** Fetch dispute notifications for an escrow. */
export async function checkDisputeNotifications(escrowId: string) {
  // TODO: point at the dispute endpoint; this previously reused the pending-check route.
  const { data } = await axios.get("/notifications/test/check-pending", {
    params: { escrowId },
  });
  return data;
}
