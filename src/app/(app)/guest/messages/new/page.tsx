import { Suspense } from "react";
import { NewConversationRedirect } from "@/features/messages";

export default function GuestNewConversationPage() {
  return (
    <Suspense>
      <NewConversationRedirect />
    </Suspense>
  );
}
