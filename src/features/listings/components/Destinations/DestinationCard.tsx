"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  selected?: boolean;
  listingCount?: number;
  distanceKm?: number;
  onSelect?: (destination: Destination) => void;
}

export function DestinationCard({
  destination,
  selected = false,
  listingCount,
  distanceKm,
  onSelect,
}: DestinationCardProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source =
    destination.imageUrl && failedSource !== destination.imageUrl
      ? destination.imageUrl
      : "/img/placeholder.svg";
  return (
    <button
      type="button"
      onClick={() => onSelect?.(destination)}
      aria-pressed={selected}
      aria-label={`${destination.name}, ${destination.tagline}${listingCount !== undefined ? `, ${listingCount} ${listingCount === 1 ? "place" : "places"}` : ""}`}
      className="group flex w-28 shrink-0 snap-start flex-col items-start text-left focus-visible:outline-none sm:w-32"
    >
      <span
        className={cn(
          "relative mb-2 block aspect-square w-full overflow-hidden rounded-2xl ring-offset-2 ring-offset-background transition-shadow",
          selected
            ? "ring-2 ring-primary"
            : "group-hover:ring-2 group-hover:ring-primary/40 group-focus-visible:ring-2 group-focus-visible:ring-primary",
        )}
      >
        <Image
          src={source}
          alt=""
          fill
          sizes="(min-width: 640px) 128px, 112px"
          onError={() => setFailedSource(destination.imageUrl)}
          className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
      </span>
      <span className="text-sm font-semibold leading-tight text-foreground">
        {destination.name}
      </span>
      <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
        {destination.tagline}
      </span>
      {(listingCount !== undefined || distanceKm !== undefined) && (
        <span className="mt-0.5 text-xs text-muted-foreground">
          {listingCount !== undefined &&
            `${listingCount} ${listingCount === 1 ? "place" : "places"}`}
          {listingCount !== undefined && distanceKm !== undefined && " · "}
          {distanceKm !== undefined && `${Math.round(distanceKm)} km`}
        </span>
      )}
    </button>
  );
}
