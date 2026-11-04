# Listings feature

Everything about stays lives in this module (FE-52, #590): browsing and
filtering apartments on `/rent`, hotels on `/hotels`, the `/rent/[id]` and
`/room` detail pages, booking UI, the search composer, maps and the wishlist.
Hotels and apartments share one `Listing` model. The reasons are recorded in
`docs/ARCHITECTURE.md` under "Listings and Hotels".

## Public API

Code outside this folder imports only `@/features/listings` (`index.ts`):

| Group      | Exports                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model      | `Listing`, `Destination`, `Category`, `Location`, `LISTING_CATEGORIES`, `LISTING_LOCATIONS`, rent filters (`RentFilters`, `applyRentFilters`, `parseFilters`, …) |
| Data       | `listListings`, `getListing`, `listSuggestedListings`, `listDestinations`, `searchHotels`, `useDemoHotelStore`, `submitListingReport`                            |
| Hooks      | `useListings`, `useRentFilters`, `useListingResults`, `useStaySearch`, `useApartmentOffers`, the wishlist hooks                                                  |
| Components | cards, grids, filters, detail and booking components, `HotelHeader`, `SearchHeader`, `SearchComposer`                                                            |
| Lazy       | `Lazy*` wrappers: the code-split versions pages render (see below)                                                                                               |

## Layout

| Path                     | Role                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `index.ts`               | Public API. Re-exports only, so `optimizePackageImports` can split it per export            |
| `model/types.ts`         | The one `Listing` type, categories and locations (was `src/types/hotel.ts`)                 |
| `model/filters.ts`       | The one rent-filter implementation: bounds, URL parsing, `applyRentFilters`                 |
| `model/price.ts`         | `formatListingPrice`, a thin alias of `formatPrice` in `@/lib/format`                       |
| `model/hotel-search.ts`  | `/hotels/search` query params                                                               |
| `data/listings.ts`       | Read model over the demo catalogue. Swap the source here when the listings API is wired     |
| `data/demo-*.ts`         | Demo listings and destinations (was `src/lib/mockData/`)                                    |
| `data/managed-hotels.ts` | In-memory host hotel store for `/dashboard/hotels`                                          |
| `hooks/`                 | `useRentFilters` (URL state), `useListings`, `useApartmentOffers`                           |
| `search/`, `map/`        | Search composer and stay search; Leaflet maps                                               |
| `wishlist/`              | Saved stays                                                                                 |
| `components/`            | `cards/`, `grid/`, `filters/`, `detail/`, `room/` (the `/room` page), `booking/`, `hotels/` |
| `components/lazy.tsx`    | `next/dynamic` wrappers, each with the SSR choice and loading state its page uses           |

Tests sit next to the file they cover.

## Rules

- Inside the module, import with relative paths (`../model/filters`), never
  `@/features/listings/...`. Keep folders shallow enough that no import needs
  `../../../`.
- A page that wants a component code-split imports its `Lazy*` wrapper. Add
  new wrappers to `components/lazy.tsx` rather than calling `dynamic()` on
  a path inside this module.
- Booking composes `@/features/escrow` through its index. Escrow needs only
  the `Listing` type from here (type-only), so the two modules have no
  runtime cycle. The shared date-range picker lives in
  `src/components/ui/custom-date-range-picker.tsx`.

ESLint enforces the public API (`import/no-restricted-paths` in
`eslint.config.mjs`).
