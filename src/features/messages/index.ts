// Public API of the messages feature. app/, other features and shared code
// import messaging only from "@/features/messages" (enforced by ESLint).

// Pages: /dashboard/messages (hosts) and /guest/messages (guests), each with
// /[conversationId] and /new.
export { ConversationListPane } from "./components/ConversationListPane";
export { MessagesArea } from "./components/MessagesArea";
export { MessagesShell } from "./components/MessagesShell";
export { ConversationView } from "./components/ConversationView";
export { NewConversationRedirect } from "./components/NewConversationRedirect";

// Building blocks
export { ConversationList } from "./components/ConversationList";
export { ConversationThread } from "./components/ConversationThread";
export { UnreadBadge } from "./components/UnreadBadge";

// Hooks (data comes from data/repository.ts)
export { useConversations, startConversation } from "./hooks/useConversations";
export { useConversation } from "./hooks/useConversation";

// Routes
export {
  MESSAGES_HREF,
  GUEST_MESSAGES_HREF,
  conversationHref,
} from "./model/routes";

// Public types
export type * from "./model/types";
