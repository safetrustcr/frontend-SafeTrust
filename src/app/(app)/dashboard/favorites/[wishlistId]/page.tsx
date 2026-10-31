import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAVED_STAYS_ID } from "@/features/listings/wishlist/saved-stays";
import { WishlistDetail } from "@/features/listings/wishlist/WishlistDetail";

export const metadata: Metadata = { title: "Saved stays" };

export default async function WishlistDetailPage({
  params,
}: {
  params: Promise<{ wishlistId: string }>;
}) {
  const { wishlistId } = await params;
  if (wishlistId !== SAVED_STAYS_ID) notFound();
  return <WishlistDetail />;
}
