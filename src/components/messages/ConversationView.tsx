"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useConversation } from "@/hooks/useConversation";
import { DemoBadge } from "@/components/ui/demo-badge";
import { ConversationThread } from "./ConversationThread";

function ThreadSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading conversation"
      className="flex-1 space-y-3 p-4"
    >
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3">
          {i % 2 === 0 && (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
          )}
          <div className="h-12 w-2/3 rounded-xl bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function ConversationView({
  conversationId,
}: {
  conversationId: string;
}) {
  const {
    conversation,
    messages,
    source,
    currentUserId,
    loading,
    appendMessage,
    markRead,
  } = useConversation(conversationId);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isOwn =
    conversation !== null &&
    (conversation.guest.id === currentUserId ||
      conversation.host.id === currentUserId);

  useEffect(() => {
    if (!isOwn) return;
    markRead();
    headingRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opened conversation
  }, [isOwn, currentUserId, conversationId]);

  // Wait for auth before deciding: the conversation is always missing until
  // the user resolves, so checking it first would 404 every fresh load.
  if (loading) return <ThreadSkeleton />;
  // Same 404 for a missing conversation and someone else's, so the id is
  // never confirmed to exist.
  if (!conversation || !isOwn) notFound();

  const other =
    conversation.guest.id === currentUserId
      ? conversation.host
      : conversation.guest;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b p-4">
        <Link
          href="/dashboard/messages"
          className="inline-flex min-h-11 items-center gap-1 rounded-md pr-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to messages
        </Link>
        <div className="min-w-0">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="truncate font-semibold focus:outline-none"
          >
            {other.first_name} {other.last_name}
          </h2>
          <Link
            href={`/rent/${conversation.listing.id}`}
            className="block truncate text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            {conversation.listing.name}
          </Link>
        </div>
        {source === "demo" && <DemoBadge className="ml-auto" />}
      </div>
      <ConversationThread
        conversationId={conversationId}
        messages={messages}
        currentUserId={currentUserId}
        onSend={appendMessage}
        isDemo={source === "demo"}
      />
    </div>
  );
}
