import HotelGrid from "./HotelGrid";
import SearchFilters from "./SearchFilters";
import { PageHeader } from "@/components/layouts/PageHeader";

export default function HotelBookingContainer() {
  return (
    <div className="p-6 w-full">
      <PageHeader title="Find hotel to stay" />

      {/* Search and Filters */}
      <SearchFilters />

      {/* Hotel Grid */}
      <HotelGrid />
    </div>
  );
}
