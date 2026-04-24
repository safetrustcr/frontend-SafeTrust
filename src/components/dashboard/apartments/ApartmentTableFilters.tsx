"use client";

import { Briefcase, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PriceRangeFilter = "all" | "under_3000" | "3000_5000" | "over_5000";
export type StatusTableFilter = "all" | "inhabited" | "not_inhabited";

interface ApartmentTableFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  promotedOnly: boolean;
  onPromotedOnlyChange: (value: boolean) => void;
  priceRange: PriceRangeFilter;
  onPriceRangeChange: (value: PriceRangeFilter) => void;
  statusFilter: StatusTableFilter;
  onStatusFilterChange: (value: StatusTableFilter) => void;
}

export function ApartmentTableFilters({
  searchQuery,
  onSearchChange,
  promotedOnly,
  onPromotedOnlyChange,
  priceRange,
  onPriceRangeChange,
  statusFilter,
  onStatusFilterChange,
}: ApartmentTableFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search apartments"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="promoted-only"
            checked={promotedOnly}
            onCheckedChange={(v) => onPromotedOnlyChange(v === true)}
          />
          <Label htmlFor="promoted-only" className="cursor-pointer text-sm font-normal">
            Promoted
          </Label>
        </div>

        <div className="flex min-w-[160px] items-center gap-2">
          <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <Select value={priceRange} onValueChange={(v) => onPriceRangeChange(v as PriceRangeFilter)}>
            <SelectTrigger className="w-[160px]" aria-label="Price range">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All prices</SelectItem>
              <SelectItem value="under_3000">Under $3,000</SelectItem>
              <SelectItem value="3000_5000">$3,000 – $5,000</SelectItem>
              <SelectItem value="over_5000">Over $5,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[140px] items-center gap-2">
          <span className="text-lg" aria-hidden>
            🏷
          </span>
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusTableFilter)}>
            <SelectTrigger className="w-[160px]" aria-label="Occupancy status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="inhabited">Inhabited</SelectItem>
              <SelectItem value="not_inhabited">Not inhabited</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
