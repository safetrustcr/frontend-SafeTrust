"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApartmentActionsMenu } from "./ApartmentActionsMenu";
import { ApartmentStatusBadge } from "./ApartmentStatusBadge";
import type { ApartmentOccupancyStatus } from "./ApartmentStatusBadge";
import {
  ApartmentTableFilters,
  type PriceRangeFilter,
  type StatusTableFilter,
} from "./ApartmentTableFilters";

export interface ApartmentRow {
  id: number;
  name: string;
  location: string;
  offers: number;
  status: ApartmentOccupancyStatus;
  promoted: boolean;
  price: number;
}

const OFFER_CYCLE = [2, 5, 7, 1, 2] as const;

// TODO: replace with useQuery(GET_MY_APARTMENTS)
const INITIAL_STUB_APARTMENTS: ApartmentRow[] = Array(10)
  .fill(null)
  .map((_, i) => ({
    id: i + 1,
    name: "La sabana house",
    location: "San José",
    offers: OFFER_CYCLE[i % OFFER_CYCLE.length],
    status: i % 3 === 1 ? "not_inhabited" : "inhabited",
    promoted: i % 2 === 0,
    price: 4000,
  }));

function matchesPriceRange(price: number, range: PriceRangeFilter): boolean {
  if (range === "all") return true;
  if (range === "under_3000") return price < 3000;
  if (range === "3000_5000") return price >= 3000 && price <= 5000;
  return price > 5000;
}

export function MyApartmentsTable() {
  const [apartments, setApartments] = useState<ApartmentRow[]>(INITIAL_STUB_APARTMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [promotedOnly, setPromotedOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusTableFilter>("all");
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return apartments.filter((row) => {
      if (promotedOnly && !row.promoted) return false;
      if (!matchesPriceRange(row.price, priceRange)) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (q) {
        const hay = `${row.id} ${row.name} ${row.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [apartments, searchQuery, promotedOnly, priceRange, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, promotedOnly, priceRange, statusFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = startIdx + pageRows.length;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      amount,
    );

  const handleDeleteConfirmed = (id: number) => {
    setApartments((prev) => prev.filter((a) => a.id !== id));
  };

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My apartments</h1>
        <Button
          asChild
          className="w-fit bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
        >
          <Link href="/dashboard/apartments/new" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            New apartment
          </Link>
        </Button>
      </div>

      <ApartmentTableFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        promotedOnly={promotedOnly}
        onPromotedOnlyChange={setPromotedOnly}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {showingTo === 0 ? 0 : showingFrom}–{showingTo} of {filtered.length}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v) as 5 | 10 | 20)}
          >
            <SelectTrigger className="w-[88px]" aria-label="Items per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <div className="scrollbar-thin w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px]">ID</TableHead>
                <TableHead>Apartment name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-[88px]">Offers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-center">Promoted</TableHead>
                <TableHead className="w-[100px]">Price</TableHead>
                <TableHead className="w-[72px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No apartments match your filters
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm">{row.id}</TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/apartments/${row.id}/offers`}
                        className="text-blue-600 hover:underline"
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell>{row.offers}</TableCell>
                    <TableCell>
                      <ApartmentStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-center text-lg">{row.promoted ? "🔥" : ""}</TableCell>
                    <TableCell>{formatCurrency(row.price)}</TableCell>
                    <TableCell className="text-right">
                      <ApartmentActionsMenu apartmentId={row.id} onDeleteConfirmed={handleDeleteConfirmed} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-stretch gap-4 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground sm:hidden">
            Page {safePage} of {totalPages}
          </div>
          <div className="flex items-center justify-center gap-1 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers.map((num) => (
              <Button
                key={num}
                type="button"
                variant={num === safePage ? "default" : "outline"}
                size="sm"
                className="h-8 min-w-8 px-2"
                onClick={() => setPage(num)}
              >
                {num}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
