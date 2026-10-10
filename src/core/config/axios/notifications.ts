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
  const { data } = await axios.get("/notifications/test/check-pending", {
    params: { escrowId },
  });
  return data;
}

/** Fetch dispute notifications for an escrow. */
export async function checkDisputeNotifications(escrowId: string) {
  const { data } = await axios.get("/notifications/test/check-pending", {
    params: { escrowId },
  });
  return data;
}
