"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { useConversation } from "@/hooks/useConversation";
import { DemoBadge } from "@/components/ui/demo-badge";
import { EmptyState } from "@/components/ui/EmptyState";

const ConversationThread = dynamic(
  () =>
    import("@/components/messages/ConversationThread").then((m) => ({
      default: m.ConversationThread,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex gap-3 ${i % 2 === 0 ? "" : "justify-end"}`}
          >
            {i % 2 === 0 && (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
            )}
            <div
              className={`h-12 rounded-xl bg-muted animate-pulse ${
                i % 2 === 0 ? "w-48" : "w-40"
              }`}
            />
          </div>
        ))}
      </div>
    ),
  },
);

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  const {
    conversation,
    messages,
    source,
    currentUserId,
    loading,
    appendMessage,
  } = useConversation(conversationId);

  return (
    <div className="h-full flex flex-col">
      {loading ? (
        <div
          className="flex-1"
          role="status"
          aria-label="Loading conversation"
        />
      ) : source === "none" || !conversation ? (
        <EmptyState
          title="No messages yet"
          description="This conversation is not available."
        />
      ) : (
        <>
          <div className="p-4 border-b flex items-center gap-3">
            <div>
              <h2 className="font-semibold">{conversation.apartment.name}</h2>
              <p className="text-sm text-muted-foreground">
                Host: {conversation.host.first_name}{" "}
                {conversation.host.last_name}
              </p>
            </div>
            {source === "demo" && <DemoBadge />}
          </div>
          <ConversationThread
            conversationId={conversationId}
            messages={messages}
            currentUserId={currentUserId}
            onSend={appendMessage}
          />
        </>
      )}
    </div>
  );
}
