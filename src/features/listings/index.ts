// Public API of the listings feature: apartments and hotels to browse,
// filter, view, save and book. app/, other features and shared code import
// listings code only from "@/features/listings" (enforced by ESLint).
// Keep this file re-exports only: next.config.ts lists it in
// optimizePackageImports, which needs a pure barrel.

// Model
export type * from "./model/types";
export { LISTING_CATEGORIES, LISTING_LOCATIONS } from "./model/types";
export {
  BEDROOM_FILTERS,
  DEFAULT_FILTERS,
  PRICE_BOUNDS,
  applyRentFilters,
  parseFilters,
  resolveSortOption,
  type BedroomCount,
  type RentFilters,
  type SortOption,
} from "./model/filters";
export { formatListingPrice } from "./model/price";
export {
  hotelSearchHref,
  parseHotelSearch,
  type HotelSearch,
} from "./model/hotel-search";
export {
  REPORT_CATEGORIES,
  isApartmentId,
  isReportCategory,
  validateReportInput,
  type ReportCategory,
} from "./model/report-schema";

// Data (demo records until the listings API is wired)
export {
  getListing,
  listDestinations,
  listListings,
  listSuggestedListings,
} from "./data/listings";
export { searchHotels } from "./data/hotels";
export {
  DEMO_REMOVED_MESSAGE as HOTEL_DEMO_REMOVED_MESSAGE,
  DEMO_SAVED_MESSAGE as HOTEL_DEMO_SAVED_MESSAGE,
  useDemoHotelStore,
  type HotelDraft,
  type ManagedHotel,
} from "./data/managed-hotels";
export { ReportError, submitListingReport } from "./data/reports";

// Hooks
export { useListings } from "./hooks/useListings";
export { useRentFilters } from "./hooks/useRentFilters";
export { useApartmentOffers } from "./hooks/useApartmentOffers";

// Search
export { SearchComposer } from "./search/SearchComposer";
export * from "./search/stay-search";
export * from "./search/date-only";
export * from "./search/match-stay";
export { listingHref } from "./search/links";
export { useStaySearch } from "./search/useStaySearch";
export { useListingResults } from "./search/useListingResults";
export { WhenSection } from "./search/WhenSection";
export type { WhenSectionProps } from "./search/WhenSection";

// Wishlist
export * from "./wishlist";

// Components
export { SearchHeader } from "./components/SearchHeader";
export { RentMotion, RentReveal } from "./components/RentMotion";
export { ListingResultsMap } from "./map/ListingResultsMap";
export { default as ApartmentCard } from "./components/cards/ApartmentCard";
export { default as HotelCard } from "./components/cards/HotelCard";
export { default as SuggestionCard } from "./components/cards/SuggestionCard";
export { DestinationCard } from "./components/cards/DestinationCard";
export { ListingPrice } from "./components/cards/ListingPrice";
export { default as ApartmentDetail } from "./components/detail/ApartmentDetail";
export { default as AmenityIcons } from "./components/detail/AmenityIcons";
export { default as HotelHeader } from "./components/detail/HotelHeader";
export { default as ImageGallery } from "./components/detail/ImageGallery";
export { ListingLocation } from "./components/detail/ListingLocation";
export { ListingMapDialog } from "./components/detail/ListingMapDialog";
export type { BookingIntent } from "./components/detail/BookingSummaryBar";
export { default as RoomDetailsCard } from "./components/room/RoomDetailsCard";
export { default as HotelDetailsCard } from "./components/detail/HotelDetailsCard";
export { default as HotelGallery } from "./components/detail/HotelGallery";
export { default as HotelInformation } from "./components/detail/HotelInformation";
export { default as BedroomTabs } from "./components/filters/BedroomTabs";
export { CategoryFilterRow } from "./components/filters/CategoryFilterRow";
export { default as FilterSidebar } from "./components/filters/FilterSidebar";
export { NearMeButton } from "./components/filters/NearMeButton";
export { SortMenu } from "./components/filters/SortMenu";
export { default as ApartmentGrid } from "./components/grid/ApartmentGrid";
export { default as HotelGrid } from "./components/grid/HotelGrid";
export { default as SuggestionsList } from "./components/grid/SuggestionsList";
export { BookingButton } from "./components/booking/BookingButton";
export { PriceCalculator } from "./components/booking/PriceCalculator";
export { MobileBookingBar } from "./components/booking/MobileBookingBar";
export { default as HotelDetails } from "./components/booking/HotelDetails";
export { default as ReservationSummary } from "./components/booking/ReservationSummary";
export { default as HotelsView } from "./components/hotels/HotelsView";

// Code-split wrappers for pages (components/lazy.tsx)
export {
  LazyAdditionalRoomPhotos,
  LazyAmenitiesCard,
  LazyApartmentGrid,
  LazyBookingConfirmation,
  LazyDestinationCarousel,
  LazyFilterSidebar,
  LazyHostCard,
  LazyHotelGrid,
  LazyHotelHeader,
  LazyHotelMap,
  LazyHotelSearchForm,
  LazyLocationCard,
  LazyPolicyCard,
  LazyRentFiltersDrawer,
  LazyRoomActionBar,
  LazyRoomBookingPanel,
  LazyRoomPhotos,
} from "./components/lazy";
