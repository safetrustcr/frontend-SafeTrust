"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/lib/demo";
import {
  getDemoConversations,
  getDemoMessages,
  type DemoMessage,
} from "@/lib/demo/messages";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useConversation(conversationId: string) {
  const { user, loading } = useCurrentUser();
  const [localMessages, setLocalMessages] = useState<{
    key: string;
    messages: DemoMessage[];
  }>({ key: "", messages: [] });
  const key = user ? `${user.uid}:${conversationId}` : "";
  const source = user && DEMO_MODE ? ("demo" as const) : ("none" as const);
  const messages =
    source === "demo" && user
      ? [
          ...getDemoMessages(user.uid, conversationId),
          ...(localMessages.key === key ? localMessages.messages : []),
        ]
      : [];
  const conversation =
    source === "demo" && user
      ? (getDemoConversations(user.uid).find(
          (item) => item.id === conversationId,
        ) ?? null)
      : null;

  const appendMessage = (body: string) => {
    if (source !== "demo" || !user) return;
    const message: DemoMessage = {
      isDemo: true,
      id: `demo-message-sent-${Date.now()}`,
      body,
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date().toISOString(),
      sender: {
        id: user.uid,
        first_name: user.displayName?.split(" ")[0] ?? "Demo guest",
        last_name: "",
        email: user.email ?? "",
      },
    };
    setLocalMessages((current) => ({
      key,
      messages: [...(current.key === key ? current.messages : []), message],
    }));
  };

  return {
    conversation,
    messages,
    source,
    currentUserId: user?.uid ?? "",
    loading,
    appendMessage,
  };
}
