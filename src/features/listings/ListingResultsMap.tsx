"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { List, MapIcon } from "lucide-react";
import type { ApartmentListing } from "@/types/hotel";
import { Button } from "@/components/ui/button";
import ApartmentCard from "@/components/listings/ApartmentCard";
import { cn } from "@/lib/utils";

const MapPane = dynamic(() => import("./MapPane"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Loading map"
      className="flex h-full w-full items-center justify-center rounded-2xl bg-muted"
    >
      <span className="sr-only">Loading map…</span>
      <div
        aria-hidden="true"
        className="h-full w-full animate-pulse rounded-2xl bg-muted"
      />
    </div>
  ),
});

/** Allowlisted `?view=` param: anything else (including absent) falls back to "list". */
function useResultsMapView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "map" ? "map" : "list";

  const setView = useCallback(
    (next: "map" | "list") => {
      const query = new URLSearchParams(searchParams.toString());
      if (next === "map") query.set("view", "map");
      else query.delete("view");
      const queryString = query.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return { view, setView } as const;
}

// Matches Tailwind's default `lg` breakpoint. A real check, not just a CSS
// `hidden lg:block` pair: both branches would otherwise mount their own
// MapPane (duplicate Leaflet instance, duplicate tile requests) with only
// one hidden by CSS.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

interface ListingResultsMapProps {
  listings: ApartmentListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * The map companion to `/rent`'s results grid: a "Show map" column on
 * desktop, a floating Map/List toggle with a bottom sheet on mobile. Renders
 * nothing for zero results (the page's own empty state already covers that).
 */
export function ListingResultsMap({
  listings,
  selectedId,
  onSelect,
}: ListingResultsMapProps) {
  const { view, setView } = useResultsMapView();
  const isDesktop = useIsDesktop();
  const placesLabel = `${listings.length} ${listings.length === 1 ? "place" : "places"}`;

  if (listings.length === 0) return null;

  if (isDesktop) {
    // A column that is either a "Show map" prompt or the sticky map.
    return (
      <div className="lg:w-[380px] lg:shrink-0">
        {view === "map" ? (
          <div className="sticky top-20 h-[calc(100vh_-_7rem)] overflow-hidden rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-background px-3 py-2">
              <span className="text-sm font-medium text-foreground">
                {placesLabel}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("list")}
              >
                Hide map
              </Button>
            </div>
            <div className="h-[calc(100%_-_2.75rem)]">
              <MapPane
                listings={listings}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            </div>
          </div>
        ) : (
          <div className="sticky top-20">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setView("map")}
            >
              <MapIcon aria-hidden="true" className="h-4 w-4" />
              Show map
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Mobile: floating toggle; "map" mode takes over the viewport with a
  // bottom sheet listing the same results.
  return (
    <>
      <button
        type="button"
        onClick={() => setView(view === "map" ? "list" : "map")}
        style={{
          bottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
        }}
        className="fixed inset-x-0 z-30 mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-lg"
      >
        {view === "map" ? (
          <List aria-hidden="true" className="h-4 w-4" />
        ) : (
          <MapIcon aria-hidden="true" className="h-4 w-4" />
        )}
        {view === "map" ? "List" : "Map"}
      </button>

      {view === "map" ? (
        <div className="fixed inset-0 z-20 bg-background">
          <div className="h-full w-full">
            <MapPane
              listings={listings}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </div>
          <MobileResultsSheet
            listings={listings}
            selectedId={selectedId}
            onSelect={onSelect}
            placesLabel={placesLabel}
          />
        </div>
      ) : null}
    </>
  );
}

function MobileResultsSheet({
  listings,
  selectedId,
  onSelect,
  placesLabel,
}: ListingResultsMapProps & { placesLabel: string }) {
  useEffect(() => {
    if (!selectedId) return;
    document
      .getElementById(`map-sheet-card-${selectedId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedId]);

  return (
    // A plain fixed panel, not vaul's Drawer: Drawer.Portal renders into
    // document.body, which would bypass the parent's `lg:hidden` and show
    // this on desktop too. It's always open and not dismissible anyway, so
    // none of Drawer's gesture/animation behavior was actually in use.
    <section
      aria-label={placesLabel}
      style={{ maxHeight: "60dvh" }}
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border border-border bg-background px-4 pt-3 shadow-lg"
    >
      <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
      <p className="pb-3 text-sm font-semibold text-foreground">
        {placesLabel}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            id={`map-sheet-card-${listing.id}`}
            onClick={() => onSelect(listing.id)}
            className={cn(
              "rounded-[18px]",
              listing.id === selectedId &&
                "ring-2 ring-foreground ring-offset-2 ring-offset-background",
            )}
          >
            <ApartmentCard apartment={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}
