"use client";

import type { GeoPoint } from "@/types/destination";
import { useEffect, useSyncExternalStore } from "react";

export type GeoStatus =
  "idle" | "prompting" | "granted" | "denied" | "unavailable" | "error";

export interface GeolocationRequestOptions {
  autoSort?: boolean;
}

interface GeolocationState {
  status: GeoStatus;
  position: GeoPoint | null;
  autoSortOnPosition: boolean;
}

const INITIAL_STATE: GeolocationState = {
  status: "idle",
  position: null,
  autoSortOnPosition: false,
};

let state = INITIAL_STATE;
let initialized = false;
let requestInProgress = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function updateState(patch: Partial<GeolocationState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function initializeGeolocation() {
  if (initialized) return;
  initialized = true;

  if (
    typeof navigator === "undefined" ||
    !("geolocation" in navigator) ||
    !window.isSecureContext
  ) {
    updateState({ status: "unavailable" });
    return;
  }

  navigator.permissions
    ?.query({ name: "geolocation" as PermissionName })
    .then((permission) => {
      if (permission.state === "denied" && state.status === "idle") {
        updateState({ status: "denied" });
      }
    })
    .catch(() => {});
}

function request(options: GeolocationRequestOptions = {}) {
  if (
    requestInProgress ||
    state.status === "unavailable" ||
    state.status === "denied" ||
    state.status === "granted" ||
    state.status === "prompting"
  ) {
    return;
  }

  requestInProgress = true;
  updateState({
    autoSortOnPosition: options.autoSort ?? true,
    status: "prompting",
  });
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      requestInProgress = false;
      updateState({
        position: {
          lat: Number(coords.latitude.toFixed(2)),
          lng: Number(coords.longitude.toFixed(2)),
        },
        status: "granted",
      });
    },
    (error) => {
      requestInProgress = false;
      updateState({
        status: error.code === error.PERMISSION_DENIED ? "denied" : "error",
      });
    },
    { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
  );
}

function clear() {
  requestInProgress = false;
  updateState({
    autoSortOnPosition: false,
    position: null,
    status: "idle",
  });
}

export function useGeolocation() {
  const geo = useSyncExternalStore(subscribe, getSnapshot, () => INITIAL_STATE);

  useEffect(() => {
    initializeGeolocation();
  }, []);

  return { ...geo, request, clear };
}

export function resetGeolocationForTests() {
  initialized = false;
  requestInProgress = false;
  updateState(INITIAL_STATE);
}
