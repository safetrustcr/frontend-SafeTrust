"use client";

import Link from "next/link";
import { Info, PlusCircle } from "lucide-react";
import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { HotelActionsMenu } from "@/components/dashboard/hotels/HotelActionsMenu";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Column, ResponsiveTable } from "@/components/ui/responsive-table";
import { useDemoHotelStore, type ManagedHotel } from "@/features/hotels/manage";

export default function HotelsPage() {
  const hotels = useDemoHotelStore((s) => s.hotels);
  const remove = useDemoHotelStore((s) => s.remove);

  const columns: Column<ManagedHotel>[] = [
    {
      key: "name",
      header: "Name",
      primary: true,
      cell: (hotel) => (
        <span className="block truncate font-semibold" title={hotel.name}>
          {hotel.name}
        </span>
      ),
    },
    { key: "address", header: "Address", cell: (hotel) => hotel.address },
    { key: "area", header: "Area", cell: (hotel) => hotel.locationArea },
    {
      key: "description",
      header: "Description",
      cell: (hotel) => hotel.description,
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Hotels <DemoBadge />
          </span>
        }
        description="Manage your hotel properties"
        actions={
          <Link
            href="/dashboard/hotels/new"
            className="flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-900 transition-colors hover:bg-sky-200"
          >
            <PlusCircle className="h-4 w-4" /> New Hotel
          </Link>
        }
      />
      <Alert role="note">
        <Info className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>
          Hotel management is a demo. Hotels you add here aren&apos;t saved. To
          list a rental, use{" "}
          <Link
            href="/dashboard/apartments/new"
            className="font-semibold underline underline-offset-4"
          >
            My apartments
          </Link>
          .
        </AlertDescription>
      </Alert>
      <DashboardGlassCard className="rounded-lg border border-border">
        <ResponsiveTable
          columns={columns}
          rows={hotels}
          getRowKey={(hotel) => hotel.id}
          rowActions={(hotel) => (
            <HotelActionsMenu hotelId={hotel.id} onDeleteConfirmed={remove} />
          )}
          emptyMessage="No hotels found."
        />
      </DashboardGlassCard>
    </div>
  );
}
