import type { GeoPoint } from "@/types/geo";

/**
 * The listing model shared by /rent, /hotels, /room and the wishlist.
 *
 * Hotels and apartments are one model: every hotel the app shows today is
 * an apartment listing record (see docs/ARCHITECTURE.md, "Listings and
 * hotels"), so there is no `kind` discriminator yet.
 */
export const LISTING_CATEGORIES = ["Family", "Students", "Travelers"] as const;

export const LISTING_LOCATIONS = [
  "San José",
  "Heredia",
  "Alajuela",
  "Cartago",
  "Puntarenas",
  "Guanacaste",
  "Limón",
] as const;

export type Category = (typeof LISTING_CATEGORIES)[number];
export type Location = (typeof LISTING_LOCATIONS)[number];

export interface ApartmentAmenitySummary {
  bedrooms: number;
  bathrooms: number;
  petFriendly: boolean;
}

export interface ApartmentOwner {
  name: string;
  avatar: string;
  /** Host payout wallet (Stellar public key). Escrow bookings need it. */
  walletAddress?: string;
}

/**
 * Demo availability, relative to the guest's local "today":
 * published nights are [today, today + horizonDays),
 * each booking blocks [today + startDay, today + startDay + nights).
 */
export interface DemoAvailability {
  horizonDays: number;
  booked: Array<{ startDay: number; nights: number }>;
}

/** One stay: an apartment on /rent, a hotel on /hotels. */
export interface Listing extends ApartmentAmenitySummary {
  id: string;
  name: string;
  address: string;
  coordinates: GeoPoint;
  price: number;
  promoted: boolean;
  images: string[];
  category: Category;
  location: Location;
  owner: ApartmentOwner;
  description: string;
  rating: number;
  /** Adults + children. Never derived from bedrooms. */
  maxGuests?: number;
  maxInfants?: number;
  favorite?: boolean;
  availability?: DemoAvailability;
}

/** A province tile; its location is the value used by the rental URL filter. */
export interface Destination {
  id: string;
  location: Location;
  name: string;
  tagline: string;
  imageUrl: string;
  coordinates: GeoPoint;
  category?: Category;
}
