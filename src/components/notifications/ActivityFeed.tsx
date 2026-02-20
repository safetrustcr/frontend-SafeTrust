"use client";

import React from "react";
import { useSubscription } from "@apollo/client";
import { USER_ESCROW_ACTIVITY_SUBSCRIPTION } from "@/graphql/subscriptions/escrow-subscriptions";
import { UserEscrowActivitySubscription } from "@/graphql/types";
import { formatDistanceToNow } from "date-fns";
import { Activity, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface ActivityFeedProps {
    userId: string;
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
    const { data, loading, error } = useSubscription<UserEscrowActivitySubscription>(
        USER_ESCROW_ACTIVITY_SUBSCRIPTION,
        {
            variables: { userId },
            skip: !userId,
        }
    );

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <Activity className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Failed to load activity feed
            </div>
        );
    }

    const activities = data?.escrow_transaction_users || [];

    if (activities.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No recent activity
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Live Activity
            </h3>

            <div className="space-y-3">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="mt-0.5">
                            {activity.funding_status === "completed" ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <Clock className="w-4 h-4 text-yellow-500" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                Escrow updated: {activity.escrow_transaction.status}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span className="font-mono">
                                    ${activity.escrow_transaction.amount.toLocaleString()}
                                </span>
                                <span>•</span>
                                <span>
                                    {formatDistanceToNow(new Date(activity.updated_at), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
