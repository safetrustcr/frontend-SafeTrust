import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SAVED_STAYS_ID, WishlistDetail } from "@/features/listings";

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
