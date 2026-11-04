import type { Metadata } from "next";
import { WishlistsIndex } from "@/features/listings";

export const metadata: Metadata = { title: "Wishlists" };

export default function FavoritesPage() {
  return <WishlistsIndex />;
}
