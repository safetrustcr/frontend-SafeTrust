"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { BidStatusBadge, type BidStatus } from "./BidStatusBadge";

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
  isLoading?: boolean;
  onAcceptOffer?: (offerId: number) => void;
  onRejectOffer?: (offerId: number) => void;
  onViewTenant?: (tenantId: string) => void;
}

export function InterestedPeopleTable({
  offers,
  totalCount,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-[200px] flex-1">
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
            <SelectTrigger className="w-[140px]" aria-label="Filter by status">
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
            className="w-[150px]"
            aria-label="Filter start date"
          />
          <span className="text-sm text-muted-foreground">–</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[150px]"
            aria-label="Filter end date"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {showingTo === 0 ? 0 : showingFrom}–{showingTo} of{" "}
          {filtered.length}
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">#</TableHead>
                <TableHead className="w-[80px]">ID No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Offer date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No offers found.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((offer, idx) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">
                      {startIdx + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{offer.id}</TableCell>
                    <TableCell>{offer.tenant_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {offer.tenant_phone || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {formatWallet(offer.tenant_wallet_address)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(offer.offer_date)}
                    </TableCell>
                    <TableCell>
                      <BidStatusBadge status={offer.bid_status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          disabled={offer.bid_status !== "pending"}
                          onClick={() => onAcceptOffer?.(offer.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          disabled={offer.bid_status !== "pending"}
                          onClick={() => onRejectOffer?.(offer.id)}
                        >
                          Reject
                        </Button>
                        {offer.tenant_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewTenant?.(offer.tenant_id!)}
                          >
                            View profile
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
                className="min-w-[40px]"
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
