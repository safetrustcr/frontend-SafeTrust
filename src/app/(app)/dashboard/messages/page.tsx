import { ConversationListPane } from "@/components/messages/ConversationListPane";

export default function MessagesPage() {
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
