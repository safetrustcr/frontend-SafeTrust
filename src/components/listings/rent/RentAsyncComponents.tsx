import dynamic from "next/dynamic";

export const FilterSidebar = dynamic(
  () => import("@/components/listings/FilterSidebar"),
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

export const ApartmentGrid = dynamic(
  () => import("@/components/listings/ApartmentGrid"),
  {
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
  },
);
