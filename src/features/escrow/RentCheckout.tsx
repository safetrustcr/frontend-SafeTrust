"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ApartmentListing } from "@/types/hotel";
import { CustomDateRangePicker } from "@/components/rooms/booking/CustomDateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGlobalAuthenticationStore } from "@/core/store/data";
import { useWallet } from "@/hooks/useWallet";
import { formatPrice } from "@/lib/format";
import { EscrowProviders } from "@/providers/EscrowProviders";
import { BookingEscrowCheckout } from "./BookingEscrowCheckout";
import { computeBookingPrice } from "./pricing";

export function RentCheckout({
  listing,
  initialCheckIn,
  initialCheckOut,
}: {
  listing: ApartmentListing;
  initialCheckIn?: string;
  initialCheckOut?: string;
}) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (!initialCheckIn || !initialCheckOut) return undefined;
    const from = parseISO(initialCheckIn);
    const to = parseISO(initialCheckOut);
    if (
      !isValid(from) ||
      !isValid(to) ||
      differenceInCalendarDays(to, from) < 1
    ) {
      return undefined;
    }
    return { from, to };
  });
  const [walletError, setWalletError] = useState<string>();
  const address = useGlobalAuthenticationStore((state) => state.address);
  const { connect } = useWallet();

  const nights = useMemo(() => {
    if (!dateRange?.from || !dateRange.to) return 0;
    return differenceInCalendarDays(dateRange.to, dateRange.from);
  }, [dateRange]);

  const booking = useMemo(() => {
    if (!dateRange?.from || !dateRange.to || nights < 1) return null;

    return {
      listingId: listing.id,
      listingName: listing.name,
      hostAddress: listing.owner.walletAddress ?? "",
      checkIn: format(dateRange.from, "yyyy-MM-dd"),
      checkOut: format(dateRange.to, "yyyy-MM-dd"),
      price: computeBookingPrice({
        nightlyRate: listing.price,
        nights,
        guests: 1,
      }),
    };
  }, [dateRange, listing, nights]);

  const handleConnectWallet = async () => {
    setWalletError(undefined);
    try {
      await connect();
    } catch (error) {
      setWalletError(
        error instanceof Error
          ? error.message
          : "Unable to connect a Stellar wallet. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto mb-6 max-w-5xl">
        <Button asChild variant="outline">
          <Link href="/rent">
            <ArrowLeft aria-hidden="true" />
            Back to rentals
          </Link>
        </Button>
      </div>
      <div className="mx-auto grid max-w-5xl min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-6">
          <div>
            <p className="text-sm font-medium text-orange-600">
              Secure checkout
            </p>
            <h1 className="mt-1 text-3xl font-semibold">{listing.name}</h1>
            <p className="mt-2 text-muted-foreground">{listing.address}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Choose your rental dates</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomDateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
                placeholder="Select check-in and check-out"
                minNights={1}
                maxNights={365}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escrow-protected payment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Your payment is funded to a Trustless Work escrow on Stellar.
              Funds remain protected until the escrow terms are met.
            </CardContent>
          </Card>
        </section>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Price breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              {nights
                ? `${nights} night${nights === 1 ? "" : "s"} × ${formatPrice(listing.price)} per night`
                : "Select your dates to see the final price"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletError && (
              <p role="alert" className="text-sm text-red-600">
                {walletError}
              </p>
            )}
            <EscrowProviders>
              <BookingEscrowCheckout
                listingId={listing.id}
                booking={booking}
                blockedReason={
                  booking
                    ? undefined
                    : "Select valid check-in and check-out dates."
                }
                guestAddress={address}
                onConnectWallet={() => void handleConnectWallet()}
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
