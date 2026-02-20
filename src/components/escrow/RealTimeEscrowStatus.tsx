"use client";

import React from "react";
import { useEscrowSubscription } from "@/hooks/useEscrowSubscription";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface RealTimeEscrowStatusProps {
    escrowId: string;
}

export function RealTimeEscrowStatus({ escrowId }: RealTimeEscrowStatusProps) {
    const { escrow, loading, error } = useEscrowSubscription(escrowId);

    if (loading && !escrow) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting to live updates...
            </div>
        );
    }

    if (error && !escrow) {
        return (
            <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                Live updates disconnected
            </div>
        );
    }

    if (!escrow) return null;

    // Calculate generic progress based on typical escrow states
    const STATUS_STEPS = ["pending", "funded", "completed", "released", "disputed"];
    const currentStepIndex = STATUS_STEPS.indexOf(escrow.status.toLowerCase());
    const progressPercentage = currentStepIndex >= 0
        ? Math.min(100, Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 2)) * 100))
        : 0;

    return (
        <div className="w-full space-y-3 p-4 border rounded-xl bg-card shadow-sm">
            <div className="flex items-center justify-between pointer-events-none">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Current Status
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </div>
                        <h4 className="text-lg font-bold capitalize">
                            {escrow.status}
                        </h4>
                    </div>
                </div>

                {escrow.status.toLowerCase() === "completed" && (
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                )}
            </div>

            <div className="space-y-1">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Pending</span>
                    <span>Funded</span>
                    <span>Completed</span>
                </div>
            </div>
        </div>
    );
}
