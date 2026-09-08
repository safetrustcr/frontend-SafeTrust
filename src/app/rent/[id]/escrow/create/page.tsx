"use client";

import { Button } from "@/components/ui/button";
import { getHotelById } from "@/lib/mockData/hotels";
import { Bath, BedDouble, Lock, MapPin, PawPrint } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { notFound } from "next/navigation";


// TODO: replace with Hasura query → public.apartments WHERE id = $id
// and Hasura query → public.trustless_work_escrows WHERE apartment_id = $id
const STUB_APARTMENTS: Record<string, any> = {
  "1": {
    name: "Moderno Apartamento en San José Centro",
    address: "Avenida Central, Centro, San José",
    deposit: 2400,
    description:
      "Apartamento renovado con acabados de lujo, 2 habitaciones, 2 baños",
    beds: 2,
    baths: 1,
    petFriendly: true,
    imageUrls: [
      "/img/room1.png",
      "/img/room2.png",
      "/img/room3.png",
      "/img/room4.png",
    ],
  },
  "2": {
    name: "Suite Ejecutiva Sabana Norte",
    address: "Calle 42, Sabana Norte, San José",
    deposit: 1900,
    description:
      "Suite ejecutiva completamente amueblada con vista panorámica de la ciudad.",
    beds: 2,
    baths: 1,
    petFriendly: true,
    imageUrls: [
      "/img/room2.png",
      "/img/room1.png",
      "/img/room3.png",
      "/img/room4.png",
    ],
  },
};

const buildStubEscrow = (id: string) => {
  const apt = STUB_APARTMENTS[id] || STUB_APARTMENTS["1"];

  return {
    id,
    invoiceNumber: `INV${id.replace(/-/g, "").slice(0, 12).toUpperCase()}`,
    status: "pending_signature",
    amount: apt.deposit,
    receiverAddress: "",
    apartment: {
      id,
      name: apt.name,
      address: apt.address,
      description: apt.description,
      beds: apt.beds,
      baths: apt.baths,
      petFriendly: apt.petFriendly,
      imageUrls: apt.imageUrls,
      owner: {
        name: "Alberto Casas",
        email: "albertoCasas100@gmail.com",
        phone: "+506 64852179",
      },
    },
  };
};

export default function EscrowCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const apartment = getHotelById(resolvedParams.id);
  const fallbackImageSrc = "/img/hotels.png";
  const imageSrc = apartment.images?.[0] || fallbackImageSrc;
  const warrantyDeposit = Math.max(2400, Math.round(apartment.price * 0.6));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc || fallbackImageSrc}
            alt={apartment.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              const target = event.target as HTMLImageElement;
              target.src = fallbackImageSrc;
              target.onerror = null;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
              <Lock className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Booking Request Sent</span>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-foreground">{apartment.name}</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-400" />
              {apartment.address}
            </div>
          </div>

          <div className="space-y-3 rounded-xl bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Warranty deposit</span>
              <span className="font-semibold text-foreground">
                ${warrantyDeposit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-yellow-500">Pending setup</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Beds / Baths</span>
              <span className="flex items-center gap-2 font-medium text-foreground">
                <BedDouble className="h-3.5 w-3.5" />
                {apartment.bedrooms} bd
                <Bath className="ml-1 h-3.5 w-3.5" />
                {apartment.bathrooms} ba
              </span>
            </div>
            {apartment.petFriendly && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pet friendly</span>
                <span className="flex items-center gap-1 font-medium text-green-500">
                  <PawPrint className="h-3.5 w-3.5" />
                  Yes
                </span>
              </div>
            )}
          </div>

          <p className="rounded-lg border border-dashed border-border bg-background/50 p-3 text-center text-xs text-muted-foreground">
            ⚠ Escrow creation will be wired to TrustlessWork in a future release.
            This is a UI skeleton.
          </p>

          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/rent")}
            >
              ← Back to browse
            </Button>
            <Button
              className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
