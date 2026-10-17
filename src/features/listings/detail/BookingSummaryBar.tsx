"use client";

import { useState, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { ListingPrice } from "@/components/listings/ListingPrice";
import type { ApartmentListing } from "@/types/hotel";
import { cn } from "@/lib/utils";

export interface BookingIntent {
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  guests?: number;
  isFlexible?: boolean;
  flexibleLabel?: string;
}

export interface BookingSummaryBarProps {
  listing: ApartmentListing;
  intent?: BookingIntent;
  onBookExact?: (params: {
    checkIn: string;
    checkOut: string;
    adults: number;
  }) => void;
  className?: string;
}

function formatExactDateRange(startStr: string, endStr: string): string {
  try {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    if (!isValid(start) || !isValid(end)) return "";

    const startMonth = format(start, "MMM");
    const endMonth = format(end, "MMM");
    const startDay = format(start, "d");
    const endDay = format(end, "d");

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  } catch {
    return "";
  }
}

export function BookingSummaryBar({
  listing,
  intent: initialIntent,
  onBookExact,
  className,
}: BookingSummaryBarProps) {
  const [localDates, setLocalDates] = useState<{
    checkIn?: string;
    checkOut?: string;
  }>({});

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    () => {
      if (initialIntent?.checkIn && initialIntent?.checkOut) {
        const from = parseISO(initialIntent.checkIn);
        const to = parseISO(initialIntent.checkOut);
        if (isValid(from) && isValid(to)) {
          return { from, to };
        }
      }
      return undefined;
    },
  );

  const effectiveCheckIn = localDates.checkIn ?? initialIntent?.checkIn;
  const effectiveCheckOut = localDates.checkOut ?? initialIntent?.checkOut;
  const guestsCount = initialIntent?.adults ?? initialIntent?.guests ?? 1;

  const hasExactDates = Boolean(
    (effectiveCheckIn && effectiveCheckOut && !initialIntent?.isFlexible) ||
    (localDates?.checkIn && localDates?.checkOut),
  );

  const { intentSummary, bookLabel } = useMemo(() => {
    if (hasExactDates && effectiveCheckIn && effectiveCheckOut) {
      const formattedDates = formatExactDateRange(
        effectiveCheckIn,
        effectiveCheckOut,
      );
      const guestText = `${guestsCount} guest${guestsCount === 1 ? "" : "s"}`;
      const summary = formattedDates
        ? `${formattedDates} · ${guestText}`
        : `${effectiveCheckIn} – ${effectiveCheckOut} · ${guestText}`;

      return {
        intentSummary: summary,
        bookLabel: "Book",
      };
    }

    if (initialIntent?.isFlexible) {
      return {
        intentSummary: initialIntent.flexibleLabel || "A week in Nov or Dec",
        bookLabel: "Choose dates",
      };
    }

    return {
      intentSummary: "Add dates for availability",
      bookLabel: "Choose dates",
    };
  }, [
    hasExactDates,
    effectiveCheckIn,
    effectiveCheckOut,
    guestsCount,
    initialIntent?.isFlexible,
    initialIntent?.flexibleLabel,
  ]);

  const handleAction = () => {
    if (hasExactDates && effectiveCheckIn && effectiveCheckOut) {
      onBookExact?.({
        checkIn: effectiveCheckIn,
        checkOut: effectiveCheckOut,
        adults: guestsCount,
      });
    } else {
      setIsCalendarOpen(true);
    }
  };

  const handleApplyCalendar = () => {
    if (selectedRange?.from && selectedRange?.to) {
      const fromStr = format(selectedRange.from, "yyyy-MM-dd");
      const toStr = format(selectedRange.to, "yyyy-MM-dd");
      setLocalDates({
        checkIn: fromStr,
        checkOut: toStr,
      });
      setIsCalendarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sticky bottom bar */}
      <div
        data-testid="booking-summary-bar"
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden",
          className,
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="min-w-0">
            <ListingPrice amount={listing.price} size="sm" />
            <p className="truncate text-xs text-muted-foreground">
              {intentSummary}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleAction}
            className="min-h-11 shrink-0 px-6 font-semibold"
          >
            {bookLabel}
          </Button>
        </div>
      </div>

      {/* Desktop sticky side card (lg+) */}
      <aside
        data-testid="booking-summary-desktop-card"
        className="hidden lg:block lg:sticky lg:top-24 w-full rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-2 border-b border-border pb-4">
            <ListingPrice amount={listing.price} size="md" />
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Stay Details
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {intentSummary}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleAction}
            className="w-full min-h-11 py-3 text-base font-semibold"
          >
            {bookLabel}
          </Button>

          {!hasExactDates && (
            <p className="text-center text-xs text-muted-foreground">
              Select dates to view total nights and proceed with booking.
            </p>
          )}
        </div>
      </aside>

      {/* Scoped Calendar Dialog */}
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Select dates for {listing.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose your check-in and check-out dates.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-2">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCalendarOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedRange?.from || !selectedRange?.to}
              onClick={handleApplyCalendar}
            >
              Confirm dates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BookingSummaryBar;
