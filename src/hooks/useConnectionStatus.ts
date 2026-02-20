import { useState, useEffect } from "react";

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Note: True Apollo WS status tracking requires advanced link state manipulation,
  // but we can track the browser networking & tab visibility out of the box.

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Set initial state
    setIsOnline(navigator.onLine);
    setIsTabVisible(document.visibilityState === "visible");

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const status: "connected" | "offline" | "background" = 
    !isOnline ? "offline" : 
    !isTabVisible ? "background" : 
    "connected";

  return { isOnline, isTabVisible, status };
}
