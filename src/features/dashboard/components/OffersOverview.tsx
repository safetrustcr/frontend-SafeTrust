"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useOffersOverview } from "@/hooks/useOffersOverview";
import { OffersLayout } from "./OffersLayout";
import { OffersErrorState, OffersSkeleton } from "./OffersStates";

export function OffersOverview() {
  const { data, loading, error } = useOffersOverview();

  return (
    <OffersLayout>
      <PageHeader
        title="Offers"
        description="People interested in your properties."
        actions={<DemoBadge />}
      />
      {loading ? (
        <OffersSkeleton />
      ) : error ? (
        <OffersErrorState
          onRetry={() => window.location.reload()}
          backHref="/dashboard/apartments"
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="You haven't listed a property yet"
          description="List a property to start receiving offers."
          action={
            <Button asChild>
              <Link href="/dashboard/apartments/new">List a property</Link>
            </Button>
          }
        />
      ) : (
        <ul
          aria-label="Property offers"
          className="divide-y divide-border rounded-lg border border-border"
        >
          {data.map((property) => (
            <li key={property.apartmentId}>
              <Link
                href={`/dashboard/apartments/${encodeURIComponent(property.apartmentId)}/offers`}
                className="flex items-center justify-between gap-4 rounded-lg p-4 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {property.name}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {property.address}
                  </span>
                </span>
                <span className="shrink-0 text-sm">
                  {property.offers === 0
                    ? "No offers yet"
                    : `${property.offers} ${property.offers === 1 ? "offer" : "offers"}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </OffersLayout>
  );
}
