import { distanceKm, sortByDistance } from "./geo";

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
