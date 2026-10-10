"use client";

import type { GeoPoint } from "@/types/destination";
import { useCallback, useEffect, useState } from "react";

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
    if (status === "unavailable" || status === "denied") return;

    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({
          lat: Number(coords.latitude.toFixed(2)),
          lng: Number(coords.longitude.toFixed(2)),
        });
        setStatus("granted");
      },
      (error) =>
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );
  }, [status]);

  const clear = useCallback(() => {
    setPosition(null);
    setStatus("idle");
  }, []);

  return { status, position, request, clear };
}
