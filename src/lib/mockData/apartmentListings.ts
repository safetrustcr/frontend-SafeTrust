import type { ApartmentListing } from "@/types/hotel";

export const APARTMENT_LISTINGS: ApartmentListing[] = [
  {
    id: "1",
    name: "La sabana sur",
    address: "329 Calle santos, paseo colón, San José",
    coordinates: { lat: 9.9281, lng: -84.0907 },
    price: 4058,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
    promoted: true,
    images: [
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
    ],
    category: "Family",
    location: "San José",
    owner: { name: "Alberto Casas", avatar: "/img/person.jpg" },
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    favorite: false,
  },
  {
    id: "2",
    name: "Los yoses",
    address: "329 Calle santos, paseo colón, San José",
    coordinates: { lat: 9.9366, lng: -84.0703 },
    price: 4000,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
    promoted: false,
    images: [
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
    ],
    category: "Students",
    location: "San José",
    owner: { name: "Alberto Casas", avatar: "/img/person.jpg" },
    description:
      "Compact apartment near key routes with bright interiors and fast access to the city center.",
    favorite: false,
  },
  {
    id: "3",
    name: "Paseo Colón Loft",
    address: "225 Avenida central, paseo colón, San José",
    coordinates: { lat: 9.9362, lng: -84.1024 },
    price: 3980,
    bedrooms: 1,
    bathrooms: 1,
    petFriendly: false,
    promoted: false,
    images: [
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
    ],
    category: "Travelers",
    location: "San José",
    owner: { name: "Randall Valenciano", avatar: "/img/person.jpg" },
    description:
      "Loft-style living with clean finishes, natural light, and walkable access to major amenities.",
    favorite: true,
  },
  {
    id: "4",
    name: "Heredia Central",
    address: "101 Calle norte, Heredia centro, Heredia",
    coordinates: { lat: 9.9982, lng: -84.1198 },
    price: 4120,
    bedrooms: 3,
    bathrooms: 2,
    petFriendly: true,
    promoted: true,
    images: [
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
    ],
    category: "Family",
    location: "Heredia",
    owner: { name: "María López", avatar: "/img/person.jpg" },
    description:
      "Larger family-ready floor plan with flexible living space and strong natural ventilation.",
    favorite: false,
  },
  {
    id: "5",
    name: "Alajuela Heights",
    address: "78 Ruta 3, Alajuela, Alajuela",
    coordinates: { lat: 10.0163, lng: -84.2116 },
    price: 3895,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: false,
    promoted: false,
    images: [
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
    ],
    category: "Travelers",
    location: "Alajuela",
    owner: { name: "Luis Salas", avatar: "/img/person.jpg" },
    description:
      "Quiet rental with a warm palette, ideal for medium stays and airport-adjacent access.",
    favorite: true,
  },
  {
    id: "6",
    name: "Cartago View",
    address: "54 Vista real, Cartago, Cartago",
    coordinates: { lat: 9.8644, lng: -83.9194 },
    price: 4215,
    bedrooms: 3,
    bathrooms: 2,
    petFriendly: true,
    promoted: false,
    images: [
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
      "/img/hotel/hotel1.jpg",
    ],
    category: "Students",
    location: "Cartago",
    owner: { name: "Ana Ruiz", avatar: "/img/person.jpg" },
    description:
      "Balanced shared-living layout with comfortable bedrooms and a practical amenity mix.",
    favorite: false,
  },
];

export const APARTMENT_CATEGORIES = [
  "Family",
  "Students",
  "Travelers",
] as const;

export const APARTMENT_LOCATIONS = [
  "San José",
  "Heredia",
  "Alajuela",
  "Cartago",
  "Puntarenas",
  "Guanacaste",
  "Limón",
] as const;

export const APARTMENT_BEDROOM_FILTERS = [
  { label: "All apartments", value: "all" },
  { label: "1 bedroom", value: "1" },
  { label: "2 bedrooms", value: "2" },
  { label: "3 bedrooms", value: "3" },
] as const;

export function getApartmentById(id: string) {
  return (
    APARTMENT_LISTINGS.find((apartment) => apartment.id === id) ??
    APARTMENT_LISTINGS[0]
  );
}

export function getSuggestedApartments(activeId: string) {
  return APARTMENT_LISTINGS.filter(
    (apartment) => apartment.id !== activeId,
  ).slice(0, 5);
}
