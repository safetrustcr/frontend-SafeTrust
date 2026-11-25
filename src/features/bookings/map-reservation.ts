import type {
  BookingAction,
  EscrowData,
  EscrowStatus,
} from "@/types/dashboard";

/** Mirrors ReservationDto from the backend reservations API. */
export type ReservationStatus =
  | "pending"
  | "escrow_created"
  | "funded"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "disputed"
  | "resolved"
  | "cancelled";

export interface ReservationDto {
  id: string;
  status: ReservationStatus;
  checkIn: string;
  checkOut: string;
  amount: string;
  asset: string;
  apartment: {
    id: string;
    name: string;
  };
  contractId: string | null;
  party: "guest" | "host";
  allowedActions: BookingAction[];
}

// Display-only: EscrowStatus has no dispute states, so disputed/resolved and the
// pending fallback are approximations. Permissions come from allowedActions.
const STATUS_MAP: Record<ReservationStatus, EscrowStatus> = {
  pending: "pending",
  escrow_created: "pending",
  funded: "funded",
  checked_in: "check_in_approved",
  checked_out: "check_out_approved",
  completed: "completed",
  // Funds stay locked while disputed and are released once resolved.
  disputed: "funded",
  resolved: "completed",
  cancelled: "cancelled",
};

export function mapReservation(dto: ReservationDto): EscrowData {
  const now = new Date().toISOString();
  return {
    id: dto.id,
    contractId: dto.contractId ?? "",
    status: STATUS_MAP[dto.status] ?? "pending",
    amount: Number(dto.amount),
    asset: { code: dto.asset },
    metadata: {
      bookingId: dto.id,
      hotelName: dto.apartment.name,
      checkInDate: dto.checkIn,
      checkOutDate: dto.checkOut,
    },
    allowedActions: dto.allowedActions,
    marker: dto.contractId ?? dto.id,
    createdAt: now,
    updatedAt: now,
  };
}
