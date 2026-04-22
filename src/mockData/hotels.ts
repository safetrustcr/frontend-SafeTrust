import type { HotelListing } from '@/@types/hotel';

export const STUB_HOTELS: HotelListing[] = [
  {
    id: '1',
    name: 'La sabana sur',
    address: '329 Calle santos, paseo colón, San José',
    price: 4058,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
    promoted: true,
    images: [
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
    ],
    category: 'Family',
    location: 'San José',
    owner: { name: 'Alberto Casas', avatar: '/img/person.png' },
    description:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
    favorite: false,
  },
  {
    id: '2',
    name: 'Los yoses',
    address: '329 Calle santos, paseo colón, San José',
    price: 4000,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: true,
    promoted: false,
    images: [
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
    ],
    category: 'Students',
    location: 'San José',
    owner: { name: 'Alberto Casas', avatar: '/img/person.png' },
    description:
      'Compact apartment near key routes with bright interiors and fast access to the city center.',
    favorite: false,
  },
  {
    id: '3',
    name: 'Paseo Colón Loft',
    address: '225 Avenida central, paseo colón, San José',
    price: 3980,
    bedrooms: 1,
    bathrooms: 1,
    petFriendly: false,
    promoted: false,
    images: [
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
    ],
    category: 'Travelers',
    location: 'San José',
    owner: { name: 'Randall Valenciano', avatar: '/img/person.png' },
    description:
      'Loft-style living with clean finishes, natural light, and walkable access to major amenities.',
    favorite: true,
  },
  {
    id: '4',
    name: 'Heredia Central',
    address: '101 Calle norte, Heredia centro, Heredia',
    price: 4120,
    bedrooms: 3,
    bathrooms: 2,
    petFriendly: true,
    promoted: true,
    images: [
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
    ],
    category: 'Family',
    location: 'Heredia',
    owner: { name: 'María López', avatar: '/img/person.png' },
    description:
      'Larger family-ready floor plan with flexible living space and strong natural ventilation.',
    favorite: false,
  },
  {
    id: '5',
    name: 'Alajuela Heights',
    address: '78 Ruta 3, Alajuela, Alajuela',
    price: 3895,
    bedrooms: 2,
    bathrooms: 1,
    petFriendly: false,
    promoted: false,
    images: [
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
    ],
    category: 'Travelers',
    location: 'Alajuela',
    owner: { name: 'Luis Salas', avatar: '/img/person.png' },
    description:
      'Quiet rental with a warm palette, ideal for medium stays and airport-adjacent access.',
    favorite: true,
  },
  {
    id: '6',
    name: 'Cartago View',
    address: '54 Vista real, Cartago, Cartago',
    price: 4215,
    bedrooms: 3,
    bathrooms: 2,
    petFriendly: true,
    promoted: false,
    images: [
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
      '/img/house1.jpg',
    ],
    category: 'Students',
    location: 'Cartago',
    owner: { name: 'Ana Ruiz', avatar: '/img/person.png' },
    description:
      'Balanced shared-living layout with comfortable bedrooms and a practical amenity mix.',
    favorite: false,
  },
];

export const HOTEL_CATEGORIES = ['Family', 'Students', 'Travelers'] as const;

export const HOTEL_LOCATIONS = [
  'San José',
  'Heredia',
  'Alajuela',
  'Cartago',
  'Puntarenas',
  'Guanacaste',
  'Limón',
] as const;

export const BEDROOM_FILTERS = [
  { label: 'All apartments', value: 'all' },
  { label: '1 bedroom', value: '1' },
  { label: '2 bedrooms', value: '2' },
  { label: '3 bedrooms', value: '3' },
] as const;

export function getHotelById(id: string) {
  return STUB_HOTELS.find((hotel) => hotel.id === id) ?? STUB_HOTELS[0];
}

export function getSuggestedHotels(activeId: string) {
  return STUB_HOTELS.filter((hotel) => hotel.id !== activeId).slice(0, 5);
}
