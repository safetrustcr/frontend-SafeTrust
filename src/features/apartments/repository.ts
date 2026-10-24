export interface ApartmentInput {
  name: string;
  description: string | null;
  /** > 0, same unit as /rent prices. */
  price: number;
  warrantyDeposit: number;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    country: string;
  };
  coordinates: { lat: number; lng: number } | null;
  isAvailable: boolean;
  /** ISO dates. */
  availableFrom: string;
  availableUntil: string | null;
  bedrooms: number;
  bathrooms: number;
  petFriendly: boolean;
  imageUrls: string[];
}

export interface OwnedApartment extends ApartmentInput {
  id: string;
  createdAt: string;
  offers: number;
}

export interface ApartmentsRepository {
  readonly mode: "demo" | "live";
  listMine(): Promise<OwnedApartment[]>;
  /** null = missing or not yours. */
  get(id: string): Promise<OwnedApartment | null>;
  create(input: ApartmentInput): Promise<OwnedApartment>;
  update(id: string, input: ApartmentInput): Promise<OwnedApartment>;
  /** Soft delete (deleted_at). */
  remove(id: string): Promise<void>;
}
