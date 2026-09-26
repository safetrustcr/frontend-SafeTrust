"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type {
  EscrowData,
  NotificationData,
} from "@/components/dashboard/RoleEscrowDashboard";
import {
  fetchMockEscrows,
  generateMockNotifications,
} from "@/lib/mockData";
import { getUserRole } from "@/utils/role-utils";

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
  }
);

export function RoleEscrowDashboardPage() {
  const [userRole, setUserRole] = useState<"guest" | "hotel" | "admin">("guest");
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const role = getUserRole();
      setUserRole(role ?? "guest");
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
    loadData();
  }, [loadData]);

  return (
    <RoleEscrowDashboard
      userRole={userRole}
      escrows={escrows}
      notifications={notifications}
      isLoading={isLoading}
      error={error}
      onRefresh={loadData}
    />
  );
}
