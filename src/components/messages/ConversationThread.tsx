"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { MessageBubble } from "./MessageBubble";
import { AutomatedEventMessage } from "./AutomatedEventMessage";
import { MessageComposer } from "./MessageComposer";
import { DemoBadge } from "@/components/ui/demo-badge";

type ThreadMessage = {
  id: string;
  body: string;
  is_automated: boolean;
  event_type: string | null;
  read_at: string | null;
  created_at: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};

type ConversationThreadProps = {
  conversationId: string;
  messages: ThreadMessage[];
  currentUserId: string;
  onSend: (body: string) => void;
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
  messages,
  currentUserId,
  onSend,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

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
              isOwn={message.sender.id === currentUserId}
            />
          ),
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-background">
        <div className="px-4 pt-3 text-xs text-muted-foreground flex items-center gap-2">
          <DemoBadge />
          <span>Sample conversation</span>
        </div>
        <MessageComposer
          conversationId={conversationId}
          onSend={onSend}
          isDemo
        />
      </div>
    </div>
  );
}
