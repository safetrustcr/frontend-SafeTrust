"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { toast } from "sonner";
import { ApartmentActionsMenu } from "@/components/dashboard/apartments/ApartmentActionsMenu";
import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { PageHeader } from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/demo-badge";
import { Input } from "@/components/ui/input";
import { Column, ResponsiveTable } from "@/components/ui/responsive-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  apartmentsRepository,
  DEMO_SAVED_MESSAGE,
  describeApartmentError,
  type ApartmentsRepository,
  type OwnedApartment,
} from "@/features/apartments";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 5;

const locationOf = (apartment: OwnedApartment) =>
  [apartment.address.neighborhood, apartment.address.city]
    .filter(Boolean)
    .join(", ");

interface MyApartmentsTableProps {
  repository?: ApartmentsRepository;
}

export function MyApartmentsTable({
  repository = apartmentsRepository,
}: MyApartmentsTableProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [apartments, setApartments] = useState<OwnedApartment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setApartments(await repository.listMine());
      setError(null);
    } catch (loadError) {
      setError(describeApartmentError(loadError).message);
    }
  }, [repository]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    await repository.remove(id);
    toast.success(
      repository.mode === "demo" ? DEMO_SAVED_MESSAGE : "Apartment removed",
    );
    await load();
  };

  const query = search.trim().toLowerCase();
  const filtered = (apartments ?? []).filter(
    (apartment) =>
      !query ||
      apartment.name.toLowerCase().includes(query) ||
      locationOf(apartment).toLowerCase().includes(query),
  );
  const total = filtered.length;
  const lastPage = Math.max(0, Math.ceil(total / ITEMS_PER_PAGE) - 1);
  const currentPage = Math.min(page, lastPage);
  const rows = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

  const columns: Column<OwnedApartment>[] = [
    {
      key: "name",
      header: "Apartment name",
      primary: true,
      cell: (apartment) => (
        <span
          className="block min-w-0 truncate font-semibold"
          title={apartment.name}
        >
          {apartment.name}
        </span>
      ),
    },
    { key: "location", header: "Location", cell: locationOf },
    { key: "offers", header: "Offers", cell: (apartment) => apartment.offers },
    {
      key: "availability",
      header: "Availability",
      cell: (apartment) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            apartment.isAvailable
              ? "bg-green-100 text-green-800"
              : "bg-gray-800 text-white",
          )}
        >
          {apartment.isAvailable ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (apartment) => formatPrice(apartment.price),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My apartments"
        description={
          repository.mode === "demo" ? (
            <span className="flex items-center gap-2">
              <DemoBadge />
              Changes stay in this tab and are not stored.
            </span>
          ) : undefined
        }
        actions={
          <Button
            asChild
            className="bg-orange-700 text-white hover:bg-orange-800"
          >
            <Link href="/dashboard/apartments/new">
              <Home className="mr-2 h-4 w-4" /> New apartment
            </Link>
          </Button>
        }
      />
      <Input
        placeholder="Search anything..."
        aria-label="Search apartments"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(0);
        }}
        className="max-w-xs"
      />
      {error ? (
        <div className="space-y-3">
          <p
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {error}
          </p>
          <Button variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : apartments === null ? (
        <div
          role="status"
          aria-label="Loading apartments"
          className="space-y-2"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {rows.length} of {total}
          </div>
          <DashboardGlassCard className="rounded-lg border border-border">
            <ResponsiveTable
              columns={columns}
              rows={rows}
              getRowKey={(apartment) => apartment.id}
              rowActions={(apartment) => (
                <ApartmentActionsMenu
                  apartmentId={apartment.id}
                  apartmentName={apartment.name}
                  onDelete={handleDelete}
                />
              )}
              emptyMessage="No apartments found."
            />
          </DashboardGlassCard>
          {total > ITEMS_PER_PAGE && (
            <nav
              aria-label="Apartment pages"
              className="flex items-center justify-between gap-2 pt-2 text-sm"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {currentPage + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= lastPage}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
