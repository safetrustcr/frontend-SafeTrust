"use client";

import type { GeoPoint } from "@/types/destination";
import { useCallback, useEffect, useRef, useState } from "react";

export type GeoStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const requestInProgress = useRef(false);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !("geolocation" in navigator) ||
      !window.isSecureContext
    ) {
      setStatus("unavailable");
      return;
    }

    let active = true;
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((permission) => {
        if (active && permission.state === "denied") setStatus("denied");
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const request = useCallback(() => {
    if (
      requestInProgress.current ||
      status === "unavailable" ||
      status === "denied" ||
      status === "granted" ||
      status === "prompting"
    ) {
      return;
    }

    requestInProgress.current = true;
    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        requestInProgress.current = false;
        setPosition({
          lat: Number(coords.latitude.toFixed(2)),
          lng: Number(coords.longitude.toFixed(2)),
        });
        setStatus("granted");
      },
      (error) => {
        requestInProgress.current = false;
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );
  }, [status]);

  const clear = useCallback(() => {
    requestInProgress.current = false;
    setPosition(null);
    setStatus("idle");
  }, []);

  return { status, position, request, clear };
}
