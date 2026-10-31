"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { formatListingPrice } from "@/components/listings/formatListingPrice";

export interface MobileBookingBarProps {
  nightlyRate: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dismissible?: boolean;
  children: React.ReactNode;
}

/**
 * Sticky bottom Reserve bar and Vaul drawer sheet for mobile room booking.
 */
export function MobileBookingBar({
  nightlyRate,
  open,
  onOpenChange,
  dismissible = true,
  children,
}: MobileBookingBarProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
      dismissible={dismissible}
    >
      <div
        data-testid="mobile-booking-bar"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur xl:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <p className="text-sm">
          <span className="text-lg font-semibold">
            {formatListingPrice(nightlyRate)}
          </span>{" "}
          / night
        </p>
        <Drawer.Trigger asChild>
          <button
            type="button"
            className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Reserve
          </button>
        </Drawer.Trigger>
      </div>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content
          aria-describedby="mobile-booking-drawer-desc"
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl border border-border bg-background outline-none"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
          <Drawer.Title className="px-4 pt-4 text-lg font-semibold text-foreground">
            Book your stay
          </Drawer.Title>
          <Drawer.Description
            id="mobile-booking-drawer-desc"
            className="sr-only"
          >
            Choose dates and guests, review the price and pay into escrow.
          </Drawer.Description>
          <div className="overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default MobileBookingBar;
