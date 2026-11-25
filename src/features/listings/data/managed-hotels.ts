import { create } from "zustand";

/**
 * Hotel management is a demo: the `safetrust` tenant has no `hotels` table
 * (listings live in `apartments`). Everything here stays in memory for the
 * current browser session and nothing leaves the browser.
 */
export interface HotelDraft {
  name: string;
  description: string;
  address: string;
  locationArea: string;
  lat: number;
  lng: number;
}

export interface ManagedHotel extends HotelDraft {
  id: string;
}

export const SEED_HOTELS: ManagedHotel[] = [
  {
    id: "1",
    name: "Metropolitan Tower",
    description: "Luxury hotel in downtown San José",
    address: "Avenida Central 100, San José",
    locationArea: "San José Centro",
    lat: 9.9281,
    lng: -84.0907,
  },
  {
    id: "2",
    name: "Mountain Peak Lodge",
    description: "Boutique lodge with mountain views",
    address: "Calle 5, Escazú, San José",
    locationArea: "Escazú",
    lat: 9.92,
    lng: -84.14,
  },
  {
    id: "3",
    name: "Oceanview Resort & Spa",
    description: "Beachfront resort with full spa",
    address: "Playa Jacó, Puntarenas",
    locationArea: "Jacó",
    lat: 9.61,
    lng: -84.63,
  },
];

interface DemoHotelStore {
  hotels: ManagedHotel[];
  add(draft: HotelDraft): ManagedHotel;
  update(id: string, draft: HotelDraft): void;
  remove(id: string): void;
  reset(): void;
}

// Monotonic so an id freed by a removal is never handed out again.
let lastId = SEED_HOTELS.length;

export const useDemoHotelStore = create<DemoHotelStore>()((set, get) => ({
  hotels: SEED_HOTELS,
  add(draft) {
    const hotel = { ...draft, id: String(++lastId) };
    set({ hotels: [...get().hotels, hotel] });
    return hotel;
  },
  update(id, draft) {
    set({
      hotels: get().hotels.map((h) => (h.id === id ? { ...draft, id } : h)),
    });
  },
  remove(id) {
    set({ hotels: get().hotels.filter((h) => h.id !== id) });
  },
  reset() {
    lastId = SEED_HOTELS.length;
    set({ hotels: SEED_HOTELS });
  },
}));

export const DEMO_SAVED_MESSAGE = "Saved in demo mode. Not stored.";
export const DEMO_REMOVED_MESSAGE = "Removed in demo mode";
