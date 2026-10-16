"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  appendDemoMessage,
  getConversation,
  getConversationMessages,
} from "../data/repository";
import type { ConversationMessage } from "../model/types";

export function useConversation(conversationId: string) {
  const { user, loading } = useCurrentUser();
  const [localMessages, setLocalMessages] = useState<{
    key: string;
    messages: ConversationMessage[];
  }>({ key: "", messages: [] });
  const key = user ? `${user.uid}:${conversationId}` : "";
  const conversationResult = getConversation(user?.uid ?? "", conversationId);
  const messagesResult = getConversationMessages(user?.uid ?? "", conversationId);
  const conversation = conversationResult.data;
  const source = conversationResult.source;
  const messages = [
    ...messagesResult.data,
    ...(localMessages.key === key ? localMessages.messages : []),
  ];

  const appendMessage = (body: string) => {
    if (source !== "demo" || !user) return;
    const message = appendDemoMessage(
      user.uid,
      body,
      user.displayName?.split(" ")[0] ?? "Demo guest",
      user.email ?? "",
    );
    if (!message) return;
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
