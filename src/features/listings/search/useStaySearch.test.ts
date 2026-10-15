import { renderHook } from "@testing-library/react";
import { addDays, localToday } from "./date-only";
import { useStaySearch } from "./useStaySearch";

let mockSearchParams = "";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearchParams),
}));

describe("useStaySearch", () => {
  beforeEach(() => {
    mockSearchParams = "";
  });

  it("parses the current URL into the stay search contract", () => {
    const today = localToday();
    const checkIn = addDays(today, 10);
    const checkOut = addDays(today, 15);
    mockSearchParams = `q=tamarindo&adults=2&checkIn=${checkIn}&checkOut=${checkOut}`;

    const { result } = renderHook(() => useStaySearch());

    expect(result.current.today).toBe(today);
    expect(result.current.search).toEqual({
      q: "tamarindo",
      place: null,
      guests: { adults: 2, children: 0, infants: 0, pets: 0 },
      dates: { mode: "exact", checkIn, checkOut, tolerance: 0 },
    });
  });

  it("re-parses when the URL changes and keeps today fixed", () => {
    const { result, rerender } = renderHook(() => useStaySearch());
    const firstToday = result.current.today;
    expect(result.current.search).toEqual({
      q: "",
      place: null,
      guests: { adults: 0, children: 0, infants: 0, pets: 0 },
      dates: { mode: "any" },
    });

    mockSearchParams = "q=escalante&stay=week&months=2026-11";
    rerender();

    expect(result.current.search.q).toBe("escalante");
    expect(result.current.today).toBe(firstToday);
  });
});
