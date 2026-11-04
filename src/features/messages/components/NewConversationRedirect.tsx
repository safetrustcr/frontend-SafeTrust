"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useListings } from "@/features/listings";
import { startConversation } from "../hooks/useConversations";
import { MESSAGES_HREF, conversationHref } from "../model/routes";

/** Resolves `?listing=<id>` to the signed-in guest's conversation with its host. */
export function NewConversationRedirect() {
  const router = useRouter();
  const listingId = useSearchParams().get("listing");
  const { user, loading } = useCurrentUser();
  const listing = useListings().find((l) => l.id === listingId);

  useEffect(() => {
    if (loading || !user) return;
    if (!listing) {
      router.replace(MESSAGES_HREF);
      return;
    }
    router.replace(conversationHref(startConversation(user.uid, listing)));
  }, [loading, user, listing, router]);

  return (
    <p role="status" className="p-6 text-sm text-muted-foreground">
      Opening conversation…
    </p>
  );
}
