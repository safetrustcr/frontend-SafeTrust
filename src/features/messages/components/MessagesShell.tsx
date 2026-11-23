import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ConversationListPane } from "./ConversationListPane";

/** The inbox: conversation list beside the open thread (list only on mobile). */
export function MessagesShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-[60dvh] overflow-hidden rounded-xl border border-border bg-background md:h-[calc(100dvh-8rem)] md:grid-cols-[320px_minmax(0,1fr)]",
        className,
      )}
    >
      <h1 className="sr-only">Messages</h1>
      <aside
        aria-label="Conversations"
        className="hidden overflow-y-auto border-r border-border md:block"
      >
        <ConversationListPane />
      </aside>
      <section className="flex min-h-0 min-w-0 flex-col">{children}</section>
    </div>
  );
}
