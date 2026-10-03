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
  favorite?: boolean;
}

export interface HotelSearchResult {
  id: number;
  name: string;
  image: string;
  location: string;
  stars: number;
  price: number;
  isFavorite: boolean;
}
