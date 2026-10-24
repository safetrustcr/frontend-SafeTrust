"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const useWishlistStore = create<{
  /** uid → saved listing ids (APARTMENT_LISTINGS ids), oldest first. */
  byUser: Record<string, string[]>;
  toggle: (uid: string, listingId: string) => void;
}>()(
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
    // Demo persistence: this browser tab only. Replace with Hasura `favorites` when it exists.
    {
      name: "safetrust-wishlist",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ byUser }) => ({ byUser }),
    },
  ),
);

const NO_IDS: string[] = [];

export function useWishlist() {
  const { user, loading } = useCurrentUser();
  const ids = useWishlistStore((s) =>
    user ? (s.byUser[user.uid] ?? NO_IDS) : NO_IDS,
  );
  const toggle = useWishlistStore((s) => s.toggle);

  return {
    loading,
    signedIn: Boolean(user),
    ids,
    isSaved: (listingId: string) => ids.includes(listingId),
    /** Returns whether the stay is saved afterwards; false when signed out. */
    toggle: (listingId: string) => {
      if (!user) return false;
      toggle(user.uid, listingId);
      return !ids.includes(listingId);
    },
  };
}
