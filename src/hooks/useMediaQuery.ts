"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media query listener hook using useSyncExternalStore.
 *
 * @param query - CSS media query string (e.g. `(min-width: 1280px)`)
 * @returns boolean indicating whether the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return false;
      }
      return window.matchMedia(query).matches;
    },
    () => false,
  );
}

export default useMediaQuery;
