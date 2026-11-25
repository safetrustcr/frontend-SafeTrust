"use client";

import { useSyncExternalStore } from "react";
import type { Listing } from "@/features/listings";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { messagesRepository } from "../data/repository";
import type { Conversation, MessagesSource } from "../model/types";

const NO_CONVERSATIONS: Conversation[] = [];
const serverSnapshot = () => NO_CONVERSATIONS;

/** The signed-in user's conversations, kept current by the messages repository. */
export function useConversations() {
  const { user, loading } = useCurrentUser();
  const currentUserId = user?.uid ?? "";
  const data = useSyncExternalStore(
    messagesRepository.subscribe,
    () => messagesRepository.listConversations(currentUserId),
    serverSnapshot,
  );
  const source: MessagesSource = user ? messagesRepository.source : "none";

  return { data, source, currentUserId, loading };
}

/** Opens (creating it once) the guest's conversation with a listing's host. */
export function startConversation(uid: string, listing: Listing) {
  return messagesRepository.startConversation(uid, listing);
}
