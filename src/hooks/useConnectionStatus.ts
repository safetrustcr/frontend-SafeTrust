import { useState, useEffect, useCallback } from "react";

export type ConnectionState = "connected" | "disconnected" | "reconnecting";

// Create a global state proxy since the hook can be used in multiple places 
// but the WebSocket connection is centralized in apollo.ts
let globalConnectionState: ConnectionState = "disconnected";
const connectionStateListeners = new Set<(state: ConnectionState) => void>();

export const updateGlobalConnectionState = (state: ConnectionState) => {
  globalConnectionState = state;
  connectionStateListeners.forEach((listener) => listener(state));
};

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>(globalConnectionState);

  useEffect(() => {
    // Sync state with global WebSocket state
    const handleConnectionChange = (state: ConnectionState) => {
      setConnectionState(state);
    };
    
    connectionStateListeners.add(handleConnectionChange);
    // Initial sync just in case
    setConnectionState(globalConnectionState);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleVisibility = () =>
      setIsTabVisible(document.visibilityState === "visible");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      connectionStateListeners.delete(handleConnectionChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const updateConnectionState = useCallback((state: ConnectionState) => {
    updateGlobalConnectionState(state);
  }, []);

  // Compute a derived general status for backwards compatibility with the UI component
  let status: "connected" | "offline" | "background" | "reconnecting" = "connected";
  if (!isOnline || connectionState === "disconnected") status = "offline";
  else if (connectionState === "reconnecting") status = "reconnecting";
  else if (!isTabVisible) status = "background";

  return {
    isConnected: connectionState === "connected",
    isOnline,
    isTabVisible,
    connectionState,
    updateConnectionState,
    status, // Included for ConnectionStatus UI component
  };
}
