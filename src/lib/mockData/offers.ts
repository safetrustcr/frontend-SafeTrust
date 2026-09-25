import type { RentalOffer } from "@/components/dashboard/apartments/InterestedPeopleTable";

export const MOCK_RENTAL_OFFERS: Record<number, RentalOffer[]> = {
  1: Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    tenant_id: null,
    tenant_name: "Diego Duarte Fernández",
    tenant_phone: "+506 6483252",
    tenant_wallet_address: "XR6...32D",
    offer_date: new Date(2024, 8, 12 + index).toISOString(),
    bid_status: index === 1 ? "accepted" : index === 5 ? "rejected" : "pending",
  })),
};
