export type ApartmentOccupancyStatus = "inhabited" | "not_inhabited";

export interface Apartment {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  warranty_deposit: number;
  is_available: boolean;
  image_urls?: string[] | null;
  address: {
    street?: string;
    neighborhood?: string;
    city?: string;
    country?: string;
  };
  location: string;
  offers: number;
  status: ApartmentOccupancyStatus;
  promoted: boolean;
  available_from: string;
  available_until?: string | null;
  created_at: string;
  owner_id: string;
}
