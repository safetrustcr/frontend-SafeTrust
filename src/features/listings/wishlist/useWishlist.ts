"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const WISHLIST_STORAGE_KEY = "safetrust-wishlist";
export const WISHLIST_STORAGE_VERSION = 1;

type WishlistState = {
  /** uid → saved listing ids (APARTMENT_LISTINGS ids), oldest first. */
  byUser: Record<string, string[]>;
  toggle: (uid: string, listingId: string) => void;
};

type PersistedWishlist = Pick<WishlistState, "byUser">;

/**
 * Copies saves written by the old session-only store into localStorage once.
 * A newer localStorage value is kept; the session copy is removed either way.
 */
export function migrateWishlistStorage() {
  if (typeof window === "undefined") return;

  try {
    const legacy = window.sessionStorage.getItem(WISHLIST_STORAGE_KEY);
    if (legacy === null) return;

    if (window.localStorage.getItem(WISHLIST_STORAGE_KEY) === null) {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, legacy);
    }
    window.sessionStorage.removeItem(WISHLIST_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, quota); the in-memory store still works.
  }
}

migrateWishlistStorage();

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      byUser: {},
      toggle: (uid, id) =>
        set((s) => {
          const current = s.byUser[uid] ?? [];
          const next = current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id];
          return { byUser: { ...s.byUser, [uid]: next } };
        }),
    }),
    // Demo persistence: this browser only. Replace with Hasura `favorites` when it exists.
    {
      name: WISHLIST_STORAGE_KEY,
      version: WISHLIST_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ byUser }) => ({ byUser }),
      migrate: (persisted) => {
        const saved = persisted as Partial<PersistedWishlist> | null;
        return { byUser: saved?.byUser ?? {} };
      },
    },
  ),
);

let storageSubscribers = 0;

function handleWishlistStorage(event: StorageEvent) {
  if (event.storageArea !== window.localStorage) return;
  if (event.key !== WISHLIST_STORAGE_KEY && event.key !== null) return;
  void useWishlistStore.persist.rehydrate();
}

/** One shared `storage` listener for every mounted wishlist consumer. */
function subscribeToWishlistStorage() {
  if (typeof window === "undefined") return () => {};

  storageSubscribers += 1;
  if (storageSubscribers === 1) {
    window.addEventListener("storage", handleWishlistStorage);
  }

  return () => {
    storageSubscribers -= 1;
    if (storageSubscribers === 0) {
      window.removeEventListener("storage", handleWishlistStorage);
    }
  };
}

function useWishlistHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const markHydrated = () => setHydrated(true);

    // Start neutral on the server and first client render, then flip once the
    // persisted store is available. Reading hasHydrated() as initial state
    // would diverge from the SSR markup and trigger a hydration warning.
    if (useWishlistStore.persist.hasHydrated()) {
      markHydrated();
      return;
    }

    return useWishlistStore.persist.onFinishHydration(markHydrated);
  }, []);

  return hydrated;
}

const NO_IDS: string[] = [];

export function useWishlist() {
  const { user, loading } = useCurrentUser();
  const hydrated = useWishlistHydrated();
  const storedIds = useWishlistStore((s) =>
    user ? (s.byUser[user.uid] ?? NO_IDS) : NO_IDS,
  );
  const ids = hydrated ? storedIds : NO_IDS;
  const toggle = useWishlistStore((s) => s.toggle);

  useEffect(() => subscribeToWishlistStorage(), []);

  return {
    loading: loading || !hydrated,
    hydrated,
    signedIn: Boolean(user),
    ids,
    isSaved: (listingId: string) => ids.includes(listingId),
    /** Returns whether the stay is saved afterwards; false when signed out. */
    toggle: (listingId: string) => {
      if (!user || !hydrated) return false;
      toggle(user.uid, listingId);
      return !ids.includes(listingId);
    },
  };
}
