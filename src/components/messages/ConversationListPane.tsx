"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { ConversationList } from "./ConversationList";

function ConversationListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading conversations"
      className="flex flex-col divide-y"
    >
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Inbox list shown beside the open thread (desktop) or as the inbox (mobile). */
export function ConversationListPane() {
  // Conversations are scoped to the verified uid inside the hook: demo mode
  // generates them for that uid, and real data relies on BE-03 filtering.
  const { data, currentUserId, source, loading } = useConversations();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-4">
        <h2 className="text-xl font-semibold">Messages</h2>
        {source === "demo" && <DemoBadge />}
      </div>
      {loading ? (
        <ConversationListSkeleton />
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <MessageSquare
            aria-hidden="true"
            className="h-9 w-9 text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground">
            No messages yet. Message a host from any stay.
          </p>
          <Button asChild>
            <Link href="/rent">Browse stays</Link>
          </Button>
        </div>
      ) : (
        <ConversationList conversations={data} currentUserId={currentUserId} />
      )}
    </div>
  );
}
