"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDateRangePicker } from "@/components/rooms/booking/CustomDateRangePicker";
import { BookingEscrowCheckout } from "./BookingEscrowCheckout";
import type { BookingDetails } from "./booking-escrow.machine";
import { computeBookingPrice, countNights } from "./pricing";
import { EscrowProviders } from "@/providers/EscrowProviders";
import { useWallet } from "@/hooks/useWallet";
import { WalletConnectionCancelledError } from "@/lib/stellar/wallet-kit";
import type { ApartmentListing } from "@/types/hotel";

export function RentBooking({
  listing,
  initialCheckIn,
  initialCheckOut,
  initialGuestCount,
}: {
  listing: ApartmentListing;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuestCount?: number;
}) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      if (!initialCheckIn || !initialCheckOut) return undefined;
      const from = parseISO(initialCheckIn);
      const to = parseISO(initialCheckOut);
      if (!isValid(from) || !isValid(to) || to <= from) return undefined;
      return { from, to };
    },
  );
  const [guestCount, setGuestCount] = React.useState(() => {
    if (
      initialGuestCount === undefined ||
      !Number.isInteger(initialGuestCount) ||
      initialGuestCount < 1 ||
      initialGuestCount > 6
    ) {
      return 1;
    }
    return initialGuestCount;
  });
  const router = useRouter();
  const { address, connect } = useWallet();

  const booking = React.useMemo<BookingDetails | null>(() => {
    if (!dateRange?.from || !dateRange.to) return null;
    const nights = countNights(dateRange.from, dateRange.to);
    if (nights < 1) return null;

    return {
      listingId: listing.id,
      listingName: listing.name,
      hostAddress: listing.owner.walletAddress?.trim() ?? "",
      checkIn: format(dateRange.from, "yyyy-MM-dd"),
      checkOut: format(dateRange.to, "yyyy-MM-dd"),
      price: computeBookingPrice({
        nightlyRate: listing.price,
        nights,
        guests: guestCount,
      }),
    };
  }, [dateRange, guestCount, listing]);

  const blockedReason = React.useMemo(() => {
    if (!dateRange?.from || !dateRange.to) return "Select Dates";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateRange.from < today) return "Check-in date cannot be in the past";
    return null;
  }, [dateRange]);

  const connectWallet = React.useCallback(() => {
    void connect().catch((error: unknown) => {
      if (!(error instanceof WalletConnectionCancelledError)) {
        toast.error(
          error instanceof Error ? error.message : "Unable to connect wallet",
        );
      }
    });
  }, [connect]);

  return (
    <main className="theme-guest min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8">
        <Button asChild variant="outline">
          <Link href="/rent">
            <ArrowLeft aria-hidden="true" />
            Back to rentals
          </Link>
        </Button>
      </div>
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="min-w-0 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Booking</p>
            <h1 className="text-2xl font-semibold">{listing.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {listing.address}
            </p>
          </div>

          <div className="space-y-6 rounded-2xl border bg-card p-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Check-in / Check-out
              </label>
              <CustomDateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
                placeholder="Select your dates"
                minNights={1}
                maxNights={30}
              />
            </div>

            <div className="space-y-2">
              <label
                className="flex items-center gap-2 text-sm font-medium"
                htmlFor="booking-guests"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                Guests
              </label>
              <Select
                value={guestCount.toString()}
                onValueChange={(value) => setGuestCount(Number(value))}
              >
                <SelectTrigger id="booking-guests" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} {count === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            ${listing.price.toFixed(2)} per night · hosted by{" "}
            {listing.owner.name}
          </p>
        </section>

        <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Your booking</h2>
          <p className="text-sm text-muted-foreground">{listing.name}</p>
          <EscrowProviders>
            <BookingEscrowCheckout
              listingId={listing.id}
              booking={booking}
              blockedReason={blockedReason}
              guestAddress={address}
              onConnectWallet={connectWallet}
              onError={(message) => toast.error(message)}
              onFunded={(intent) => {
                if (intent.state.step === "funded") {
                  router.push(
                    `/rent/${listing.id}/escrow/${intent.state.contractId}`,
                  );
                }
              }}
              showBreakdown
            />
          </EscrowProviders>
        </aside>
      </div>
    </main>
  );
}
