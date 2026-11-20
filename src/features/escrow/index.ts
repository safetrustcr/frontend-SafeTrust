// Public API of the escrow feature. app/, other features and shared code
// import escrow code only from "@/features/escrow" (enforced by ESLint).

// Booking checkout
export { BookingEscrowCheckout } from "./components/BookingEscrowCheckout";
export { RentBooking } from "./components/RentBooking";
export { HowFeesWorkPopover } from "./components/HowFeesWorkPopover";
export { HostPayoutPreview } from "./components/HostPayoutPreview";

// Wallet readiness (#762): host payout guidance and the demo checklist presets
export {
  HostPayoutReadinessBanner,
  NotReadyForBookingsBadge,
} from "./components/HostPayoutReadinessBanner";
export { useHostPayoutReadiness } from "./hooks/useHostPayoutReadiness";
export {
  demoReadinessFromQuery,
  type CheckoutReadiness,
  type HostPayoutStatus,
} from "./model/readiness";

// Escrow detail page (/dashboard/escrow/[id])
export { EscrowOverviewCard } from "./components/EscrowOverviewCard";
export { EscrowContractCard } from "./components/EscrowContractCard";
export { InvoiceHeader } from "./components/InvoiceHeader";
export { ProcessStepper } from "./components/ProcessStepper";
export { EscrowPartyInfo } from "./components/views/EscrowPartyInfo";

// Read-only data (demo fixtures until the escrow API is wired)
export { getStubEscrow } from "./data/stubEscrow";

// Pricing and configuration (amount formatting lives in @/lib/format)
export {
  computeBookingPrice,
  countNights,
  TRUSTLESS_WORK_FEE_RATE,
  isMainnet,
  type BookingPriceBreakdown,
  type FeeOption,
} from "./model/pricing";
export {
  FEE_OPTION,
  STELLAR_NETWORK,
  TRUSTLESS_WORK_API_URL,
  stellarExpertContractUrl,
} from "./config";

// Public types
export type { BookingDetails } from "./model/booking-escrow.machine";
export type * from "./model/types";
