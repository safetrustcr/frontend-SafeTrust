import type { Listing } from "@/features/listings";
import { DEMO_MODE } from "@/lib/demo";
import type { Conversation, Message, MessagesSource } from "../model/types";
import { demoMessages } from "./demo";
import { liveMessages } from "./live";

/**
 * Where conversations come from. Hooks read it through `useSyncExternalStore`,
 * so how updates arrive (store events, a Firestore listener, polling) is up to
 * each implementation. See this module's README.
 */
export interface MessagesRepository {
  /** What the signed-in user is looking at; only "demo" can send today. */
  readonly source: MessagesSource;
  /** Calls `onChange` whenever conversations or messages change. Returns unsubscribe. */
  subscribe(onChange: () => void): () => void;
  /** Same array reference until the data changes. "" (signed out) → []. */
  listConversations(uid: string): Conversation[];
  listMessages(uid: string, conversationId: string): Message[];
  /** Opens (creating it once) the guest's conversation with a listing's host. Returns its id. */
  startConversation(uid: string, listing: Listing): string;
  markRead(uid: string, conversationId: string): void;
}

// FE-50: the only place messaging reads DEMO_MODE.
export const messagesRepository: MessagesRepository = DEMO_MODE
  ? demoMessages
  : liveMessages;
