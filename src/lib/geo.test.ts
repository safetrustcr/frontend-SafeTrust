import {
  directionsUrl,
  distanceKm,
  isValidCoordinate,
  sortByDistance,
} from "./geo";

describe("geo utilities", () => {
  const sanJose = { lat: 9.9281, lng: -84.0907 };

  it("calculates the great-circle distance from San Jose to Liberia", () => {
    const liberia = { lat: 10.6346, lng: -85.4407 };

    expect(distanceKm(sanJose, liberia)).toBeGreaterThanOrEqual(150);
    expect(distanceKm(sanJose, liberia)).toBeLessThanOrEqual(170);
  });

  it("returns items in nearest-first order with their distances", () => {
    const places = [
      { name: "Liberia", coordinates: { lat: 10.6346, lng: -85.4407 } },
      { name: "Heredia", coordinates: { lat: 9.9982, lng: -84.1198 } },
    ];

    const sorted = sortByDistance(
      places,
      sanJose,
      (place) => place.coordinates,
    );

    expect(sorted.map((place) => place.name)).toEqual(["Heredia", "Liberia"]);
    expect(sorted[0].distanceKm).toBeLessThan(sorted[1].distanceKm);
  });
});

describe("isValidCoordinate", () => {
  it("rejects missing and non-finite values", () => {
    expect(isValidCoordinate(null)).toBe(false);
    expect(isValidCoordinate(undefined)).toBe(false);
    expect(isValidCoordinate({ lat: NaN, lng: 0 })).toBe(false);
  });

  it("rejects out-of-range values", () => {
    expect(isValidCoordinate({ lat: 91, lng: 0 })).toBe(false);
    expect(isValidCoordinate({ lat: 0, lng: -181 })).toBe(false);
  });

  it("accepts a real coordinate", () => {
    expect(isValidCoordinate({ lat: 9.93, lng: -84.06 })).toBe(true);
  });
});

describe("directionsUrl", () => {
  it("builds a Google Maps directions link with six decimals", () => {
    expect(directionsUrl({ lat: 9.9352, lng: -84.0611 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=9.935200,-84.061100",
    );
  });
});
