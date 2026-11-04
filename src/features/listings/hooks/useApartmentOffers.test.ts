import { renderHook } from "@testing-library/react";
import { MOCK_APARTMENTS } from "@/lib/mockData/apartments";
import { MOCK_RENTAL_OFFERS } from "@/lib/mockData/offers";
import { useApartmentOffers } from "./useApartmentOffers";

describe("useApartmentOffers", () => {
  it("returns the apartment and its offers using a string id", () => {
    const { result } = renderHook(() => useApartmentOffers("1"));

    expect(result.current.data).toEqual({
      apartment: MOCK_APARTMENTS[0],
      offers: MOCK_RENTAL_OFFERS["1"],
      totalCount: 10,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns an empty offer list for a property without offers", () => {
    const { result } = renderHook(() => useApartmentOffers("2"));

    expect(result.current.data.apartment?.id).toBe("2");
    expect(result.current.data.offers).toEqual([]);
    expect(result.current.data.totalCount).toBe(0);
  });

  it.each(["3f1c2b0a-a246-4519-a8ca-b94494429623", "01", "unknown"])(
    "does not coerce the unknown id %s into a mock id",
    (id) => {
      const { result } = renderHook(() => useApartmentOffers(id));

      expect(result.current.data).toEqual({
        apartment: null,
        offers: [],
        totalCount: 0,
      });
    },
  );

  it("supports an existing UUID without converting it to a number", () => {
    const apartment = {
      ...MOCK_APARTMENTS[0],
      id: "3f1c2b0a-a246-4519-a8ca-b94494429623",
    };
    MOCK_APARTMENTS.push(apartment);
    MOCK_RENTAL_OFFERS[apartment.id] = MOCK_RENTAL_OFFERS["1"];
    try {
      const { result } = renderHook(() => useApartmentOffers(apartment.id));
      expect(result.current.data.apartment).toBe(apartment);
      expect(result.current.data.totalCount).toBe(10);
    } finally {
      MOCK_APARTMENTS.pop();
      delete MOCK_RENTAL_OFFERS[apartment.id];
    }
  });
});
