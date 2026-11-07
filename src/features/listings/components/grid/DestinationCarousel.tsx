"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Destination } from "../../model/types";
import { DestinationCard } from "../cards/DestinationCard";

interface DestinationCarouselProps {
  title?: string;
  destinations: Destination[];
  selectedIds?: string[];
  counts?: Record<string, number>;
  distances?: Record<string, number>;
  action?: ReactNode;
  onSelectDestination?: (destination: Destination | null) => void;
}

export function DestinationCarousel({
  title = "Destinations for you",
  destinations,
  selectedIds = [],
  counts,
  distances,
  action,
  onSelectDestination,
}: DestinationCarouselProps) {
  const headingId = useId();
  const scroller = useRef<HTMLUListElement>(null);
  const scrollBehavior = (): ScrollBehavior =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  const scrollBy = (direction: 1 | -1) =>
    scroller.current?.scrollBy({
      left: direction * scroller.current.clientWidth * 0.8,
      behavior: scrollBehavior(),
    });
  // Several selected tiles have no single one to bring into view.
  const scrollTarget =
    selectedIds.length > 1 ? null : (selectedIds[0] ?? "all");
  useEffect(() => {
    const list = scroller.current;
    if (!list) return;
    const selected = [...list.children].find(
      (item) => item.getAttribute("data-destination-id") === scrollTarget,
    ) as HTMLElement | undefined;
    if (!selected) return;
    const itemRect = selected.getBoundingClientRect(),
      listRect = list.getBoundingClientRect();
    // Scroll this strip only; scrollIntoView could move the entire page.
    if (
      itemRect.left < listRect.left + 8 ||
      itemRect.right > listRect.right - 8
    ) {
      list.scrollBy({
        left: itemRect.left - listRect.left - 8,
        behavior: scrollBehavior(),
      });
    }
  }, [scrollTarget]);

  return (
    <section aria-labelledby={headingId} className="w-full min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id={headingId}
          className="text-lg font-bold text-foreground sm:text-xl"
        >
          {title}
        </h2>
        <div className="flex items-center gap-1">
          {action}
          <Button
            variant="ghost"
            size="icon"
            className="hidden min-h-11 min-w-11 md:inline-flex"
            aria-label="Scroll destinations left"
            onClick={() => scrollBy(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden min-h-11 min-w-11 md:inline-flex"
            aria-label="Scroll destinations right"
            onClick={() => scrollBy(1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <ul
        ref={scroller}
        aria-label="Destination choices"
        className="no-scrollbar flex w-full min-w-0 snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto p-2 pb-3 motion-safe:scroll-smooth"
      >
        <li data-destination-id="all" className="shrink-0">
          <button
            type="button"
            aria-pressed={selectedIds.length === 0}
            onClick={() => onSelectDestination?.(null)}
            className="flex aspect-square w-28 snap-start flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-3 text-center text-sm font-semibold text-muted-foreground aria-pressed:border-primary aria-pressed:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-32"
          >
            <MapPin className="h-6 w-6" aria-hidden="true" />
            All destinations
          </button>
        </li>
        {destinations.map((destination) => (
          <li
            key={destination.id}
            data-destination-id={destination.id}
            className="shrink-0"
          >
            <DestinationCard
              destination={destination}
              selected={selectedIds.includes(destination.id)}
              listingCount={
                counts ? (counts[destination.location] ?? 0) : undefined
              }
              distanceKm={distances?.[destination.id]}
              onSelect={onSelectDestination}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
