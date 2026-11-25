"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const WISHLIST_STORAGE_KEY = "safetrust-wishlist";
const WISHLIST_META_KEY = "safetrust-wishlist-sync";
export const WISHLIST_STORAGE_VERSION = 1;

type WishlistState = {
  /** uid → saved listing ids (APARTMENT_LISTINGS ids), oldest first. */
  byUser: Record<string, string[]>;
  toggle: (uid: string, listingId: string) => void;
};

type SyncOp = {
  op: "add" | "remove";
  seq: number;
};

type SyncMeta = {
  seq: number;
  ops: Record<string, Record<string, SyncOp>>;
};

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

function probeLocalStorage(): Storage | null {
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
  return null;
}

const usingMemoryStorage =
  typeof window === "undefined" || !probeLocalStorage();

let skipNextPersist = false;

function getActiveStorage(): StateStorage {
  if (!usingMemoryStorage && typeof window !== "undefined") {
    try {
      if (window.localStorage) {
        return window.localStorage;
      }
    } catch {
      // Storage getter blocked after initialization
    }
  }
  return inMemoryStorage;
}

const wishlistStorage: StateStorage = {
  getItem: (key: string) => {
    try {
      return getActiveStorage().getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (skipNextPersist) return;
    if (usingMemoryStorage) {
      inMemoryStorage.setItem(key, value);
      return;
    }
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    try {
      getActiveStorage().removeItem(key);
    } catch {
      // Ignore storage removal errors
    }
  },
};

/**
 * Copies saves written by the old session-only store into localStorage once.
 * A newer localStorage value is kept; the session copy is removed either way.
 */
export function migrateWishlistStorage() {
  if (typeof window === "undefined") return;

  try {
    const legacy = window.sessionStorage?.getItem(WISHLIST_STORAGE_KEY);
    if (legacy == null) return;

    if (window.localStorage?.getItem(WISHLIST_STORAGE_KEY) === null) {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, legacy);
    }
    window.sessionStorage?.removeItem(WISHLIST_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode, quota); the in-memory store still works.
  }
}

migrateWishlistStorage();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnsafeKey(key: string): boolean {
  return key === "__proto__" || key === "constructor" || key === "prototype";
}

function sanitizeByUser(value: unknown): Record<string, string[]> {
  if (!isPlainObject(value)) return {};
  const sanitized: Record<string, string[]> = {};
  for (const [uid, ids] of Object.entries(value)) {
    if (isUnsafeKey(uid)) continue;
    if (Array.isArray(ids) && ids.every((id) => typeof id === "string")) {
      sanitized[uid] = [...ids];
    }
  }
  return sanitized;
}

function getStoredByUser(): Record<string, string[]> {
  try {
    const raw = wishlistStorage.getItem(WISHLIST_STORAGE_KEY);
    if (typeof raw !== "string" || !raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed) || !isPlainObject(parsed.state)) {
      return {};
    }
    return sanitizeByUser(parsed.state.byUser);
  } catch {
    // Storage access or parse failure
  }
  return {};
}

function emptySyncMeta(): SyncMeta {
  return { seq: 0, ops: {} };
}

function readSyncMeta(): SyncMeta {
  try {
    const raw = wishlistStorage.getItem(WISHLIST_META_KEY);
    if (typeof raw !== "string" || !raw) return emptySyncMeta();
    const parsed: unknown = JSON.parse(raw);
    if (
      !isPlainObject(parsed) ||
      typeof parsed.seq !== "number" ||
      !Number.isFinite(parsed.seq) ||
      !isPlainObject(parsed.ops)
    ) {
      return emptySyncMeta();
    }
    const ops: SyncMeta["ops"] = {};
    for (const [uid, userOps] of Object.entries(parsed.ops)) {
      if (isUnsafeKey(uid) || !isPlainObject(userOps)) continue;
      const cleanUserOps: Record<string, SyncOp> = {};
      for (const [id, entry] of Object.entries(userOps)) {
        if (isUnsafeKey(id) || !isPlainObject(entry)) continue;
        if (
          (entry.op === "add" || entry.op === "remove") &&
          typeof entry.seq === "number" &&
          Number.isFinite(entry.seq)
        ) {
          cleanUserOps[id] = { op: entry.op, seq: entry.seq };
        }
      }
      ops[uid] = cleanUserOps;
    }
    return { seq: parsed.seq, ops };
  } catch {
    return emptySyncMeta();
  }
}

// Track operations performed by this tab with monotonic sequence numbers so
// older storage documents do not overwrite newer local changes, while newer
// remote additions and removals still take effect.
const localOps = new Map<string, Map<string, SyncOp>>();

