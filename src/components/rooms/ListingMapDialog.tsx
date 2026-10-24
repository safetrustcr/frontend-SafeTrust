"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isValidCoordinate } from "@/lib/geo";

const HotelMap = dynamic(() => import("@/components/hotels/payment/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[60dvh] animate-pulse rounded-lg bg-muted" />
  ),
});

interface ListingMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number } | null;
  /** Element that opened the dialog; focus returns here on close. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export function ListingMapDialog({
  open,
  onOpenChange,
  name,
  address,
  coordinates,
  returnFocusRef,
}: ListingMapDialogProps) {
  // The dialog has no DialogTrigger (buttons live in other cards), so Radix
  // has nothing to hand focus back to on close.
  const activeRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open) activeRef.current = document.activeElement as HTMLElement;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl"
        onCloseAutoFocus={(event) => {
          const target = returnFocusRef?.current ?? activeRef.current;
          if (!target || target === document.body) return;
          event.preventDefault();
          target.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>{address}</DialogDescription>
        </DialogHeader>
        {isValidCoordinate(coordinates) ? (
          <div className="h-[60dvh] overflow-hidden rounded-lg">
            <HotelMap
              coordinates={[coordinates.lat, coordinates.lng]}
              hotelName={name}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            The exact location isn&apos;t available for this listing.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
