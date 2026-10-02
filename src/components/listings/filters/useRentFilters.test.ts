import { act, renderHook } from "@testing-library/react";
import { resolveSortOption, useRentFilters } from "./useRentFilters";

const mockRouterReplace = jest.fn();
let mockSearchParams = "";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
  usePathname: () => "/rent",
  useSearchParams: () => new URLSearchParams(mockSearchParams),
}));

describe("useRentFilters", () => {
  beforeEach(() => {
    mockRouterReplace.mockClear();
    mockSearchParams = "";
  });

  it.each([
    ["nearest", false, "relevance"],
    ["nearest", true, "nearest"],
    ["price-low", false, "price-low"],
  ] as const)(
    "resolves %s with distance sorting available=%s to %s",
    (sort, canSortByDistance, expected) => {
      expect(resolveSortOption(sort, canSortByDistance)).toBe(expected);
    },
  );

  it("composes rapid filter patches before URL params update", () => {
    const { result } = renderHook(() => useRentFilters());

    act(() => {
      result.current.setFilters({ location: "Heredia" });
      result.current.setFilters({ bedrooms: "2" });
    });

    expect(mockRouterReplace).toHaveBeenLastCalledWith(
      "/rent?location=Heredia&bedrooms=2",
      { scroll: false },
    );
  });

  it("keeps clear-all state for updates before navigation commits", () => {
    mockSearchParams = "location=San%20Jos%C3%A9&categories=Family";
    const { result } = renderHook(() => useRentFilters());

    act(() => {
      result.current.reset();
      result.current.setFilters({ bedrooms: "2" });
    });

    expect(mockRouterReplace.mock.calls).toEqual([
      ["/rent", { scroll: false }],
      ["/rent?bedrooms=2", { scroll: false }],
    ]);
  });
});
