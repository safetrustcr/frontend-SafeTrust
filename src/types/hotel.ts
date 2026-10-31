import type { GeoPoint } from "@/types/destination";

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

export interface ApartmentListing extends ApartmentAmenitySummary {
  id: string;
  name: string;
  address: string;
  coordinates: GeoPoint;
  price: number;
  promoted: boolean;
  images: string[];
  category: "Family" | "Students" | "Travelers";
  location:
    | "San José"
    | "Heredia"
    | "Alajuela"
    | "Cartago"
    | "Puntarenas"
    | "Guanacaste"
    | "Limón";
  owner: ApartmentOwner;
  description: string;
  rating: number;
  /** Adults + children. Never derived from bedrooms. */
  maxGuests?: number;
  maxInfants?: number;
  favorite?: boolean;
  availability?: DemoAvailability;
}
