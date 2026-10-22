"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { BookingButton } from "@/components/rooms/booking/BookingButton";
import { CustomDateRangePicker } from "@/components/rooms/booking/CustomDateRangePicker";
import type { ApartmentListing } from "@/types/hotel";

export function RentCheckout({ listing }: { listing: ApartmentListing }) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange>();

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-medium text-orange-700">Secure checkout</p>
            <h1 className="mt-1 text-3xl font-semibold">{listing.name}</h1>
            <p className="mt-2 text-muted-foreground">{listing.address}</p>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Choose your rental dates</h2>
            <CustomDateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              placeholder="Select check-in and check-out"
              minNights={1}
              maxNights={365}
            />
          </div>
        </section>

        <section aria-label="Booking payment">
          <BookingButton
            listing={listing}
            dateRange={dateRange}
            guestCount={1}
            nightlyRate={listing.price / 30}
            isAvailable
            onBookingComplete={(bookingId) =>
              router.push(
                `/hotels/${listing.id}/book?bookingId=${encodeURIComponent(bookingId)}`,
              )
            }
          />
        </section>
      </div>
    </main>
  );
}