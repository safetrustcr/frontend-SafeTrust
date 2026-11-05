import Link from "next/link";
import HotelGrid from "../grid/HotelGrid";
import HotelSearchForm from "./HotelSearchForm";
import { PageHeader } from "@/components/layouts/PageHeader";
import { DemoBadge } from "@/components/ui/demo-badge";
import { searchHotels } from "../../data/hotels";

const PREVIEW_COUNT = 6;

export default function HotelBookingContainer() {
  const hotels = searchHotels({
    where: "",
    from: null,
    to: null,
  }).slice(0, PREVIEW_COUNT);

  return (
    <div className="w-full p-6">
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            Find hotel to stay
            <DemoBadge />
          </span>
        }
      />

      <HotelSearchForm />

      <div className="mb-4 mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Featured stays</h2>
        <Link
          href="/hotels/search"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <HotelGrid hotels={hotels} />
    </div>
  );
}
