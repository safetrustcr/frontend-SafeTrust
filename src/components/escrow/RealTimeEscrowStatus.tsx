"use client";

import {
    useEscrowSubscription,
    type EscrowSubscriptionResult,
} from "@/hooks/useEscrowSubscription";
import { formatDistanceToNow } from "date-fns";

interface RealTimeEscrowStatusProps {
    escrowId: string;
    /** When set, the subscription is assumed to be owned by the parent (single subscription). */
    subscription?: EscrowSubscriptionResult;
}

const STATUS_BADGES: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    funded: "bg-blue-100 text-blue-800",
    active: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    released: "bg-green-100 text-green-800",
    disputed: "bg-red-100 text-red-800",
};

export function RealTimeEscrowStatus({
    escrowId,
    subscription,
}: RealTimeEscrowStatusProps) {
    const internal = useEscrowSubscription(escrowId, {
        skip: subscription !== undefined,
    });
    const { escrow, loading, error } = subscription ?? internal;

    if (loading) {
        return (
            <div className="animate-pulse rounded-lg border border-gray-200 p-4">
                <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                Unable to connect to live updates
            </div>
        );
    }

    if (!escrow) return null;

    const badgeClass =
        STATUS_BADGES[escrow.status] ?? "bg-gray-100 text-gray-800";
    const fundedCount = escrow.escrow_transaction_users.filter(
        (u: any) => u.funding_status === "funded",
    ).length;
    const totalUsers = escrow.escrow_transaction_users.length;

    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
                    >
                        {escrow.status}
                    </span>
                    <span className="text-xs text-gray-500">
                        {fundedCount}/{totalUsers} funded
                    </span>
                </div>
                <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date((escrow as any).updated_at as any), {
                        addSuffix: true,
                    })}
                </span>
            </div>
        </div>
    );
}
