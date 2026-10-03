import { MOCK_APARTMENTS } from "@/lib/mockData/apartments";
import type { Apartment } from "@/types/apartment";

interface UseApartmentsOptions {
  limit: number;
  offset: number;
  search?: string;
}

interface UseApartmentsResult {
  data: {
    apartments: Apartment[];
    apartments_aggregate: { aggregate: { count: number } };
  };
  loading: boolean;
  error: undefined;
}

/**
 * Drop-in replacement for Apollo's useQuery(GET_APARTMENTS, ...)
 * Returns the SAME shape so components don't need to change.
 */
export function useApartments({
  limit,
  offset,
  search = "",
}: UseApartmentsOptions): UseApartmentsResult {
  const query = search.trim().toLowerCase();

  const filtered = query
    ? MOCK_APARTMENTS.filter(
        (apartment) =>
          apartment.name.toLowerCase().includes(query) ||
          apartment.location.toLowerCase().includes(query),
      )
    : MOCK_APARTMENTS;

  const paged = filtered.slice(offset, offset + limit);

  return {
    data: {
      apartments: paged,
      apartments_aggregate: {
        aggregate: { count: filtered.length },
      },
    },
    loading: false,
    error: undefined,
  };
}
