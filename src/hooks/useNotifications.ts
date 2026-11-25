"use client";

import { create } from "zustand";

export type Notification = {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

// Replace this data source with Hasura when public.notifications is available.
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Escrow funded",
    message: "Your escrow ST-1-1714000000000 has been funded.",
    timestamp: "Today at 10:22 AM",
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Bid accepted",
    message: "Your bid on La Sabana house was accepted.",
    timestamp: "Yesterday at 3:15 PM",
    read: true,
  },
  {
    id: "3",
    type: "warning",
    title: "Action required",
    message: "Sign the escrow contract before it expires.",
    timestamp: "May 30 at 9:00 AM",
    read: false,
  },
];

export const IS_MOCK_NOTIFICATION_DATA = true;

export const useNotifications = create<{
  items: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}>((set) => ({
  items: MOCK_NOTIFICATIONS,
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
}));

export const useUnreadNotificationCount = () =>
  useNotifications(
    (state) => state.items.filter((notification) => !notification.read).length,
  );
