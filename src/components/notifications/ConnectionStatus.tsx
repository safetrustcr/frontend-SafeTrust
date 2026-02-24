"use client";

import { useConnectionStatus } from "@/hooks/useConnectionStatus";

const STATUS_CONFIG = {
    connected: { color: "bg-green-500", label: "Connected" },
    reconnecting: { color: "bg-yellow-500", label: "Reconnecting..." },
    disconnected: { color: "bg-red-500", label: "Disconnected" },
} as const;

export function ConnectionStatus() {
    const { connectionState, isOnline } = useConnectionStatus();

    const effectiveState = !isOnline ? "disconnected" : connectionState;
    const { color, label } = STATUS_CONFIG[effectiveState];

    // Hide when connected + online
    if (effectiveState === "connected") return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-gray-900 px-3 py-2 text-sm text-white shadow-lg">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            <span>{!isOnline ? "Offline" : label}</span>
        </div>
    );
}
