"use client";

import { useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { toast } from "sonner";
import { ApartmentActionsMenu } from "@/components/dashboard/apartments/ApartmentActionsMenu";
import { ApartmentStatusBadge } from "@/components/dashboard/apartments/ApartmentStatusBadge";
import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Column, ResponsiveTable } from "@/components/ui/responsive-table";
import { useApartments } from "@/hooks/useApartments";
import { formatPrice } from "@/lib/format";

const ITEMS_PER_PAGE = 5;

export function MyApartmentsTable() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const offset = page * ITEMS_PER_PAGE;
  const { data } = useApartments({ limit: ITEMS_PER_PAGE, offset, search });
  const apartments = data.apartments.filter(
    (apartment) => !deletedIds.has(String(apartment.id)),
  );
  const total = Math.max(0, data.apartments_aggregate.aggregate.count - deletedIds.size);
  type Apartment = (typeof apartments)[number];

  const handleDeleteConfirmed = (id: string) => {
    setDeletedIds((previous) => new Set(previous).add(id));
    toast.success("Apartment removed (skeleton mode)");
  };

  const columns: Column<Apartment>[] = [
    {
      key: "name",
      header: "Apartment name",
      primary: true,
      cell: (apartment) => (
        <span className="block min-w-0 truncate font-semibold" title={apartment.name}>
          {apartment.name}
        </span>
      ),
    },
    { key: "location", header: "Location", cell: (apartment) => apartment.location },
    { key: "offers", header: "Offers", cell: (apartment) => apartment.offers },
    {
      key: "status",
      header: "Status",
      cell: (apartment) => <ApartmentStatusBadge status={apartment.status} />,
    },
    {
      key: "promoted",
      header: "Promoted",
      cell: (apartment) => apartment.promoted ? (
        <span aria-label="Promoted listing" className="text-orange-500">Yes</span>
      ) : "No",
    },
    { key: "price", header: "Price", cell: (apartment) => formatPrice(apartment.price) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My apartments"
        actions={
          <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/dashboard/apartments/new">
              <Home className="mr-2 h-4 w-4" /> New apartment
            </Link>
          </Button>
        }
      />
      <Input
        placeholder="Search anything..."
        value={search}
        onChange={(event) => { setSearch(event.target.value); setPage(0); }}
        className="max-w-xs"
      />
      <div className="text-sm text-muted-foreground">
        Showing {apartments.length} of {total}
      </div>
      <DashboardGlassCard className="rounded-lg border border-border">
        <ResponsiveTable
          columns={columns}
          rows={apartments}
          getRowKey={(apartment) => String(apartment.id)}
          rowActions={(apartment) => (
            <ApartmentActionsMenu
              apartmentId={String(apartment.id)}
              apartmentName={apartment.name}
              onDeleteConfirm={handleDeleteConfirmed}
            />
          )}
          emptyMessage="No apartments found."
        />
      </DashboardGlassCard>
      {total > ITEMS_PER_PAGE && (
        <nav aria-label="Apartment pages" className="flex items-center justify-between gap-2 pt-2 text-sm">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <span className="text-muted-foreground">Page {page + 1}</span>
          <Button variant="outline" size="sm" disabled={(page + 1) * ITEMS_PER_PAGE >= total} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
