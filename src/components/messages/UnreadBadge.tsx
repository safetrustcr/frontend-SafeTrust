"use client";

import { useConversations } from "@/hooks/useConversations";

export function UnreadBadge() {
  const { data, currentUserId } = useConversations();
  const count = data.filter((c) => c.unreadFor.includes(currentUserId)).length;

  if (count === 0) return null;

  return (
    <span className="absolute right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white dark:bg-blue-600">
      {count > 99 ? "99+" : count}
      <span className="sr-only"> unread conversations</span>
    </span>
  );
}
