"use client";

import Link from "next/link";
import { ChevronRight, SlidersHorizontal, Download } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { exportTransactionsToCSV } from "@/lib/exportToCSV";
import type { TransactionRow } from "@/lib/exportToCSV";
import { DashboardHeader } from "./DashboardHeader";
import { EscrowsByStatus } from "./EscrowsByStatus";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";
import { EscrowTable } from "./EscrowTable";
import { AnalyticsDashboard } from "./analytics";
import { Button } from "@/components/ui/button";

// Placeholder functions for notifications - in a real app, these would be API calls
async function checkPendingNotifications(): Promise<NotificationData[]> {
  // In a real implementation, this would fetch from Trustless Work API
  // const response = await fetch('/api/notifications/pending');
  // return response.json();
  return [];
}

async function checkMilestoneNotifications(): Promise<NotificationData[]> {
  // In a real implementation, this would fetch from Trustless Work API
  // const response = await fetch('/api/notifications/milestones');
  // return response.json();
  return [];
}

type EscrowStatus =
  | "pending"
  | "funded"
  | "check_in_approved"
  | "check_out_approved"
  | "completed"
  | "cancelled";

export interface EscrowData {
  id: string;
  contractId: string;
  status: EscrowStatus;
  amount: number;
  asset: {
    code: string;
    issuer?: string;
  };
  metadata?: {
    bookingId: string;
    hotelName: string;
    checkInDate: string;
    checkOutDate: string;
    guestName?: string;
    guestEmail?: string;
    roomNumber?: string;
  };
  nextMilestone?: string;
  milestones?: Milestone[];
  marker: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationData {
  id: string;
  type: "milestone" | "payment" | "alert";
  message: string;
  timestamp: string;
  read: boolean;
  escrowId?: string;
}

export interface Milestone {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  dueDate?: string;
  completedAt?: string;
}

const formatNotificationTimestamp = (timestamp: string) => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const STATUS_MAP: Record<string, string> = {
  "Completed": "completed",
  "Check-In Approved": "check_in_approved",
  "Check-out Approved": "check_out_approved",
  "Cancelled": "cancelled",
  "Pending": "pending",
};

interface RoleEscrowDashboardProps {
  userRole: "guest" | "hotel" | "admin";
  escrows?: EscrowData[];
  notifications?: NotificationData[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function RoleEscrowDashboard({
  userRole,
  escrows = [],
  notifications: initialNotifications = [],
  isLoading = false,
  error = null,
  onRefresh,
}: RoleEscrowDashboardProps) {
  const [notifications, setNotifications] =
    useState<NotificationData[]>(initialNotifications);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const isMountedRef = useRef(true);
  const isPollingRef = useRef(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [checkInFrom, setCheckInFrom] = useState("");
  const [checkInTo, setCheckInTo] = useState("");
  const [checkOutFrom, setCheckOutFrom] = useState("");
  const [checkOutTo, setCheckOutTo] = useState("");

  const STATUS_OPTIONS = [
    "Completed",
    "Check-In Approved",
    "Check-out Approved",
    "Cancelled",
    "Pending",
  ];

  const SORT_OPTIONS = [
    { label: "Most Recent", value: "recent" },
    { label: "Amount: High to Low", value: "amount-high" },
    { label: "Amount: Low to High", value: "amount-low" },
    { label: "Check-in Date", value: "checkin" },
  ];

  const activeFilterCount =
    statusFilter.length +
    (minAmount ? 1 : 0) +
    (maxAmount ? 1 : 0) +
    (checkInFrom ? 1 : 0) +
    (checkInTo ? 1 : 0) +
    (checkOutFrom ? 1 : 0) +
    (checkOutTo ? 1 : 0) +
    (sortBy !== "recent" ? 1 : 0);

  const filteredTransactions = useMemo(() => {
    let result = [...escrows];

    if (statusFilter.length > 0) {
      const mappedStatuses = statusFilter.map((s) => STATUS_MAP[s]);
      result = result.filter((t) => mappedStatuses.includes(t.status));
    }
    if (minAmount) {
      result = result.filter((t) => t.amount >= Number(minAmount));
    }
    if (maxAmount) {
      result = result.filter((t) => t.amount <= Number(maxAmount));
    }
    if (checkInFrom) {
      result = result.filter(
        (t) => t.metadata?.checkInDate && new Date(t.metadata.checkInDate) >= new Date(checkInFrom)
      );
    }
    if (checkInTo) {
      result = result.filter(
        (t) => t.metadata?.checkInDate && new Date(t.metadata.checkInDate) <= new Date(checkInTo)
      );
    }
    if (checkOutFrom) {
      result = result.filter(
        (t) => t.metadata?.checkOutDate && new Date(t.metadata.checkOutDate) >= new Date(checkOutFrom)
      );
    }
    if (checkOutTo) {
      result = result.filter(
        (t) => t.metadata?.checkOutDate && new Date(t.metadata.checkOutDate) <= new Date(checkOutTo)
      );
    }
    if (sortBy === "amount-high") {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "amount-low") {
      result.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === "checkin") {
      result.sort((a, b) => {
        const dateA = a.metadata?.checkInDate ? new Date(a.metadata.checkInDate).getTime() : 0;
        const dateB = b.metadata?.checkInDate ? new Date(b.metadata.checkInDate).getTime() : 0;
        return dateA - dateB;
      });
    } else {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return result;
  }, [statusFilter, minAmount, maxAmount, sortBy, checkInFrom, checkInTo, checkOutFrom, checkOutTo, escrows]);

  // Real-time updates using Trustless Work notifications
  useEffect(() => {
    if (isLoading) return;

    const checkUpdates = async () => {
      // Prevent overlapping requests
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const pendingNotifications = await checkPendingNotifications();
        const milestoneUpdates = await checkMilestoneNotifications();

        // Combine and deduplicate notifications
        const allNotifications = [...pendingNotifications, ...milestoneUpdates];
        const uniqueNotifications = allNotifications.filter(
          (notif, index, self) =>
            index === self.findIndex((n) => n.id === notif.id),
        );

        if (uniqueNotifications.length > 0 && isMountedRef.current) {
          setNotifications((prev) => {
            // Merge with existing notifications, avoiding duplicates
            const existingIds = new Set(prev.map((n) => n.id));
            const newNotifications = uniqueNotifications.filter(
              (n) => !existingIds.has(n.id),
            );
            return [...prev, ...newNotifications];
          });
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      } finally {
        isPollingRef.current = false;
      }
    };

    // Initial check
    checkUpdates();

    // Poll every 15 seconds
    const interval = setInterval(checkUpdates, 15000);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      isPollingRef.current = false;
      clearInterval(interval);
    };
  }, [isLoading]);

  const transactionRows: TransactionRow[] = filteredTransactions.map((escrow) => ({
    bookingId: escrow.metadata?.bookingId || escrow.id,
    hotel: escrow.metadata?.hotelName || "Unknown hotel",
    checkIn: escrow.metadata?.checkInDate || "",
    checkOut: escrow.metadata?.checkOutDate || "",
    amount: escrow.amount,
    status: escrow.status,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <DashboardHeader
            userRole={userRole}
            notifications={notifications}
            showAnalytics={showAnalytics}
            onToggleAnalytics={() => setShowAnalytics((prev) => !prev)}
          />
        </div>

        {/* Stats and Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Escrows
                </p>
                <p className="text-2xl font-bold mt-1 dark:text-white">
                  {escrows.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active
                </p>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                  {
                    escrows.filter(
                      (e) =>
                        e.status === "pending" ||
                        e.status === "check_in_approved" ||
                        e.status === "check_out_approved",
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Completed
                </p>
                <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                  {escrows.filter((e) => e.status === "completed").length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold mt-1 dark:text-white">
                  $
                  {escrows
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                <svg
                  className="w-6 h-6 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Panel (toggled from the header) */}
        {showAnalytics && (
          <div className="mb-6">
            <AnalyticsDashboard />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Status Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Escrow Status Overview
                </h2>
              </div>
              <div className="p-4">
                <EscrowsByStatus escrows={escrows} userRole={userRole} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Recent Activity
                </h2>
              </div>
              <div className="p-4">
                <RecentActivity escrows={escrows} />
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Quick Actions
                </h2>
              </div>
              <div className="p-4">
                <QuickActions userRole={userRole} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Notifications
                  {notifications.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-4">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {notification.type === "payment" ? (
                              <svg
                                className="h-5 w-5 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            ) : notification.type === "milestone" ? (
                              <svg
                                className="h-5 w-5 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-5 w-5 text-amber-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {formatNotificationTimestamp(
                                notification.timestamp,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length > 3 && (
                      <div className="text-center">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No new notifications
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Recent Transactions
            </h2>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 text-sm
                                     border border-slate-600 rounded-lg
                                     px-3 py-1.5 hover:bg-slate-700
                                     transition-colors text-gray-700 dark:text-gray-300
                                     relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5
                                       bg-orange-500 text-white text-[10px]
                                       font-bold rounded-full w-4 h-4
                                       flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 p-4 space-y-4
                             bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-md"
                >
                  {/* Sort by */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400">
                      Sort by
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          className={cn(
                            "text-xs px-2 py-1.5 rounded-lg text-left transition-colors",
                            sortBy === opt.value
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-slate-700" />

                  {/* Status filter */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            setStatusFilter((prev) =>
                              prev.includes(status)
                                ? prev.filter((s) => s !== status)
                                : [...prev, status]
                            )
                          }
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full border transition-colors",
                            statusFilter.includes(status)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-slate-500"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-slate-700" />

                  {/* Amount range */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400">
                      Amount Range
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min $"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600
                                   bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-300
                                   placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                      <span className="text-gray-500 shrink-0">—</span>
                      <input
                        type="number"
                        placeholder="Max $"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600
                                   bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-300
                                   placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-slate-700" />

                  {/* Date range */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400">
                      Check-in Date Range
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={checkInFrom}
                        onChange={(e) => setCheckInFrom(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600
                                   bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-300"
                      />
                      <span className="text-gray-500 shrink-0">to</span>
                      <input
                        type="date"
                        value={checkInTo}
                        onChange={(e) => setCheckInTo(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600
                                   bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-300"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-slate-700" />

                  {/* Check-out date range */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide
                                  text-gray-500 dark:text-gray-400">
                      Check-out Date Range
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={checkOutFrom}
                        onChange={(e) => setCheckOutFrom(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600
                                   bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-300"
                      />
                      <span className="text-gray-500 shrink-0">to</span>
                      <input
                        type="date"
                        value={checkOutTo}
                        onChange={(e) => setCheckOutTo(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-slate-600
                                   bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-300"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200 dark:border-slate-700" />

                  {/* Reset */}
                  <button
                    onClick={() => {
                      setStatusFilter([]);
                      setMinAmount("");
                      setMaxAmount("");
                      setSortBy("recent");
                      setCheckInFrom("");
                      setCheckInTo("");
                      setCheckOutFrom("");
                      setCheckOutTo("");
                    }}
                    className="w-full text-sm text-center text-orange-500
                               hover:text-orange-400 font-medium"
                  >
                    Reset all filters
                  </button>
                </PopoverContent>
              </Popover>
              <Link
                href="/dashboard/escrow"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportTransactionsToCSV(transactionRows)}
                disabled={transactionRows.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <EscrowTable escrows={filteredTransactions} userRole={userRole} />
          </div>
        </div>
      </div>
    </div>
  );
}
