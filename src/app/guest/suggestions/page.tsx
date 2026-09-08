"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Bed, PawPrint, Bath, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import  HotelHeader from "@/components/hotel/HotelHeader";
import { getConversationIdForApartment } from "@/lib/mockData/messages";

// TODO: replace with Apollo query → public.apartments (Hasura)
// Reference: dApp/apps/frontend/src/app/dashboard/guest/page.tsx
const STUB_APARTMENTS = [
  {
    id: "1",
    name: "Moderno Apartamento en San José Centro",
    address: "Avenida Central, Centro, San José",
    price: 1200,
    deposit: 2400,
    beds: 2,
    baths: 1,
    petFriendly: true,
    isPromoted: true,
    description:
      "Apartamento renovado con acabados de lujo, 2 habitaciones, 2 baños",
    images: [
      "/img/room1.png",
      "/img/room2.png",
      "/img/room3.png",
      "/img/room4.png",
    ],
  },
  {
    id: "2",
    name: "Suite Ejecutiva Sabana Norte",
    address: "Calle 42, Sabana Norte, San José",
    price: 950,
    deposit: 1900,
    beds: 2,
    baths: 1,
    petFriendly: true,
    isPromoted: false,
    description:
      "Suite ejecutiva completamente amueblada con vista panorámica de la ciudad.",
    images: [
      "/img/room2.png",
      "/img/room1.png",
      "/img/room3.png",
      "/img/room4.png",
    ],
  },
];

export default function GuestSuggestionsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(STUB_APARTMENTS[0].id);
  const [favorites, setFavorites] = useState<string[]>([]);

  const selected = STUB_APARTMENTS.find((a) => a.id === selectedId)!;
  const selectedConversationId = getConversationIdForApartment(selected.name);

  const toggleFavorite = (id: string) => {
    setFavorites((curr) =>
      curr.includes(id) ? curr.filter((f) => f !== id) : [...curr, id],
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900
                    text-gray-900 dark:text-white">
      {/* Standalone header */}
      <HotelHeader showHostSwitch />

      <div className="mx-auto max-w-[1280px] px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_220px] gap-6">

          {/* ── Left: Suggestions sidebar ── */}
          <aside className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Suggestions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {STUB_APARTMENTS.length} units available
              </p>
              <Link
                href="/rent"
                className="text-sm text-orange-500 hover:text-orange-600
                           font-medium"
              >
                Browse all →
              </Link>
            </div>

            <div className="space-y-3">
              {STUB_APARTMENTS.map((apt) => (
                <button
                  key={apt.id}
                  type="button"
                  onClick={() => setSelectedId(apt.id)}
                  className={cn(
                    "w-full text-left rounded-xl border p-3",
                    "flex items-start gap-3 transition-colors",
                    selectedId === apt.id
                      ? "border-orange-400 bg-orange-50 dark:bg-orange-900/10"
                      : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800",
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg
                                  overflow-hidden shrink-0 bg-gray-200
                                  dark:bg-slate-700">
                    <Image
                      src={apt.images[0]}
                      alt={apt.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-semibold
                                    text-gray-900 dark:text-white
                                    line-clamp-2 leading-tight">
                        {apt.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(apt.id);
                        }}
                        className="shrink-0 mt-0.5"
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4 transition-colors",
                            favorites.includes(apt.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-300 hover:text-red-400",
                          )}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400
                                  truncate">
                      {apt.address}
                    </p>
                    <div className="flex items-center gap-2
                                    text-xs text-gray-400 dark:text-gray-500">
                      <span>{apt.beds}bd</span>
                      <span>·</span>
                      {apt.petFriendly && (
                        <>
                          <span>pet friendly</span>
                          <span>·</span>
                        </>
                      )}
                      <span>{apt.baths} ba</span>
                      <span
                        className="ml-auto font-bold text-green-600
                                   dark:text-green-400"
                      >
                        ${apt.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* ── Center: Main image + details ── */}
          <main className="space-y-4">
            {/* Main image */}
            <div className="relative w-full rounded-2xl overflow-hidden
                            bg-gray-200 dark:bg-slate-700"
                 style={{ height: "340px" }}>
              <Image
                src={selected.images[0]}
                alt={selected.name}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 60vw, 700px"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {selected.isPromoted && (
                <span className="absolute bottom-3 left-3
                                 bg-orange-500 text-white text-xs
                                 px-2.5 py-1 rounded-full font-semibold
                                 flex items-center gap-1 shadow-md">
                  🔥 PROMOTED
                </span>
              )}
            </div>

            {/* Apartment details */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900
                               dark:text-white leading-tight">
                  {selected.name}
                </h1>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-orange-500">
                    ${selected.price.toLocaleString()}.00
                    <span className="text-sm font-normal
                                     text-gray-500 dark:text-gray-400 ml-1">
                      Per month
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Deposit: ${selected.deposit.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5
                              text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                {selected.address}
              </div>

              <div className="flex items-center gap-4
                              text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-orange-500" />
                  {selected.beds} bd
                </span>
                {selected.petFriendly && (
                  <span className="flex items-center gap-1.5">
                    <PawPrint className="h-4 w-4 text-orange-500" />
                    pet friendly
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4 text-orange-500" />
                  {selected.baths} ba
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold
                               text-gray-900 dark:text-white">
                  Apartment details
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400
                               leading-relaxed">
                  {selected.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    router.push(`/rent/${selected.id}/escrow/create`);
                  }}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600
                             active:bg-orange-700 text-white font-bold
                             uppercase tracking-wide px-8 py-3
                             transition-colors duration-200 shadow-md"
                >
                  Book
                </button>
                {selectedConversationId && (
                  <button
                    onClick={() => {
                      router.push(`/dashboard/messages/${selectedConversationId}`);
                    }}
                    className="rounded-xl border border-orange-500
                               text-orange-500 hover:bg-orange-50
                               dark:hover:bg-orange-900/10 font-semibold
                               uppercase tracking-wide px-6 py-3
                               transition-colors duration-200
                               inline-flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Message host
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* ── Right: Thumbnail stack ── */}
          <div className="hidden lg:flex flex-col gap-3">
            {selected.images.slice(1, 4).map((src, i) => (
              <div
                key={i}
                className="relative w-full rounded-xl overflow-hidden
                           bg-gray-200 dark:bg-slate-700"
                style={{ height: "120px" }}
              >
                <Image
                  src={src}
                  alt={`${selected.name} photo ${i + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform
                             duration-300 cursor-pointer"
                  sizes="220px"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
