import { create } from "zustand";
import type { GeoPoint } from "@/types/destination";

export type GeoStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unavailable"
  | "timeout"
  | "error";

interface LocationState {
  status: GeoStatus;
  /** Rounded to two decimals (~1 km). */
  position: GeoPoint | null;
  /**
   * Bumped by every request and every reset. A geolocation callback only
   * applies while the id it started with is still current, so a cleared or
   * superseded request can never write a late result.
   */
  requestId: number;
  /**
   * Whether the listing that asked for the position wants results re-sorted
   * by distance once it arrives. The search composer asks without sorting.
   */
  autoSortOnPosition: boolean;
}

/**
 * Session-only location for the current tab.
 *
 * Privacy: the position lives in memory only. It is never written to
 * localStorage, sessionStorage, cookies or the URL, never sent to a backend or
 * analytics, and is rounded to two decimals before it is stored. A reload,
 * "Clear location", revoking the permission or logging out discards it.
 */
export const useLocationStore = create<LocationState>(() => ({
  status: "idle",
  position: null,
  requestId: 0,
  autoSortOnPosition: false,
}));

/** Forgets the position and invalidates any pending geolocation callback. */
export function resetLocation() {
  useLocationStore.setState((state) => ({
    status: "idle",
    position: null,
    requestId: state.requestId + 1,
    autoSortOnPosition: false,
  }));
}
