"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InterestedPeopleTable } from "@/components/dashboard/apartments/InterestedPeopleTable";
import { PropertySummaryHeader } from "@/components/dashboard/apartments/PropertySummaryHeader";
import { useApartmentOffers } from "@/hooks/useApartmentOffers";

export default function InterestedPeoplePage() {
  const params = useParams();
  const router = useRouter();
  const apartmentId = Number(params.id);
  const { data, loading, error } = useApartmentOffers(apartmentId);

  if (!apartmentId || Number.isNaN(apartmentId) || (!data.apartment && !loading && !error)) {
    router.push("/dashboard/apartments");
    return null;
  }

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  }

  if (error) {
    return <div className="space-y-6"><Button variant="ghost" onClick={() => router.push("/dashboard/apartments")} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to apartments</Button><div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6"><p className="text-destructive">Error loading data. Please try again later.</p></div></div>;
  }

  if (!data.apartment) return null;

  const address = [data.apartment.address.street, data.apartment.address.city].filter(Boolean).join(", ");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/apartments")} className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
        <h2 className="text-lg font-medium text-muted-foreground">Interested people</h2>
      </div>
      <PropertySummaryHeader name={data.apartment.name} address={address || data.apartment.location} bedrooms={data.apartment.bedrooms} bathrooms={data.apartment.bathrooms} price={data.apartment.price} />
      <InterestedPeopleTable offers={data.offers} totalCount={data.totalCount} isLoading={loading} />
    </div>
  );
}
