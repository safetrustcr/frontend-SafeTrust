"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { HotelActionsMenu } from "@/components/dashboard/hotels/HotelActionsMenu";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Column, ResponsiveTable } from "@/components/ui/responsive-table";

const STUB_HOTELS = [
  { id: "1", name: "Metropolitan Tower", address: "Avenida Central 100, San Jose", location_area: "San Jose Centro", description: "Luxury hotel in downtown San Jose" },
  { id: "2", name: "Mountain Peak Lodge", address: "Calle 5, Escazu, San Jose", location_area: "Escazu", description: "Boutique lodge with mountain views" },
  { id: "3", name: "Oceanview Resort & Spa", address: "Playa Jaco, Puntarenas", location_area: "Jaco", description: "Beachfront resort with full spa" },
];
type Hotel = (typeof STUB_HOTELS)[number];

export default function HotelsPage() {
  const handleDeleteConfirmed = (id: string) => {
    // Skeleton data only; the real deletion flow is implemented separately.
    console.warn(`Delete hotel ${id} is not yet wired to the backend`);
  };
  const columns: Column<Hotel>[] = [
    { key: "name", header: "Name", primary: true, cell: (hotel) => <span className="block truncate font-semibold" title={hotel.name}>{hotel.name}</span> },
    { key: "address", header: "Address", cell: (hotel) => hotel.address },
    { key: "area", header: "Area", cell: (hotel) => hotel.location_area },
    { key: "description", header: "Description", cell: (hotel) => hotel.description },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Hotels"
        description="Manage your hotel properties"
        actions={
          <Link href="/dashboard/hotels/new" className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
            <PlusCircle className="h-4 w-4" /> New Hotel
          </Link>
        }
      />
      <DashboardGlassCard className="rounded-lg border border-border">
        <ResponsiveTable
          columns={columns}
          rows={STUB_HOTELS}
          getRowKey={(hotel) => hotel.id}
          rowActions={(hotel) => <HotelActionsMenu hotelId={hotel.id} onDeleteConfirmed={handleDeleteConfirmed} />}
          emptyMessage="No hotels found."
        />
      </DashboardGlassCard>
    </div>
  );
}
