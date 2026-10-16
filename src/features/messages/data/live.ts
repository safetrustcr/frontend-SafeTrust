import type { Conversation, ConversationMessage } from "../model/types";

/**
 * Live messaging is intentionally a stub until the backend contract exists.
 * The module README records the subscription strategy so the UI stays
 * independent of Firestore listeners or polling.
 */
export function getLiveConversations(_userId: string): Conversation[] {
  return [];
}

export function getLiveConversationMessages(
  _userId: string,
  _conversationId: string,
): ConversationMessage[] {
  return [];
}

export function getLiveUnreadCount(_userId: string): number {
  return 0;
}
