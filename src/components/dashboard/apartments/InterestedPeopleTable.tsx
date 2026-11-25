"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Column, ResponsiveTable } from "@/components/ui/responsive-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BidStatusBadge, type BidStatus } from "./BidStatusBadge";
import { computeBookingPrice, HostPayoutPreview } from "@/features/escrow";

export interface RentalOffer {
  id: number;
  tenant_id: string | null;
  tenant_name: string;
  tenant_phone: string | null;
  tenant_wallet_address: string | null;
  offer_date: string;
  bid_status: BidStatus;
}

interface InterestedPeopleTableProps {
  offers: RentalOffer[];
  totalCount: number;
  listingPrice?: number;
  isLoading?: boolean;
  onAcceptOffer?: (offerId: number) => void;
  onRejectOffer?: (offerId: number) => void;
  onViewTenant?: (tenantId: string) => void;
}

export function InterestedPeopleTable({
  offers,
  totalCount,
  listingPrice,
  isLoading = false,
  onAcceptOffer,
  onRejectOffer,
  onViewTenant,
}: InterestedPeopleTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<5 | 10 | 20>(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | BidStatus>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const payoutPrice = useMemo(() => {
    const isExampleRate = !listingPrice || listingPrice <= 0;
    const rate = isExampleRate ? 86 : listingPrice;
    return {
      breakdown: computeBookingPrice({
        nightlyRate: rate,
        nights: 2,
        guests: 1,
      }),
      isExample: isExampleRate,
    };
  }, [listingPrice]);

  // Filter offers
  const filtered = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        searchQuery === "" ||
        offer.tenant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.tenant_phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.tenant_wallet_address
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || offer.bid_status === statusFilter;

      const offerTime = new Date(offer.offer_date).getTime();
      const matchesStart =
        startDate === "" || offerTime >= new Date(startDate).getTime();
      const matchesEnd =
        endDate === "" ||
        offerTime <= new Date(endDate + "T23:59:59").getTime();

      return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });
  }, [offers, searchQuery, statusFilter, startDate, endDate]);

  const formatWallet = (address: string | null): string => {
    if (!address) return "—";
    if (address.length <= 6) return address;
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize, startDate, endDate]);

  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = startIdx + pageRows.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const columns: Column<RentalOffer>[] = [
    {
      key: "position",
      header: "#",
      hideOnMobile: true,
      className: "w-[80px] font-medium",
      cell: (offer) => startIdx + pageRows.indexOf(offer) + 1,
    },
    {
      key: "id",
      header: "ID No.",
      hideOnMobile: true,
      className: "w-[80px] font-medium",
      cell: (offer) => offer.id,
    },
    {
      key: "name",
      header: "Name",
      primary: true,
      cell: (offer) => offer.tenant_name,
    },
    {
      key: "phone",
      header: "Phone",
      className: "text-muted-foreground",
      cell: (offer) => offer.tenant_phone || "—",
    },
    {
      key: "wallet",
      header: "Wallet",
      className: "font-mono text-sm text-muted-foreground",
      cell: (offer) => formatWallet(offer.tenant_wallet_address),
    },
    {
      key: "offerDate",
      header: "Offer date",
      className: "text-muted-foreground",
      cell: (offer) => formatDate(offer.offer_date),
    },
    {
      key: "status",
      header: "Status",
      cell: (offer) => <BidStatusBadge status={offer.bid_status} />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HostPayoutPreview
        price={payoutPrice.breakdown}
        isExample={payoutPrice.isExample}
        exampleLabel="Example: 2 nights, 1 guest"
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            aria-label="Search offers"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "all" | BidStatus)}
          >
            <SelectTrigger className="w-36" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
            aria-label="Filter start date"
          />
          <span className="text-sm text-muted-foreground">–</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
            aria-label="Filter end date"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {showingTo === 0 ? 0 : showingFrom}–{showingTo} of{" "}
          {Boolean(
            searchQuery ||
            (statusFilter && statusFilter !== "all") ||
            startDate ||
            endDate,
          )
            ? filtered.length
            : totalCount || filtered.length}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v) as 5 | 10 | 20)}
          >
            <SelectTrigger className="w-[70px]" aria-label="Items per page">
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

      <div className="rounded-md border">
        <ResponsiveTable
          columns={columns}
          rows={pageRows}
          getRowKey={(offer) => String(offer.id)}
          rowActions={(offer) => (
            <div className="flex flex-wrap items-center gap-2 md:gap-1">
              <Button
                size="sm"
                variant="outline"
                className="min-h-11 flex-1 text-green-700 hover:text-green-800 md:min-h-0 md:flex-none dark:text-green-300 dark:hover:text-green-200"
                disabled={offer.bid_status !== "pending"}
                onClick={() => onAcceptOffer?.(offer.id)}
                aria-label={`Accept offer from ${offer.tenant_name}`}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="min-h-11 flex-1 text-red-700 hover:text-red-800 md:min-h-0 md:flex-none dark:text-red-300 dark:hover:text-red-200"
                disabled={offer.bid_status !== "pending"}
                onClick={() => onRejectOffer?.(offer.id)}
                aria-label={`Reject offer from ${offer.tenant_name}`}
              >
                Reject
              </Button>
              {offer.tenant_id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="min-h-11 md:min-h-0"
                  onClick={() => onViewTenant?.(offer.tenant_id!)}
                  aria-label={`View profile of ${offer.tenant_name}`}
                >
                  View profile
                </Button>
              )}
            </div>
          )}
          mobileActions="footer"
          emptyMessage="No offers found."
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {pageNumbers.map((pageNum) => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                aria-current={currentPage === pageNum ? "page" : undefined}
                aria-label={`Page ${pageNum}`}
                className="min-w-10"
              >
                {pageNum}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
