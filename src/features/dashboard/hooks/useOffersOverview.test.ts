import { renderHook } from "@testing-library/react";
import { MOCK_APARTMENTS } from "@/lib/mockData/apartments";
import { MOCK_RENTAL_OFFERS } from "@/lib/mockData/offers";
import { useOffersOverview } from "./useOffersOverview";

const apartments = [...MOCK_APARTMENTS];

afterEach(() => {
  MOCK_APARTMENTS.splice(0, MOCK_APARTMENTS.length, ...apartments);
});

describe("useOffersOverview", () => {
  it("lists every demo property once and counts the actual rental offers", () => {
    const { result } = renderHook(() => useOffersOverview());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toHaveLength(MOCK_APARTMENTS.length);
    expect(result.current.data.map((property) => property.apartmentId)).toEqual(
      MOCK_APARTMENTS.map((apartment) => apartment.id),
    );
    for (const property of result.current.data) {
      expect(property.offers).toBe(
        (MOCK_RENTAL_OFFERS[property.apartmentId] ?? []).length,
      );
    }
    // The old listing summary has a stale count of 2; the detail has 10.
    expect(result.current.data[0]).toEqual({
      apartmentId: "1",
      name: MOCK_APARTMENTS[0].name,
      address: "Calle 42, Avenida 8, San Jos\u00e9",
      offers: 10,
    });
  });

  it("keeps properties with zero offers in the overview", () => {
    const { result } = renderHook(() => useOffersOverview());
    expect(
      result.current.data.find((property) => property.apartmentId === "2"),
    ).toMatchObject({ name: "Los Yoses Apartment", offers: 0 });
  });

  it("returns no rows when the owner has no properties", () => {
    MOCK_APARTMENTS.splice(0);
    const { result } = renderHook(() => useOffersOverview());
    expect(result.current.data).toEqual([]);
  });

  it("preserves UUID ids and uses the location when the address is empty", () => {
    const apartment = {
      ...apartments[0],
      id: "3f1c2b0a-a246-4519-a8ca-b94494429623",
      address: {},
      location: "Heredia",
    };
    MOCK_APARTMENTS.splice(0, MOCK_APARTMENTS.length, apartment);
    const { result } = renderHook(() => useOffersOverview());
    expect(result.current.data).toEqual([
      {
        apartmentId: apartment.id,
        name: apartment.name,
        address: "Heredia",
        offers: 0,
      },
    ]);
  });

  it("does not include applicant information in the summary", () => {
    const { result } = renderHook(() => useOffersOverview());
    for (const property of result.current.data) {
      expect(Object.keys(property).sort()).toEqual([
        "address",
        "apartmentId",
        "name",
        "offers",
      ]);
    }
  });
});
