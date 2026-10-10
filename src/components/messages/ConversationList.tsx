"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";

type ConversationListProps = {
  conversations: Array<{
    id: string;
    last_message_at: string | null;
    apartment: { name: string };
    host: { id: string; first_name: string; last_name: string };
    guest: { id: string; first_name: string; last_name: string };
    messages: Array<{ body: string; created_at: string; sender: { first_name: string } }>;
  }>;
  currentUserId: string;
};

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  const pathname = usePathname();

  if (!conversations?.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No conversations found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      {conversations.map((conv) => {
        const isHost = conv.host.id === currentUserId;
        const otherParty = isHost ? conv.guest : conv.host;
        const initials = `${otherParty.first_name[0] ?? ""}${otherParty.last_name[0] ?? ""}`.toUpperCase();

        const lastMessage = conv.messages?.[0];
        const isActive = pathname === `/dashboard/messages/${conv.id}`;

        return (
          <Link
            key={conv.id}
            href={`/dashboard/messages/${conv.id}`}
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
              isActive && "bg-muted",
            )}
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium text-sm truncate">
                  {otherParty.first_name} {otherParty.last_name}
                </h3>
                {conv.last_message_at && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {conv.apartment.name}
                </p>
              </div>

              {lastMessage && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  <span className="font-medium mr-1">{lastMessage.sender.first_name}:</span>
                  {lastMessage.body}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
