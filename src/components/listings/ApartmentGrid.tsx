"use client";

import { Fragment, type ReactNode } from "react";
import type { ApartmentListing } from "@/types/hotel";
import ApartmentCard from "./ApartmentCard";

interface ApartmentGridProps {
  apartments: ApartmentListing[];
  renderCard?: (card: ReactNode, index: number) => ReactNode;
  distances?: Record<string, number>;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  onApartmentClick?: (apartment: ApartmentListing) => void;
}

/** Render rental cards in a responsive listing grid. */
export default function ApartmentGrid({
  apartments,
  renderCard,
  distances,
  favorites,
  onToggleFavorite,
}: ApartmentGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-4 sm:gap-6">
      {apartments.map((apartment, index) => {
        const card = (
          <ApartmentCard
            apartment={apartment}
            distanceKm={distances?.[apartment.id]}
            loading={index === 0 ? "eager" : "lazy"}
            isFavorite={
              favorites ? favorites.includes(apartment.id) : apartment.favorite
            }
            onToggleFavorite={onToggleFavorite}
          />
        );
        return (
          <Fragment key={apartment.id}>
            {renderCard ? renderCard(card, index) : card}
          </Fragment>
        );
      })}
    </div>
  );
}
