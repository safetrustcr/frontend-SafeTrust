"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useApartmentListings } from "@/hooks/useApartmentListings";
import { startConversation } from "@/hooks/useConversations";

/** Resolves `?listing=<id>` to the signed-in guest's conversation with its host. */
export function NewConversationRedirect() {
  const router = useRouter();
  const listingId = useSearchParams().get("listing");
  const { user, loading } = useCurrentUser();
  const listing = useApartmentListings().find((l) => l.id === listingId);

  useEffect(() => {
    if (loading || !user) return;
    if (!listing) {
      router.replace("/dashboard/messages");
      return;
    }
    router.replace(
      `/dashboard/messages/${startConversation(user.uid, listing)}`,
    );
  }, [loading, user, listing, router]);

  return (
    <p role="status" className="p-6 text-sm text-muted-foreground">
      Opening conversation…
    </p>
  );
}
