import { Suspense, type ReactNode } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { LazyHotelHeader as HotelHeader } from "@/features/listings";

/** Guest wishlists: the public site header, no dashboard sidebar or host tools. */
export default function GuestWishlistsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <HotelHeader />
      </Suspense>
      <PageContainer className="py-6 md:py-8">{children}</PageContainer>
    </div>
  );
}
