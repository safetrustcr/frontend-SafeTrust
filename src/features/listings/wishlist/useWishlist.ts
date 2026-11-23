"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const WISHLIST_STORAGE_KEY = "safetrust-wishlist";
export const WISHLIST_STORAGE_VERSION = 1;

type WishlistState = {
  /** uid → saved listing ids (APARTMENT_LISTINGS ids), oldest first. */
  byUser: Record<string, string[]>;
  toggle: (uid: string, listingId: string) => void;
};

type PersistedWishlist = Pick<WishlistState, "byUser">;

const memoryStore = new Map<string, string>();
const inMemoryStorage: StateStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memoryStore.set(key, value);
  },
  removeItem: (key: string) => {
    memoryStore.delete(key);
  },
};

function getSafeLocalStorage(): StateStorage {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const probeKey = "__safetrust_storage_probe__";
      window.localStorage.setItem(probeKey, "1");
      window.localStorage.removeItem(probeKey);
      return window.localStorage;
    }
  } catch {
    // Storage can be unavailable or blocked by browser privacy policy
  }
  return inMemoryStorage;
}

/**
 * Copies saves written by the old session-only store into localStorage once.
 * A newer localStorage value is kept; the session copy is removed either way.
 */
export function migrateWishlistStorage() {
  if (typeof window === "undefined") return;

  try {
    const legacy = window.sessionStorage?.getItem(WISHLIST_STORAGE_KEY);
    if (legacy === null) return;

    if (window.localStorage?.getItem(WISHLIST_STORAGE_KEY) === null) {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, legacy);
    }
    window.sessionStorage?.removeItem(WISHLIST_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, quota); the in-memory store still works.
  }
}

migrateWishlistStorage();

function getStoredByUser(): Record<string, string[]> {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage?.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const byUser = parsed?.state?.byUser;
    if (byUser && typeof byUser === "object" && !Array.isArray(byUser)) {
      return byUser as Record<string, string[]>;
    }
  } catch {
    // Storage access or parse failure
  }
  return {};
}

// Track local saves made in this tab so storage-event rehydration from older documents
// does not overwrite newer in-memory saves before storage catches up.
const localSaves = new Map<string, Set<string>>();

function trackLocalSave(uid: string, id: string) {
  let userSaves = localSaves.get(uid);
  if (!userSaves) {
    userSaves = new Set();
    localSaves.set(uid, userSaves);
  }
  userSaves.add(id);
}

function untrackLocalSave(uid: string, id: string) {
  const userSaves = localSaves.get(uid);
  if (userSaves) {
    userSaves.delete(id);
    if (userSaves.size === 0) {
      localSaves.delete(uid);
    }
  }
}

function clearLocalSaves() {
  localSaves.clear();
}

let hasHydrationFailed = false;
const hydrationErrorListeners = new Set<() => void>();

function notifyHydrationError() {
  hasHydrationFailed = true;
  hydrationErrorListeners.forEach((listener) => listener());
}

function subscribeHydrationError(cb: () => void) {
  hydrationErrorListeners.add(cb);
  return () => {
    hydrationErrorListeners.delete(cb);
  };
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      byUser: {},
      toggle: (uid, id) =>
        set((s) => {
          // Read fresh storage state so writes from other tabs are not overwritten
          const storedByUser = getStoredByUser();
          const mergedByUser: Record<string, string[]> = {
            ...s.byUser,
            ...storedByUser,
          };

          const storedList = storedByUser[uid] ?? [];
          const memoryList = s.byUser[uid] ?? [];

          // Union known saves from storage and memory (preserving order)
          const currentKnown = [...storedList];
          for (const item of memoryList) {
            if (!currentKnown.includes(item)) {
              currentKnown.push(item);
            }
          }

          const isSaved = currentKnown.includes(id);
          const next = isSaved
            ? currentKnown.filter((x) => x !== id)
            : [...currentKnown, id];

          if (!isSaved) {
            trackLocalSave(uid, id);
          } else {
            untrackLocalSave(uid, id);
          }

          mergedByUser[uid] = next;
          return { byUser: mergedByUser };
        }),
    }),
    // Demo persistence: this browser only. Replace with Hasura `favorites` when it exists.
    {
      name: WISHLIST_STORAGE_KEY,
      version: WISHLIST_STORAGE_VERSION,
      storage: createJSONStorage(() => getSafeLocalStorage()),
      partialize: ({ byUser }) => ({ byUser }),
      migrate: (persisted) => {
        const saved = persisted as Partial<PersistedWishlist> | null;
        return { byUser: saved?.byUser ?? {} };
      },
      merge: (persistedState, currentState) => {
        const saved = persistedState as
          Partial<PersistedWishlist> | null | undefined;
        // If persisted wishlist key was cleared or removed, reset in-memory saves
        if (!saved || !saved.byUser) {
          clearLocalSaves();
          return {
            ...currentState,
            byUser: {},
          };
        }

        const mergedByUser: Record<string, string[]> = { ...saved.byUser };

        // Ensure storage-event rehydration does not replace newer in-memory saves with an older document
        for (const [uid, userSaves] of localSaves.entries()) {
          const list = [...(mergedByUser[uid] ?? [])];
          for (const id of userSaves) {
            if (!list.includes(id)) {
              list.push(id);
            }
          }
          mergedByUser[uid] = list;
        }

        return {
          ...currentState,
          byUser: mergedByUser,
        };
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          notifyHydrationError();
        } else {
          hasHydrationFailed = false;
        }
      },
    },
  ),
);

useWishlistStore.subscribe((state) => {
  if (Object.keys(state.byUser).length === 0) {
    clearLocalSaves();
  }
});

let storageSubscribers = 0;

function handleWishlistStorage(event: StorageEvent) {
  if (typeof window === "undefined") return;
  try {
    if (
      event.storageArea !== null &&
      event.storageArea !== window.localStorage
    ) {
      return;
    }
  } catch {
    return;
  }
  if (event.key !== WISHLIST_STORAGE_KEY && event.key !== null) return;

  try {
    if (
      event.key === null ||
      event.newValue === null ||
      window.localStorage?.getItem(WISHLIST_STORAGE_KEY) === null
    ) {
      clearLocalSaves();
    }
  } catch {
    // Ignore storage read errors
  }

  void useWishlistStore.persist?.rehydrate?.();
}

/** One shared `storage` listener for every mounted wishlist consumer. */
function subscribeToWishlistStorage() {
  if (typeof window === "undefined") return () => {};

  storageSubscribers += 1;
  if (storageSubscribers === 1) {
    try {
      window.addEventListener("storage", handleWishlistStorage);
    } catch {
      // Ignore
    }
    // Re-read writes made while no listener was attached.
    void useWishlistStore.persist?.rehydrate?.();
  }

  return () => {
    storageSubscribers -= 1;
    if (storageSubscribers === 0) {
      try {
        window.removeEventListener("storage", handleWishlistStorage);
      } catch {
        // Ignore
      }
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
    const persistApi = useWishlistStore.persist;
    if (!persistApi || persistApi.hasHydrated?.() || hasHydrationFailed) {
      markHydrated();
      return;
    }

    const unsubFinish = persistApi.onFinishHydration?.(markHydrated);
    const unsubError = subscribeHydrationError(markHydrated);

    return () => {
      unsubFinish?.();
      unsubError();
    };
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
      return (
        useWishlistStore.getState().byUser[user.uid]?.includes(listingId) ??
        false
      );
    },
  };
}
