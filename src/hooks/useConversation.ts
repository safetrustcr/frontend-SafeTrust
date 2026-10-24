"use client";

import { useState } from "react";
import {
  getDemoMessages,
  markDemoConversationRead,
  type DemoMessage,
} from "@/lib/demo/messages";
import { useConversations } from "@/hooks/useConversations";

export function useConversation(conversationId: string) {
  const { data, source, currentUserId, loading } = useConversations();
  const [localMessages, setLocalMessages] = useState<{
    key: string;
    messages: DemoMessage[];
  }>({ key: "", messages: [] });
  const key = currentUserId ? `${currentUserId}:${conversationId}` : "";
  const conversation = data.find((item) => item.id === conversationId) ?? null;
  const messages = conversation
    ? [
        ...getDemoMessages(currentUserId, conversationId),
        ...(localMessages.key === key ? localMessages.messages : []),
      ]
    : [];

  const appendMessage = (body: string) => {
    if (source !== "demo" || !conversation) return;
    const sender =
      conversation.guest.id === currentUserId
        ? conversation.guest
        : conversation.host;
    const message: DemoMessage = {
      isDemo: true,
      id: `demo-message-sent-${Date.now()}`,
      body,
      is_automated: false,
      event_type: null,
      read_at: null,
      created_at: new Date().toISOString(),
      sender: { ...sender, email: "" },
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
    currentUserId,
    loading,
    appendMessage,
    markRead: () => markDemoConversationRead(currentUserId, conversationId),
  };
}
