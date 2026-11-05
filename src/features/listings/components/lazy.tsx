"use client";

// Code-split entry points. Each wrapper keeps the SSR choice and loading
// state its page had, so pages import listings through index.ts without
// pulling these components into their first-load bundle.
import dynamic from "next/dynamic";
import { SlidersHorizontal } from "lucide-react";

// /rent
export const LazyApartmentGrid = dynamic(() => import("./grid/ApartmentGrid"), {
  ssr: false,
  loading: () => (
    <div role="status" aria-label="Loading apartments">
      <span className="sr-only">Loading apartments…</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border"
          >
            <div className="h-40 bg-muted motion-safe:animate-pulse" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-24 rounded bg-muted motion-safe:animate-pulse" />
              <div className="h-3 w-36 max-w-full rounded bg-muted motion-safe:animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});

export const LazyDestinationCarousel = dynamic(
  () =>
    import("./grid/DestinationCarousel").then(
      (module) => module.DestinationCarousel,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading destinations"
        className="mt-6 h-[168px] animate-pulse rounded-xl bg-muted"
      />
    ),
  },
);

export const LazyFilterSidebar = dynamic(
  () => import("./filters/FilterSidebar"),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading price filters"
        className="w-64 max-w-full shrink-0 p-6"
      >
        <span className="sr-only">Loading price filters…</span>
        <div aria-hidden="true" className="space-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="h-4 w-20 rounded bg-muted motion-safe:animate-pulse" />
              {Array.from({ length: 3 }, (_, row) => (
                <div
                  key={row}
                  className="h-3 w-28 rounded bg-muted motion-safe:animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
);

export const LazyRentFiltersDrawer = dynamic(
  () => import("./filters/RentFiltersDrawer"),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        aria-label="Filters"
        className="inline-flex min-h-11 justify-center shrink-0 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground lg:hidden"
      >
        <SlidersHorizontal aria-hidden="true" className="mr-2 h-4 w-4" />
        Filters
      </button>
    ),
  },
);

// /room
export const LazyRoomBookingPanel = dynamic(
  () => import("./booking/RoomBookingPanel"),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading booking"
        className="h-[420px] animate-pulse rounded-lg bg-muted"
      />
    ),
  },
);

export const LazyRoomPhotos = dynamic(() => import("./room/RoomPhotos"));

export const LazyAdditionalRoomPhotos = dynamic(
  () => import("./room/AdditionalRoomPhotos"),
);

export const LazyRoomActionBar = dynamic(() => import("./room/RoomActionBar"));

export const LazyBookingConfirmation = dynamic(() =>
  import("./booking/BookingConfirmation").then(
    (module) => module.BookingConfirmation,
  ),
);

export const LazyAmenitiesCard = dynamic(() => import("./room/AmenitiesCard"));

export const LazyLocationCard = dynamic(() => import("./room/LocationCard"));

export const LazyHostCard = dynamic(() => import("./room/HostCard"));

export const LazyPolicyCard = dynamic(() => import("./room/PolicyCard"));

// /hotels/search
export const LazyHotelSearchForm = dynamic(
  () => import("./hotels/HotelSearchForm"),
);

export const LazyHotelGrid = dynamic(() => import("./grid/HotelGrid"), {
  loading: () => (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading hotel results"
    >
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  ),
});

// /hotels/[id]
export const LazyHotelMap = dynamic(() => import("./detail/HotelMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[250px] items-center justify-center rounded-lg bg-gray-200 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300"
      role="status"
    >
      Loading map...
    </div>
  ),
});

// /dashboard/guest
export const LazyHotelHeader = dynamic(() => import("./detail/HotelHeader"));
