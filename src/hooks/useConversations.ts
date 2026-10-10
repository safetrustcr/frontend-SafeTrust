"use client";

import { DEMO_MODE } from "@/lib/demo";
import { getDemoConversations } from "@/lib/demo/messages";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useConversations() {
  const { user, loading } = useCurrentUser();
  const data = user && DEMO_MODE ? getDemoConversations(user.uid) : [];

  return {
    data,
    currentUserId: user?.uid ?? "",
    source: user && DEMO_MODE ? ("demo" as const) : ("none" as const),
    loading,
  };
}
