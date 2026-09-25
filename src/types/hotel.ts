export interface HotelAmenitySummary {
  bedrooms: number;
  bathrooms: number;
  petFriendly: boolean;
}

export interface HotelOwner {
  name: string;
  avatar: string;
}

export interface HotelListing extends HotelAmenitySummary {
  id: string;
  name: string;
  address: string;
  price: number;
  promoted: boolean;
  images: string[];
  category: 'Family' | 'Students' | 'Travelers';
  location:
    | 'San José'
    | 'Heredia'
    | 'Alajuela'
    | 'Cartago'
    | 'Puntarenas'
    | 'Guanacaste'
    | 'Limón';
  owner: HotelOwner;
  description: string;
  favorite?: boolean;
  stars?: number;
}

export type HotelCardData = Pick<HotelListing, "id" | "name" | "price" | "address"> & {
  image: string;
  isFavorite: boolean;
  stars?: number;
};

export const toHotelCard = (hotel: HotelListing): HotelCardData => ({
  id: hotel.id,
  name: hotel.name,
  price: hotel.price,
  address: hotel.address,
  image: hotel.images[0] ?? "/img/room1.png",
  isFavorite: hotel.favorite ?? false,
  stars: hotel.stars,
});
