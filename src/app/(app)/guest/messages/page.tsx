import { ConversationListPane } from "@/features/messages";

export default function GuestMessagesPage() {
  return (
    <>
      <div className="md:hidden">
        <ConversationListPane />
      </div>
      <p className="m-auto hidden text-sm text-muted-foreground md:block">
        Select a conversation
      </p>
    </>
  );
}
