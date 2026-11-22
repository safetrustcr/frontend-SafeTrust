import type { Metadata } from "next";
import { HotelHeader, WishlistsIndex } from "@/features/listings";

export const metadata: Metadata = {
  title: "Wishlists",
};

export default function WishlistsPage() {
  return (
    <>
      <HotelHeader />
      <main>
        <WishlistsIndex />
      </main>
    </>
  );
}
