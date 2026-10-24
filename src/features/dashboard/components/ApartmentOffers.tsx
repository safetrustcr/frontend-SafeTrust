"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { InterestedPeopleTable } from "@/components/dashboard/apartments/InterestedPeopleTable";
import { PropertySummaryHeader } from "@/components/dashboard/apartments/PropertySummaryHeader";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useApartmentOffers } from "@/hooks/useApartmentOffers";
import { OffersLayout } from "./OffersLayout";
import { OffersErrorState, OffersSkeleton } from "./OffersStates";

export function ApartmentOffers() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useApartmentOffers(id);

  function renderContent() {
    if (loading) return <OffersSkeleton />;
    if (error) {
      return (
        <OffersErrorState
          onRetry={() => window.location.reload()}
          backHref="/dashboard/apartments"
        />
      );
    }
    if (!data.apartment) {
      return (
        <EmptyState
          title="Property not found"
          description="It may have been removed, or it isn't yours."
          action={
            <Button asChild variant="outline">
              <Link href="/dashboard/apartments/offers">Back to offers</Link>
            </Button>
          }
        />
      );
    }

    const address = [data.apartment.address.street, data.apartment.address.city]
      .filter(Boolean)
      .join(", ");

    return (
      <>
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/dashboard/apartments/offers">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to offers
          </Link>
        </Button>
        <PropertySummaryHeader
          name={data.apartment.name}
          address={address || data.apartment.location}
          bedrooms={data.apartment.bedrooms}
          bathrooms={data.apartment.bathrooms}
          price={data.apartment.price}
        />
        {data.offers.length === 0 ? (
          <EmptyState
            title="No offers yet"
            description="People interested in this property will appear here."
          />
        ) : (
          <InterestedPeopleTable
            offers={data.offers}
            totalCount={data.totalCount}
          />
        )}
      </>
    );
  }

  return (
    <OffersLayout>
      <PageHeader
        title="Interested people"
        description="People interested in this property."
        actions={<DemoBadge />}
      />
      {renderContent()}
    </OffersLayout>
  );
}
