import type { NotificationData } from "@/types/dashboard";

export const NOTIFICATIONS_PATH = "/dashboard/notifications";

// Alphanumeric safe ID pattern (escrow IDs must match this to be trusted)
const SAFE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * Determines the navigation destination for a notification.
 * - If the notification has a valid escrowId, navigates to the escrow detail page.
 * - Otherwise, navigates to the notifications inbox with an anchor to the specific card.
 *
 * @param notification - The notification data
 * @returns The href string for navigation
 */
export function notificationHref(notification: NotificationData): string {
  if (notification.escrowId && SAFE_ID.test(notification.escrowId)) {
    return `/dashboard/escrow/${encodeURIComponent(notification.escrowId)}`;
  }
  return `${NOTIFICATIONS_PATH}#notification-${encodeURIComponent(notification.id)}`;
}
