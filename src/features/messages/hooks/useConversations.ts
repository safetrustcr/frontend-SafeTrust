"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getConversations } from "../data/repository";

export function useConversations() {
  const { user, loading } = useCurrentUser();
  const result = getConversations(user?.uid ?? "");

  return {
    data: result.data,
    currentUserId: user?.uid ?? "",
    source: result.source,
    loading,
  };
}