function getLocalOp(uid: string, id: string): SyncOp | undefined {
  return localOps.get(uid)?.get(id);
}

function setLocalOp(uid: string, id: string, entry: SyncOp | undefined) {
  let userOps = localOps.get(uid);
  if (!entry) {
    if (userOps) {
      userOps.delete(id);
      if (userOps.size === 0) {
        localOps.delete(uid);
      }
    }
    return;
  }
  if (!userOps) {
    userOps = new Map();
    localOps.set(uid, userOps);
  }
  userOps.set(id, entry);
}

function clearLocalOps() {
  localOps.clear();
}

function reconcileUserList(
  uid: string,
  baseList: string[],
  meta: SyncMeta,
): string[] {
  const list = [...baseList];
  const userOps = localOps.get(uid);
  if (!userOps) return list;

  for (const [opId, localOp] of Array.from(userOps.entries())) {
    const metaOp = meta.ops[uid]?.[opId];
    if (metaOp && metaOp.seq > localOp.seq) {
      // A newer remote operation supersedes this tab's local operation.
      setLocalOp(uid, opId, undefined);
      continue;
    }
    if (localOp.op === "add") {
      if (!list.includes(opId)) {
        list.push(opId);
      }
    } else if (localOp.op === "remove") {
      const idx = list.indexOf(opId);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
    }
  }
  return list;
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
    (set, get) => ({
      byUser: {},
      toggle: (uid, id) => {
        const prevByUser = get().byUser;
        // Read fresh storage state so writes/removals from other tabs are not overwritten.
        // When browser storage is unavailable, fall back to in-memory state.
        const storedByUser = usingMemoryStorage
          ? { ...prevByUser, ...getStoredByUser() }
          : getStoredByUser();
        const prevMeta = readSyncMeta();
        const currentList = reconcileUserList(
          uid,
          storedByUser[uid] ?? [],
          prevMeta,
        );

        const isSaved = currentList.includes(id);
        const nextList = isSaved
          ? currentList.filter((x) => x !== id)
          : [...currentList, id];

        const nextSeq = prevMeta.seq + 1;
        const nextOp: SyncOp = { op: isSaved ? "remove" : "add", seq: nextSeq };
        const prevLocalOp = getLocalOp(uid, id);
        const nextMeta: SyncMeta = {
          seq: nextSeq,
          ops: {
            ...prevMeta.ops,
            [uid]: {
              ...(prevMeta.ops[uid] ?? {}),
              [id]: nextOp,
            },
          },
        };
        const nextByUser: Record<string, string[]> = {
          ...storedByUser,
          [uid]: nextList,
        };

        setLocalOp(uid, id, nextOp);
        try {
          wishlistStorage.setItem(WISHLIST_META_KEY, JSON.stringify(nextMeta));
          set({ byUser: nextByUser });
        } catch (error) {
          skipNextPersist = true;
          try {
            set({ byUser: prevByUser });
          } finally {
            skipNextPersist = false;
          }
          setLocalOp(uid, id, prevLocalOp);
          try {
            if (prevMeta.seq === 0 && Object.keys(prevMeta.ops).length === 0) {
              wishlistStorage.removeItem(WISHLIST_META_KEY);
            } else {
              wishlistStorage.setItem(
                WISHLIST_META_KEY,
                JSON.stringify(prevMeta),
              );
            }
          } catch {
            // Ignore rollback metadata write error
          }
          throw error;
        }
      },
    }),
    // Demo persistence: this browser only. Replace with Hasura `favorites` when it exists.
    {
      name: WISHLIST_STORAGE_KEY,
      version: WISHLIST_STORAGE_VERSION,
      storage: createJSONStorage(() => wishlistStorage),
      partialize: ({ byUser }) => ({ byUser }),
      migrate: (persisted) => {
        const byUser = isPlainObject(persisted)
          ? sanitizeByUser(persisted.byUser)
          : {};
        return { byUser };
      },
      merge: (persistedState, currentState) => {
        // If persisted wishlist key was cleared, removed, or malformed, reset in-memory saves
        if (
          !isPlainObject(persistedState) ||
          !isPlainObject(persistedState.byUser)
        ) {
          clearLocalOps();
          return {
            ...currentState,
            byUser: {},
          };
        }

        const mergedByUser = sanitizeByUser(persistedState.byUser);
        const meta = readSyncMeta();

        // Reconcile this tab's operations against the stored document and remote op log
        for (const uid of Array.from(localOps.keys())) {
          const list = reconcileUserList(uid, mergedByUser[uid] ?? [], meta);
          if (uid in mergedByUser || list.length > 0) {
            mergedByUser[uid] = list;
          }
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
    clearLocalOps();
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
      clearLocalOps();
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
