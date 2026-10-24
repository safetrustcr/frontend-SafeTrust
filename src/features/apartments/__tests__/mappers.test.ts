import { GraphQLError } from "@/lib/hasura/gql";
import {
  describeApartmentError,
  fromPoint,
  fromRow,
  toInsertObject,
  toPoint,
  type ApartmentRow,
} from "../mappers";
import { sampleInput } from "../testing/fixtures";

describe("apartment mappers", () => {
  it("sends coordinates as (lng,lat), the order Postgres POINT uses", () => {
    expect(toPoint({ lat: 9.93, lng: -84.06 })).toBe("(-84.06,9.93)");
  });

  it("reads a POINT back into lat and lng", () => {
    expect(fromPoint("(-84.06,9.93)")).toEqual({ lat: 9.93, lng: -84.06 });
    expect(fromPoint(toPoint({ lat: -33.4, lng: 151.2 }))).toEqual({
      lat: -33.4,
      lng: 151.2,
    });
    expect(fromPoint("(1e-05,-2.5E-3)")).toEqual({
      lat: -0.0025,
      lng: 0.00001,
    });
    expect(fromPoint(null)).toBeNull();
    expect(fromPoint("not a point")).toBeNull();
  });

  it("builds the insert object without owner_id or image_urls", () => {
    const object = toInsertObject(sampleInput);
    expect(object).not.toHaveProperty("owner_id");
    expect(object).not.toHaveProperty("image_urls");
    expect(object).toEqual({
      name: "Escazú Loft",
      description: "Bright loft near the park.",
      price: 1100,
      warranty_deposit: 2200,
      address: sampleInput.address,
      coordinates: "(-84.06,9.93)",
      is_available: true,
      available_from: "2026-11-01T00:00:00.000Z",
      available_until: null,
      bedrooms: 2,
      bathrooms: 1,
      pet_friendly: false,
    });
  });

  it("sends null coordinates when there are none", () => {
    expect(
      toInsertObject({ ...sampleInput, coordinates: null }).coordinates,
    ).toBeNull();
  });

  it("maps a Hasura row to an OwnedApartment", () => {
    const row: ApartmentRow = {
      id: "6f1c2a7e-1111-4222-8333-944455556666",
      name: "Escazú Loft",
      description: null,
      price: "1100.00",
      warranty_deposit: 2200,
      address: { street: "Calle 5", city: "Escazú" },
      coordinates: "(-84.06,9.93)",
      is_available: false,
      available_from: "2026-11-01T00:00:00+00:00",
      available_until: null,
      bedrooms: 2,
      bathrooms: 1,
      pet_friendly: null,
      created_at: "2026-10-01T10:00:00+00:00",
    };

    expect(fromRow(row, ["https://example.com/a.jpg"])).toEqual({
      id: "6f1c2a7e-1111-4222-8333-944455556666",
      name: "Escazú Loft",
      description: null,
      price: 1100,
      warrantyDeposit: 2200,
      address: {
        street: "Calle 5",
        neighborhood: "",
        city: "Escazú",
        country: "",
      },
      coordinates: { lat: 9.93, lng: -84.06 },
      isAvailable: false,
      availableFrom: "2026-11-01T00:00:00+00:00",
      availableUntil: null,
      bedrooms: 2,
      bathrooms: 1,
      petFriendly: false,
      imageUrls: ["https://example.com/a.jpg"],
      createdAt: "2026-10-01T10:00:00+00:00",
      offers: 0,
    });
  });
});

describe("describeApartmentError", () => {
  it("maps the price check constraint to the price field", () => {
    const error = new GraphQLError(
      'Check constraint violation. new row for relation "apartments" violates check constraint "apartments_price_check"',
      "constraint-violation",
    );
    expect(describeApartmentError(error)).toEqual({
      field: "price",
      message: "Price must be greater than 0.",
    });
  });

  it("maps the warranty deposit check constraint to its field", () => {
    const error = new GraphQLError(
      'violates check constraint "apartments_warranty_deposit_check"',
      "constraint-violation",
    );
    expect(describeApartmentError(error)).toEqual({
      field: "warrantyDeposit",
      message: "Warranty deposit must be greater than 0.",
    });
  });

  it("maps the date range constraint to Available Until", () => {
    const error = new GraphQLError(
      'violates check constraint "valid_date_range"',
      "constraint-violation",
    );
    expect(describeApartmentError(error)).toEqual({
      field: "availableUntil",
      message: "Available Until must be later than Available From.",
    });
  });

  it("maps a Not-NULL coordinates violation to the latitude field", () => {
    const error = new GraphQLError(
      'Not-NULL violation. null value in column "coordinates" of relation "apartments" violates not-null constraint',
      "constraint-violation",
    );
    expect(describeApartmentError(error)).toEqual({
      field: "latitude",
      message: "Enter both latitude and longitude.",
    });
  });

  it("asks to retry on network errors", () => {
    expect(describeApartmentError(new GraphQLError("NETWORK"))).toEqual({
      message:
        "Couldn't reach the server. Check your connection and try again.",
    });
  });

  it("asks to sign in again when there is no session", () => {
    expect(describeApartmentError(new GraphQLError("UNAUTHENTICATED"))).toEqual(
      { message: "Your session has expired. Sign in again and retry." },
    );
  });

  it("explains permission errors", () => {
    const error = new GraphQLError(
      "check constraint of an insert/update permission has failed",
      "permission-error",
    );
    expect(describeApartmentError(error)).toEqual({
      message: "You don't have permission to change this apartment.",
    });
  });

  it("shows any other backend message as is", () => {
    const error = new GraphQLError(
      "Apartment has active reservations and can't be removed",
      "unexpected",
    );
    expect(describeApartmentError(error)).toEqual({
      message: "Apartment has active reservations and can't be removed",
    });
    expect(describeApartmentError(new Error("Apartment not found"))).toEqual({
      message: "Apartment not found",
    });
    expect(describeApartmentError("boom")).toEqual({
      message: "Something went wrong. Please try again.",
    });
  });
});
