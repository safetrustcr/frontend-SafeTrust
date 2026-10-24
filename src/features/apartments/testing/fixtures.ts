import type { ApartmentInput } from "../repository";

export const sampleInput: ApartmentInput = {
  name: "Escazú Loft",
  description: "Bright loft near the park.",
  price: 1100,
  warrantyDeposit: 2200,
  address: {
    street: "Calle 5",
    neighborhood: "San Rafael",
    city: "Escazú",
    country: "Costa Rica",
  },
  coordinates: { lat: 9.93, lng: -84.06 },
  isAvailable: true,
  availableFrom: "2026-11-01T00:00:00.000Z",
  availableUntil: null,
  bedrooms: 2,
  bathrooms: 1,
  petFriendly: false,
  imageUrls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
};
