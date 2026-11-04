import type { Listing } from "../model/types";
import { listListings } from "./listings";
import type { HotelSearch } from "../model/hotel-search";

/** Hotels are listing records (see model/types.ts). */
export function searchHotels({ where }: HotelSearch): Listing[] {
  const hotels = listListings();
  const q = where.toLocaleLowerCase("es-CR");
  if (!q) return hotels;
  return hotels.filter((hotel) =>
    `${hotel.name} ${hotel.address} ${hotel.location}`
      .toLocaleLowerCase("es-CR")
      .includes(q),
  );
}
