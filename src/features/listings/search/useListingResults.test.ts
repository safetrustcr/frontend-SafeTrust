import { renderHook } from "@testing-library/react";
import { APARTMENT_LISTINGS } from "@/lib/mockData/apartmentListings";
import { useListingResults } from "./useListingResults";

let mockSearchParams = "";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearchParams),
  useRouter: () => ({ replace: jest.fn() }),
  usePathname: () => "/rent",
}));

describe("useListingResults", () => {
  beforeEach(() => {
    mockSearchParams = "";
  });

  it("uses the same URL-backed filters and accent-insensitive query", () => {
    mockSearchParams = "location=San+Jos%C3%A9&q=Nispero";

    const { result } = renderHook(() => useListingResults(APARTMENT_LISTINGS));

    expect(result.current.map((listing) => listing.id)).toEqual(["1"]);
  });

  it("returns no results when the search does not match", () => {
    mockSearchParams = "q=not-a-rental";

    const { result } = renderHook(() => useListingResults(APARTMENT_LISTINGS));

    expect(result.current).toEqual([]);
  });
});
