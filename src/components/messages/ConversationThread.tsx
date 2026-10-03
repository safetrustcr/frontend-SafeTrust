"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { MOCK_MESSAGES } from "@/lib/mockData/messages";
import { MessageBubble } from "./MessageBubble";
import { AutomatedEventMessage } from "./AutomatedEventMessage";
import { MessageComposer } from "./MessageComposer";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type ConversationThreadProps = {
  conversationId: string;
  apartmentId: string;
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    maxHeight: "calc(100vh - 12rem)",
  } satisfies CSSProperties,
  messageList: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "1rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  } satisfies CSSProperties,
} as const;

export function ConversationThread({
  conversationId,
  apartmentId,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useCurrentUser();
  const messages = MOCK_MESSAGES[conversationId] ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div style={styles.container}>
      <div style={styles.messageList}>
        {messages.map((message) =>
          message.is_automated ? (
            <AutomatedEventMessage key={message.id} message={message} />
          ) : (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={user ? message.sender.id === user.uid : false}
            />
          ),
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        conversationId={conversationId}
        senderId={user?.uid ?? ""}
        apartmentId={apartmentId}
      />
    </div>
  );
}
