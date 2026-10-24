"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loginHref } from "@/components/navigation/account-routes";
import { useWishlist } from "./useWishlist";

/**
 * ♥ behaviour shared by every listing view: toggles the saved stay and
 * returns a message for an `aria-live` region, or sends signed-out
 * visitors to log in (and back here) instead of pretending to save.
 */
export function useSaveStay() {
  const wishlist = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState("");

  const toggleSaved = (listingId: string) => {
    if (wishlist.loading) return;
    if (!wishlist.signedIn) {
      router.push(loginHref(pathname));
      return;
    }
    const saved = wishlist.toggle(listingId);
    setAnnouncement(saved ? "Saved to Wishlists" : "Removed from Wishlists");
  };

  return { isSaved: wishlist.isSaved, toggleSaved, announcement };
}
