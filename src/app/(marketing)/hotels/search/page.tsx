"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layouts/Header";
import { PageContainer } from "@/components/layouts/PageContainer";
import { PageHeader } from "@/components/layouts/PageHeader";
import HotelSearchForm from "@/components/hotels/HotelSearchForm";
import { DemoBadge } from "@/components/ui/demo-badge";
import { parseHotelSearch, searchHotels } from "@/features/hotels";

const HotelGrid = dynamic(
  () => import("@/components/hotels/overall/HotelGrid"),
  {
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
  },
);

function HotelSearchContent() {
  const params = useSearchParams();
  const search = parseHotelSearch(new URLSearchParams(params.toString()));
  const hotels = searchHotels(search);
  const count = hotels.length;

  return (
    <>
      <Header />
      <PageContainer className="pb-12 pt-24">
        <PageHeader
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              Find hotel to stay
              <DemoBadge />
            </span>
          }
          description={
            search.where ? `Searching for “${search.where}”` : undefined
          }
        />

        <HotelSearchForm
          key={`${search.where}|${search.from}|${search.to}`}
          initial={search}
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "stay" : "stays"}
          </p>
          <Link
            href="/hotels/search"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-4">
          {count === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">
                {search.where
                  ? `No stays match “${search.where}”.`
                  : "No stays found."}
              </p>
              <Link
                href="/hotels/search"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                Clear search
              </Link>
            </div>
          ) : (
            <HotelGrid hotels={hotels} from={search.from} to={search.to} />
          )}
        </div>
      </PageContainer>
    </>
  );
}

export default function HotelSearch() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background pt-24">
          <span className="sr-only">Loading hotel search…</span>
        </div>
      }
    >
      <HotelSearchContent />
    </Suspense>
  );
}
