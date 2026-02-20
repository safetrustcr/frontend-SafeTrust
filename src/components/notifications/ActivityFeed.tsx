"use client";

import { useSubscription } from "@apollo/client";
import { USER_ESCROW_ACTIVITY_SUBSCRIPTION } from "@/graphql/subscriptions/escrow-subscriptions";
import type { UserEscrowActivitySubscription } from "@/graphql/types";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
    userId: string;
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
    const { data, loading, error } =
        useSubscription<UserEscrowActivitySubscription>(
            USER_ESCROW_ACTIVITY_SUBSCRIPTION,
            {
                variables: { userId },
                skip: !userId,
            },
        );

    if (!userId) return null;

    if (loading) {
        return (
            <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-500">
                    Live Activity
                </h3>
                <p className="text-sm text-gray-400">Connecting...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">
                    Unable to load live activity feed
                </p>
            </div>
        );
    }

    const activities = data?.escrow_transaction_users ?? [];

    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-500">
                Live Activity
            </h3>
            {activities.length === 0 ? (
                <p className="text-sm text-gray-400">No recent activity</p>
            ) : (
                <ul className="space-y-3">
                    {activities.map((activity) => (
                        <li
                            key={activity.id}
                            className="flex items-start justify-between border-b border-gray-100 pb-2 last:border-0"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {activity.escrow_transaction.status}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {activity.funding_status} · $
                                    {activity.escrow_transaction.amount}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(activity.updated_at), {
                                    addSuffix: true,
                                })}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
