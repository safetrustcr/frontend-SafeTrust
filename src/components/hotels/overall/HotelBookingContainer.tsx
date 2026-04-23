import HotelGrid from "./HotelGrid";
import SearchFilters from "./SearchFilters";

export default function HotelBookingContainer() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-semibold mb-4">Find hotel to stay</h1>

      {/* Search and Filters */}
      <SearchFilters />

      {/* Hotel Grid */}
      <HotelGrid />
    </div>
  );
}
