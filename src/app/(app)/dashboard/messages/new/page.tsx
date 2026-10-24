import { Suspense } from "react";
import { NewConversationRedirect } from "@/components/messages/NewConversationRedirect";

export default function NewConversationPage() {
  return (
    <Suspense>
      <NewConversationRedirect />
    </Suspense>
  );
}
