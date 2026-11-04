"use client";

import { useState } from "react";
import { messagesRepository } from "../data/repository";
import type { Message } from "../model/types";
import { useConversations } from "./useConversations";

/** One conversation (`data`, null when missing) and its messages. */
export function useConversation(conversationId: string) {
  const {
    data: conversations,
    source,
    currentUserId,
    loading,
  } = useConversations();
  const [localMessages, setLocalMessages] = useState<{
    key: string;
    messages: Message[];
  }>({ key: "", messages: [] });
  const key = currentUserId ? `${currentUserId}:${conversationId}` : "";
  const data = conversations.find((item) => item.id === conversationId) ?? null;
  const messages = data
    ? [
        ...messagesRepository.listMessages(currentUserId, conversationId),
        ...(localMessages.key === key ? localMessages.messages : []),
      ]
    : [];

  // Demo only: a sent message stays in this view until the messaging API
  // (GA-07) gives the repository a send method.
  const appendMessage = (body: string) => {
    if (source !== "demo" || !data) return;
    const sender = data.guest.id === currentUserId ? data.guest : data.host;
    const message: Message = {
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
    data,
    messages,
    source,
    currentUserId,
    loading,
    appendMessage,
    markRead: () => messagesRepository.markRead(currentUserId, conversationId),
  };
}
