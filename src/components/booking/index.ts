/**
 * Booking Components Exports
 * 
 * This module exports all booking-related components for hotel escrow integration.
 */

// Main Escrow Creation Form
export { EscrowCreationForm } from "./EscrowCreationForm";
export type { EscrowCreationFormProps } from "./EscrowCreationForm";

// Booking Escrow Wrapper (full integration)
export { BookingEscrowWrapper } from "./BookingEscrowWrapper";
export type { BookingEscrowWrapperProps } from "./BookingEscrowWrapper";

// Escrow Confirmation
export { EscrowConfirmation } from "./EscrowConfirmation";

// Re-export types from interfaces
export type {
  BookingData,
  HotelData,
  RoomData,
  EscrowType,
  EscrowResponse,
  EscrowMilestone,
  EscrowMetadata,
  EscrowConfirmationProps,
} from "@/interfaces/booking-escrow.interface";
