"use client";

import React from "react";
import { useConnectionStatus } from "@/hooks";
import { Wifi, WifiOff, Activity } from "lucide-react";

export function ConnectionStatus() {
    const { status, isOnline } = useConnectionStatus();

    if (status === "connected") {
        // Hide when everything is fine
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className={`
        flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-medium
        ${status === "offline" ? "bg-red-500 text-white" :
                    status === "reconnecting" ? "bg-orange-500 text-white" :
                        "bg-yellow-500 text-white"}
      `}>
                {status === "offline" ? (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span>Live Updates Disconnected</span>
                    </>
                ) : status === "reconnecting" ? (
                    <>
                        <Activity className="w-4 h-4 animate-spin" />
                        <span>Reconnecting...</span>
                    </>
                ) : (
                    <>
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span>Updates paused (Background)</span>
                    </>
                )}
            </div>
        </div>
    );
}
