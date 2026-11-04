"use client";

import type { ComponentProps } from "react";
import { EscrowProviders } from "@/providers/EscrowProviders";
import { RoomBookingCard } from "./RoomBookingCard";

/** Booking card plus the Trustless Work providers it needs, loaded on demand. */
export default function RoomBookingPanel(
  props: ComponentProps<typeof RoomBookingCard>,
) {
  return (
    <EscrowProviders>
      <RoomBookingCard {...props} />
    </EscrowProviders>
  );
}
