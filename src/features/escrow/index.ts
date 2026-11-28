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

// Escrow detail page (/dashboard/escrow/[id] and /rent/[id]/escrow/[escrowId]) & Lifecycle UI (issues #758, #760)
export { EscrowOverviewCard } from "./components/EscrowOverviewCard";
export { EscrowContractCard } from "./components/EscrowContractCard";
export { InvoiceHeader } from "./components/InvoiceHeader";
export { ProcessStepper } from "./components/ProcessStepper";
export { EscrowPartyInfo } from "./components/views/EscrowPartyInfo";
export {
  EscrowStatusView,
  EscrowLifecycleTimeline,
  truncateAddress,
  resolveEscrowStatusData,
  type EscrowStatusData,
} from "./components/EscrowStatusView";
export { WalletSigningState } from "./components/WalletSigningState";
export { OpenDisputeModal } from "./components/OpenDisputeModal";
export { DisputeResolverView } from "./components/DisputeResolverView";
export { EscrowActionPanel } from "./components/EscrowActionPanel";
export { PlatformReleasesView } from "./components/PlatformReleasesView";
export { EscrowLifecycleDemo } from "./components/EscrowLifecycleDemo";
export { EscrowDetailLifecycleSection } from "./components/EscrowDetailLifecycleSection";

// Read-only data (demo fixtures until the escrow API is wired)
export { getStubEscrow } from "./data/stubEscrow";
export {
  LIFECYCLE_FIXTURES,
  type LifecycleDemoFixture,
} from "./data/lifecycle-fixtures";

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
  getPlatformWalletAddress,
} from "./config";

// Lifecycle logic and validation
export {
  validateDisputeSplit,
  canPerformAction,
  DISPUTE_REASONS,
  type EscrowLifecycleStatus,
  type EscrowUserRole,
  type ReleaseOption,
  type WalletSigningStatus,
  type DisputeDetails,
  type DisputeResolution,
  type TimelineStepDetail,
} from "./model/lifecycle";

// Public types
export type { BookingDetails } from "./model/booking-escrow.machine";
export type * from "./model/types";
