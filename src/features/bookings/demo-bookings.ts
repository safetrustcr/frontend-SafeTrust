export interface BookingItem {
  id: string;
  listingId: string;
  listingName: string;
  listingPhoto: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  currency: string;
  status: "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  role: "guest" | "host";
  escrowId: string;
  guestName?: string;
  hostName?: string;
}

export const DEMO_BOOKINGS: BookingItem[] = [
  {
    id: "trip-1",
    listingId: "1",
    listingName: "La Sabana Luxury Apartment",
    listingPhoto: "/img/room1.png",
    checkIn: "2026-12-01",
    checkOut: "2026-12-05",
    amount: 850,
    currency: "USDC",
    status: "ACTIVE",
    role: "guest",
    escrowId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostName: "Alberto Casas",
  },
  {
    id: "trip-2",
    listingId: "2",
    listingName: "Casa Verde Downtown",
    listingPhoto: "/img/room2.png",
    checkIn: "2026-11-10",
    checkOut: "2026-11-14",
    amount: 620,
    currency: "USDC",
    status: "COMPLETED",
    role: "guest",
    escrowId: "CB4D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostName: "Maria Rodriguez",
  },
  {
    id: "trip-3",
    listingId: "3",
    listingName: "Playa Escazu Beachfront Suite",
    listingPhoto: "/img/room2.png",
    checkIn: "2026-10-15",
    checkOut: "2026-10-18",
    amount: 1200,
    currency: "USDC",
    status: "DISPUTED",
    role: "guest",
    escrowId: "CC5D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostName: "Carlos Mendez",
  },
  {
    id: "trip-4",
    listingId: "4",
    listingName: "Modern Studio in Rohrmoser",
    listingPhoto: "/img/room1.png",
    checkIn: "2026-09-05",
    checkOut: "2026-09-08",
    amount: 450,
    currency: "USDC",
    status: "CANCELLED",
    role: "guest",
    escrowId: "CD6D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostName: "Sofia Vargas",
  },
  {
    id: "host-1",
    listingId: "1",
    listingName: "La Sabana Luxury Apartment",
    listingPhoto: "/img/room1.png",
    checkIn: "2026-12-10",
    checkOut: "2026-12-15",
    amount: 1100,
    currency: "USDC",
    status: "ACTIVE",
    role: "host",
    escrowId: "CE7D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    guestName: "John Smith",
  },
  {
    id: "host-2",
    listingId: "1",
    listingName: "La Sabana Luxury Apartment",
    listingPhoto: "/img/room1.png",
    checkIn: "2026-11-01",
    checkOut: "2026-11-06",
    amount: 980,
    currency: "USDC",
    status: "COMPLETED",
    role: "host",
    escrowId: "CF8D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    guestName: "Elena Gomez",
  },
  {
    id: "host-3",
    listingId: "1",
    listingName: "La Sabana Luxury Apartment",
    listingPhoto: "/img/room1.png",
    checkIn: "2026-10-20",
    checkOut: "2026-10-23",
    amount: 540,
    currency: "USDC",
    status: "CANCELLED",
    role: "host",
    escrowId: "CG9D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    guestName: "David Kim",
  },
];
