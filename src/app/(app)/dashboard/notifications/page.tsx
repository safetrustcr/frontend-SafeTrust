"use client";

import { Bell } from "lucide-react";
import { NotificationItem } from "@/components/dashboard/NotificationItem";
import { Button } from "@/components/ui/button";
import {
  IS_MOCK_NOTIFICATION_DATA,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const notifications = useNotifications((state) => state.items);
  const markRead = useNotifications((state) => state.markRead);
  const markAllRead = useNotifications((state) => state.markAllRead);
  const unreadCount = useUnreadNotificationCount();
  const unreadDescription = `${unreadCount} unread ${
    unreadCount === 1 ? "notification" : "notifications"
  }`;

  return (
    <div className="min-w-0 space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">Notifications</h1>
          {IS_MOCK_NOTIFICATION_DATA && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              Mock data
            </span>
          )}
          <span
            data-testid="notification-unread-status"
            role="status"
            aria-live="polite"
            className="sr-only"
          >
            {unreadCount > 0 ? unreadDescription : "All notifications are read"}
          </span>
          {unreadCount > 0 && (
            <span
              data-testid="notification-unread-count"
              className="rounded-full bg-sky-700 px-2 py-0.5 text-xs font-medium text-white dark:bg-sky-400 dark:text-slate-950"
            >
              <span aria-hidden="true">{unreadCount}</span>
              <span className="sr-only">{unreadDescription}</span>
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            type="button"
            onClick={markAllRead}
            variant="ghost"
            size="sm"
            className="shrink-0 text-foreground"
          >
            Mark all as read
          </Button>
        )}
      </div>

      <hr className="border-border" />

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Bell className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            No notifications yet
          </p>
          <p className="text-xs text-muted-foreground">You are all caught up</p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              id={`notification-${n.id}`}
              className="scroll-mt-24"
            >
              <NotificationItem
                type={n.type}
                title={n.title}
                message={n.message}
                timestamp={n.timestamp}
                read={n.read}
                onClick={() => markRead(n.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
