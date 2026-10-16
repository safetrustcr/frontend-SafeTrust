# Listings Feature Module

This module consolidates all rent/hotel search, filters, cards, and detail functionality into a single cohesive feature following the architecture contract.

## Structure

```
src/features/listings/
├── components/          # UI components for listings
│   ├── ApartmentCard.tsx
│   ├── ApartmentDetail.tsx
│   ├── ApartmentGrid.tsx
│   ├── FilterSidebar.tsx
│   ├── BedroomTabs.tsx
│   ├── HotelHeader.tsx
│   ├── ImageGallery.tsx
│   ├── SuggestionCard.tsx
│   ├── SuggestionsList.tsx
│   ├── AmenityIcons.tsx
│   ├── Destinations/    # Destination-related components
│   ├── formatListingPrice.ts
│   └── index.ts        # Component exports
├── hooks/              # Feature-specific hooks
│   ├── filters/
│   │   ├── useRentFilters.ts
│   │   ├── applyRentFilters.ts
│   │   └── *.test.ts
│   └── index.ts        # Hook exports
├── model/              # Types, schemas, pure logic
│   ├── types.ts        # ApartmentListing, HotelSearchResult, etc.
│   ├── filters.ts      # RentFilters, SortOption, constants
│   ├── hotel-booking.ts # Booking-related types
│   └── index.ts        # Type exports
├── data/               # Repository + demo data (future)
└── index.ts            # Public entry point for the feature
```

## Public API

Import from `@/features/listings` to access:

### Components
- `ApartmentCard` - Rental card with booking and host-contact actions
- `ApartmentDetail` - Rental details, amenities, owner information
- `ApartmentGrid` - Responsive listing grid
- `FilterSidebar` - Price range filter controls
- `BedroomTabs` - Bedroom-count selection tabs
- `HotelHeader` - Page header for listings
- `ImageGallery` - Image gallery component
- `SuggestionCard` - Suggestion card component
- `SuggestionsList` - List of suggestions
- `AmenityIcons` - Amenity display icons
- `DestinationCard` - Destination card
- `DestinationCarousel` - Destination carousel
- `CategoryFilterRow` - Category filter row
- `CategoryChip` - Category chip

### Hooks
- `useRentFilters` - Filter state management with URL sync
- `resolveSortOption` - Resolve sort option based on capabilities
- `parseFilters` - Parse URL search params to filters
- `applyRentFilters` - Apply filters to listing data

### Types
- `ApartmentListing` - Main listing type
- `ApartmentOwner` - Owner information
- `ApartmentAmenitySummary` - Amenity summary
- `HotelSearchResult` - Hotel search result
- `RentFilters` - Filter configuration
- `SortOption` - Sort options
- `Category` - Listing categories
- `Location` - Location types
- `BedroomCount` - Bedroom count options
- Booking-related types from `hotel-booking.ts`

### Constants
- `DEFAULT_FILTERS` - Default filter values
- `PRICE_BOUNDS` - Price range bounds

## Migration Notes

- Old imports from `@/components/listings` should now use `@/features/listings`
- Old imports from `@/types/hotel` for listing types should now use `@/features/listings`
- `@/types/hotel.ts` now re-exports from `@/features/listings` for backward compatibility
