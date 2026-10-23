"use client";

import { useCallback, useEffect, useState } from "react";
import {
  resetLocation,
  useLocationStore,
  type GeoStatus,
} from "./location-store";

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 10 * 60_000,
};

// GeolocationPositionError codes (W3C Geolocation API).
const PERMISSION_DENIED = 1;
const TIMEOUT = 3;

/** ~1 km: enough to sort nearby stays, too coarse to pinpoint a home. */
const round = (value: number) => Number(value.toFixed(2));

const isSupported = () =>
  typeof navigator !== "undefined" &&
  "geolocation" in navigator &&
  window.isSecureContext;

/** Applies `patch` only if no newer request or reset happened since `id`. */
function settle(
  id: number,
  patch: Partial<ReturnType<typeof useLocationStore.getState>>,
) {
  useLocationStore.setState((state) =>
    state.requestId === id ? patch : state,
  );
}

function applyPermission(state: PermissionState) {
  if (state === "denied") {
    // Revoked (or blocked): drop any granted position and pending callbacks.
    useLocationStore.setState((current) => ({
      status: "denied",
      position: null,
      requestId: current.requestId + 1,
    }));
  } else if (useLocationStore.getState().status === "denied") {
    // Re-allowed in the browser: retrying works again without a reload.
    useLocationStore.setState({ status: "idle" });
  }
}

/**
 * Opt-in browser location, shared by every component in the tab.
 *
 * Privacy: the position is rounded to two decimals and kept in memory only
 * (see `useLocationStore`). It is never persisted or transmitted; it survives
 * in-tab navigation until the user clears it, revokes the permission, logs
 * out or reloads the page.
 */
export function useGeolocation() {
  const status = useLocationStore((state) => state.status);
  const position = useLocationStore((state) => state.position);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (!isSupported()) {
      setUnsupported(true);
      return;
    }

    let disposed = false;
    let permission: PermissionStatus | null = null;
    const onChange = () => {
      if (permission) applyPermission(permission.state);
    };

    // Permissions API is optional (and query can throw or reject): without
    // it the request result alone decides the status.
    Promise.resolve()
      .then(() =>
        navigator.permissions?.query({
          name: "geolocation" as PermissionName,
        }),
      )
      .then((result) => {
        if (disposed || !result) return;
        permission = result;
        applyPermission(result.state);
        result.addEventListener("change", onChange);
      })
      .catch(() => {});

    return () => {
      disposed = true;
      permission?.removeEventListener("change", onChange);
    };
  }, []);

  const request = useCallback(() => {
    if (!isSupported()) return;
    const current = useLocationStore.getState();
    if (current.status === "prompting") return;

    const id = current.requestId + 1;
    useLocationStore.setState({ status: "prompting", requestId: id });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        settle(id, {
          status: "granted",
          position: {
            lat: round(coords.latitude),
            lng: round(coords.longitude),
          },
        }),
      (error) => {
        const next: GeoStatus =
          error.code === PERMISSION_DENIED
            ? "denied"
            : error.code === TIMEOUT
              ? "timeout"
              : "error";
        settle(
          id,
          next === "denied"
            ? { status: next, position: null }
            : { status: next },
        );
      },
      GEO_OPTIONS,
    );
  }, []);

  return {
    status: unsupported ? ("unavailable" as const) : status,
    position: unsupported ? null : position,
    request,
    clear: resetLocation,
  };
}
