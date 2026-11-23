import { Suspense, type ReactNode } from "react";
import { PageContainer } from "@/components/layouts/PageContainer";
import { LazyHotelHeader as HotelHeader } from "@/features/listings";
import {
  GUEST_MESSAGES_HREF,
  MessagesArea,
  MessagesShell,
} from "@/features/messages";

/** Guest inbox: the public site header, no dashboard sidebar or host tools. */
export default function GuestMessagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <HotelHeader />
      </Suspense>
      <PageContainer className="py-6 md:py-8">
        <MessagesArea base={GUEST_MESSAGES_HREF} guestOnly>
          <MessagesShell className="md:h-[calc(100dvh-11rem)]">
            {children}
          </MessagesShell>
        </MessagesArea>
      </PageContainer>
    </div>
  );
}
