import { DEMO_MODE } from "@/lib/demo";
import {
  getDemoConversations,
  getDemoMessages,
  type DemoMessage,
} from "./demo";
import {
  getLiveConversationMessages,
  getLiveConversations,
  getLiveUnreadCount,
} from "./live";
import type {
  Conversation,
  ConversationMessage,
  MessageSource,
  RepositoryResult,
} from "../model/types";

const sourceFor = (userId: string): MessageSource => {
  if (!userId) return "none";
  return DEMO_MODE ? "demo" : "live";
};

export function getConversations(userId: string): RepositoryResult<Conversation[]> {
  const source = sourceFor(userId);
  if (source === "demo") {
    return { data: getDemoConversations(userId), source };
  }
  if (source === "live") {
    return { data: getLiveConversations(userId), source };
  }
  return { data: [], source };
}

export function getConversation(
  userId: string,
  conversationId: string,
): RepositoryResult<Conversation | null> {
  const result = getConversations(userId);
  return {
    data: result.data.find((conversation) => conversation.id === conversationId) ?? null,
    source: result.source,
  };
}

export function getConversationMessages(
  userId: string,
  conversationId: string,
): RepositoryResult<ConversationMessage[]> {
  const source = sourceFor(userId);
  if (source === "demo") {
    return { data: getDemoMessages(userId, conversationId), source };
  }
  if (source === "live") {
    return { data: getLiveConversationMessages(userId, conversationId), source };
  }
  return { data: [], source };
}

export function getUnreadCount(userId: string): number {
  const source = sourceFor(userId);
  if (source === "demo") return 3;
  if (source === "live") return getLiveUnreadCount(userId);
  return 0;
}

export function appendDemoMessage(
  userId: string,
  body: string,
  firstName = "Demo guest",
  email = `${userId.slice(0, 8)}@demo.invalid`,
): DemoMessage | null {
  if (sourceFor(userId) !== "demo") return null;
  return {
    isDemo: true,
    id: `demo-message-sent-${Date.now()}`,
    body,
    is_automated: false,
    event_type: null,
    read_at: null,
    created_at: new Date().toISOString(),
    sender: {
      id: userId,
      first_name: firstName,
      last_name: "",
      email,
    },
  };
}

