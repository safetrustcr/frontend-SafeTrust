/**
 * Public barrel for the room feature (issue #482).
 *
 * Everything the room page renders lives under src/components/rooms now —
 * actions/, booking/, gallery/ and cards/ — with one implementation of each
 * component. Import from this barrel (or from a subsection directly for
 * deep imports); the old app/room/components and components/room/mobile
 * locations are gone.
 */
export { default as RoomActionBar } from "./actions/RoomActionBar";
export { default as ShareButton } from "./actions/ShareButton";
export { default as ContactButton } from "./actions/ContactButton";
export { default as ReportButton } from "./actions/ReportButton";
export { default as FavoriteButton } from "./actions/FavoriteButton";

export { RoomBookingCard } from "./booking/RoomBookingCard";
export { default as MobileBookingCard } from "./booking/MobileBookingCard";
export { BookingButton } from "./booking/BookingButton";
export { BookingConfirmation } from "./booking/BookingConfirmation";
export { AvailabilityChecker } from "./booking/AvailabilityChecker";
export { CustomDateRangePicker } from "./booking/CustomDateRangePicker";
export { PriceCalculator } from "./booking/PriceCalculator";

export { default as RoomPhotos } from "./gallery/RoomPhotos";
export { default as AdditionalRoomPhotos } from "./gallery/AdditionalRoomPhotos";
export { default as ImageCarousel } from "./gallery/ImageCarousel";
export { default as ThumbnailNavigation } from "./gallery/ThumbnailNavigation";
export { default as FullscreenImageViewer } from "./gallery/FullscreenImageViewer";

export {
  AmenitiesCard,
  LocationCard,
  HostCard,
  PolicyCard,
  RoomDetailsCard,
} from "./cards";
