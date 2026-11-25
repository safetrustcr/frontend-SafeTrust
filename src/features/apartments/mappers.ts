import { GraphQLError } from "@/lib/hasura/gql";
import type { ApartmentInput, OwnedApartment } from "./repository";

type Coordinates = { lat: number; lng: number };

/** Postgres POINT is (x, y) = (lng, lat), as the backend's ST_MakePoint(lng, lat). */
export const toPoint = ({ lat, lng }: Coordinates) => `(${lng},${lat})`;

export function fromPoint(
  point: string | null | undefined,
): Coordinates | null {
  const match = /^\(\s*([-+\d.eE]+)\s*,\s*([-+\d.eE]+)\s*\)$/.exec(point ?? "");
  if (!match) return null;
  const lng = Number(match[1]);
  const lat = Number(match[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

/** Columns the client may write. owner_id is set by the backend from the token. */
export function toInsertObject(input: ApartmentInput) {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    warranty_deposit: input.warrantyDeposit,
    address: input.address,
    coordinates: input.coordinates ? toPoint(input.coordinates) : null,
    is_available: input.isAvailable,
    available_from: input.availableFrom,
    available_until: input.availableUntil,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    pet_friendly: input.petFriendly,
  };
}

export type ApartmentRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  warranty_deposit: number | string;
  address: Partial<ApartmentInput["address"]> | null;
  coordinates: string | null;
  is_available: boolean | null;
  available_from: string;
  available_until: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  pet_friendly: boolean | null;
  created_at: string;
};

export type ImageRow = { apartment_id: string; image_url: string };

export function fromRow(
  row: ApartmentRow,
  imageUrls: string[] = [],
): OwnedApartment {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    warrantyDeposit: Number(row.warranty_deposit),
    address: {
      street: row.address?.street ?? "",
      neighborhood: row.address?.neighborhood ?? "",
      city: row.address?.city ?? "",
      country: row.address?.country ?? "",
    },
    coordinates: fromPoint(row.coordinates),
    isAvailable: row.is_available ?? true,
    availableFrom: row.available_from,
    availableUntil: row.available_until,
    bedrooms: row.bedrooms ?? 1,
    bathrooms: row.bathrooms ?? 1,
    petFriendly: row.pet_friendly ?? false,
    imageUrls,
    createdAt: row.created_at,
    offers: 0,
  };
}

export type ApartmentField =
  "price" | "warrantyDeposit" | "availableUntil" | "latitude";

export type ApartmentErrorDetails = { message: string; field?: ApartmentField };

const CONSTRAINT_FIELDS: Array<[RegExp, Required<ApartmentErrorDetails>]> = [
  [
    /warranty_deposit_check/,
    {
      field: "warrantyDeposit",
      message: "Warranty deposit must be greater than 0.",
    },
  ],
  [/price_check/, { field: "price", message: "Price must be greater than 0." }],
  [
    /valid_date_range/,
    {
      field: "availableUntil",
      message: "Available Until must be later than Available From.",
    },
  ],
];

export const COORDINATES_REQUIRED = "Enter both latitude and longitude.";

/** A user-facing message (and the form field it belongs to, if any). */
export function describeApartmentError(error: unknown): ApartmentErrorDetails {
  if (error instanceof GraphQLError) {
    if (error.code === "NETWORK") {
      return {
        message:
          "Couldn't reach the server. Check your connection and try again.",
      };
    }
    if (error.code === "UNAUTHENTICATED" || error.code === "invalid-jwt") {
      return { message: "Your session has expired. Sign in again and retry." };
    }
    if (
      /coordinates/.test(error.message) &&
      (error.code === "constraint-violation" || /not-null/i.test(error.message))
    ) {
      return { field: "latitude", message: COORDINATES_REQUIRED };
    }
    if (error.code === "constraint-violation") {
      const match = CONSTRAINT_FIELDS.find(([pattern]) =>
        pattern.test(error.message),
      );
      if (match) return { ...match[1] };
    }
    if (error.code === "permission-error" || error.code === "access-denied") {
      return {
        message: "You don't have permission to change this apartment.",
      };
    }
  }
  if (error instanceof Error && error.message)
    return { message: error.message };
  return { message: "Something went wrong. Please try again." };
}
