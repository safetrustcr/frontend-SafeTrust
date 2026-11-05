import { Suspense } from "react";
import { NewConversationRedirect } from "@/features/messages";

export default function NewConversationPage() {
  return (
    <Suspense>
      <NewConversationRedirect />
    </Suspense>
  );
}
