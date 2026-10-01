import type { GeoPoint } from "@/@types/destination";

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in km (haversine). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function sortByDistance<T>(
  items: T[],
  origin: GeoPoint,
  getPoint: (item: T) => GeoPoint,
): Array<T & { distanceKm: number }> {
  return items
    .map((item) => ({
      ...item,
      distanceKm: distanceKm(origin, getPoint(item)),
    }))
    .sort((left, right) => left.distanceKm - right.distanceKm);
}
