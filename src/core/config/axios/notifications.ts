import axios from "axios";

export async function checkPendingNotifications(escrowId: string) {
  const { data } = await axios.get("/notifications/test/check-pending", {
    params: { escrowId },
  });
  return data;
}

export async function checkMilestoneUpdates(escrowId: string) {
  const { data } = await axios.get("/notifications/test/check-pending", {
    params: { escrowId },
  });
  return data;
}

export async function checkDisputeNotifications(escrowId: string) {
  const { data } = await axios.get("/notifications/test/check-pending", {
    params: { escrowId },
  });
  return data;
}