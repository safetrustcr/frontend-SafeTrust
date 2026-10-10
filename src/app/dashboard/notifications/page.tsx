"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { NotificationItem } from "@/components/dashboard/NotificationItem";

// TODO: replace with real Hasura query once public.notifications table is created
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "success" as const,
    title: "Escrow funded",
    message: "Your escrow ST-1-1714000000000 has been funded.",
    timestamp: "Today at 10:22 AM",
    read: false,
  },
  {
    id: "2",
    type: "info" as const,
    title: "Bid accepted",
    message: "Your bid on La Sabana house was accepted.",
    timestamp: "Yesterday at 3:15 PM",
    read: true,
  },
  {
    id: "3",
    type: "warning" as const,
    title: "Action required",
    message: "Sign the escrow contract before it expires.",
    timestamp: "May 30 at 9:00 AM",
    read: false,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs text-white font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <hr className="border-gray-700" />

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Bell className="h-10 w-10 text-gray-600" />
          <p className="text-sm font-medium text-gray-400">No notifications yet</p>
          <p className="text-xs text-gray-500">You are all caught up</p>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              type={n.type}
              title={n.title}
              message={n.message}
              timestamp={n.timestamp}
              read={n.read}
              onClick={() => markRead(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
