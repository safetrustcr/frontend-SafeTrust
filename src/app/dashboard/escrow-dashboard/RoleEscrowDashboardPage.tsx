"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { EscrowData, NotificationData } from "@/types";
import {
  fetchMockEscrows,
  generateMockNotifications,
} from "@/lib/mockData/dashboard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Dynamic import: RoleEscrowDashboard (chart libraries, escrow component tree,
// mock data generators) loads in a separate chunk only when this route is
// visited, keeping it out of the initial JS bundle.
const RoleEscrowDashboard = dynamic(
  () =>
    import("@/components/dashboard/RoleEscrowDashboard").then((m) => ({
      default: m.RoleEscrowDashboard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4 p-6">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    ),
  },
);

export function RoleEscrowDashboardPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map Hasura role ("host") to the dashboard component's expected value ("hotel").
  // The dashboard was built before BE-02 standardised role names; this adapter
  // keeps the component's internal API stable without touching its props type.
  const rawRole = user?.activeRole ?? "guest";
  const userRole: "guest" | "hotel" | "admin" =
    rawRole === "host" ? "hotel" : rawRole === "admin" ? "admin" : "guest";

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const escrowData = await fetchMockEscrows();
      setEscrows(escrowData);
      setNotifications(generateMockNotifications(escrowData));
    } catch {
      setError("Failed to load escrow dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  return (
    <RoleEscrowDashboard
      userRole={userRole}
      escrows={escrows}
      notifications={notifications}
      isLoading={isLoading || authLoading}
      error={error}
      onRefresh={loadData}
    />
  );
}
