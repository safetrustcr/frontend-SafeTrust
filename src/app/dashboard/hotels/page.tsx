"use client";

import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { HotelActionsMenu } from "@/components/dashboard/hotels/HotelActionsMenu";

// TODO: replace with Hasura query → public.hotels
const STUB_HOTELS = [
  {
    id: "1",
    name: "Metropolitan Tower",
    address: "Avenida Central 100, San José",
    location_area: "San José Centro",
    description: "Luxury hotel in downtown San José",
  },
  {
    id: "2",
    name: "Mountain Peak Lodge",
    address: "Calle 5, Escazú, San José",
    location_area: "Escazú",
    description: "Boutique lodge with mountain views",
  },
  {
    id: "3",
    name: "Oceanview Resort & Spa",
    address: "Playa Jacó, Puntarenas",
    location_area: "Jacó",
    description: "Beachfront resort with full spa",
  },
];

export default function HotelsPage() {
  const handleDeleteConfirmed = (id: string) => {
    // TODO: trigger Hasura DELETE mutation → DELETE FROM public.hotels WHERE id = $id
    console.warn(`Delete hotel ${id} — not yet wired to backend`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hotels
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your hotel properties
          </p>
        </div>
        <Link
          href="/dashboard/hotels/new"
          className="flex items-center gap-2 rounded-lg bg-orange-500
                     hover:bg-orange-600 text-white text-sm font-semibold
                     px-4 py-2 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          New Hotel
        </Link>
      </div>

      {/* Table */}
      <DashboardGlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 text-left">
                {["Name", "Address", "Area", "Description", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 font-medium
                               text-gray-500 dark:text-gray-400"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {STUB_HOTELS.map((hotel) => (
                <tr
                  key={hotel.id}
                  className="dashboard-table-surface
                           hover:bg-gray-50 dark:hover:bg-slate-800
                           transition-colors"
                >
                  <td
                    className="px-4 py-3 font-semibold
                               text-gray-900 dark:text-white"
                  >
                    {hotel.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {hotel.address}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {hotel.location_area}
                  </td>
                  <td
                    className="px-4 py-3 text-gray-500 dark:text-gray-400
                               max-w-[200px] truncate"
                  >
                    {hotel.description}
                  </td>
                  <td className="px-4 py-3">
                    <HotelActionsMenu
                      hotelId={hotel.id}
                      onDeleteConfirmed={handleDeleteConfirmed}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardGlassCard>
    </div>
  );
}
