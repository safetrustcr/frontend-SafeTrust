"use client";

import { useStore } from "zustand";
import { DEMO_MODE } from "@/lib/demo";
import {
  demoConversationId,
  demoConversationStore,
  ensureDemoConversation,
  getDemoConversations,
} from "@/lib/demo/messages";
import type { ApartmentListing } from "@/types/hotel";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useConversations() {
  const { user, loading } = useCurrentUser();
  const started = useStore(demoConversationStore, (s) =>
    user ? s.started[user.uid] : undefined,
  );
  const read = useStore(demoConversationStore, (s) =>
    user ? s.read[user.uid] : undefined,
  );
  const data = user
    ? getDemoConversations(user.uid, {
        includeSamples: DEMO_MODE,
        started,
        read,
      })
    : [];

  return {
    data,
    currentUserId: user?.uid ?? "",
    source: user && DEMO_MODE ? ("demo" as const) : ("none" as const),
    loading,
  };
}

/** Opens (creating it once) the guest's conversation with a listing's host. */
export function startConversation(uid: string, listing: ApartmentListing) {
  // GA-07 swaps this for the messaging API.
  ensureDemoConversation(uid, listing);
  return demoConversationId(listing.id, uid);
}
