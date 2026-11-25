"use client";

import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";

import { Home, MapPin, Bed, Bath } from "lucide-react";

interface PropertySummaryHeaderProps {
  name: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
}

export function PropertySummaryHeader({
  name,
  address,
  bedrooms,
  bathrooms,
  price,
}: PropertySummaryHeaderProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <DashboardGlassCard className="p-4 sm:p-6">
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="shrink-0 rounded-full bg-muted p-3">
            <Home aria-hidden="true" className="h-6 w-6 text-foreground" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="break-words text-2xl font-semibold text-foreground">
              {name}
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="break-words text-sm">{address}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Bed aria-hidden="true" className="h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">
              {bedrooms} bd
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <Bath aria-hidden="true" className="h-4 w-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">
              {bathrooms} ba
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
            <span className="text-sm font-medium text-foreground">
              {formatCurrency(price)}
            </span>
            <span className="text-xs text-muted-foreground">/ night</span>
          </div>
        </div>
      </div>
    </DashboardGlassCard>
  );
}
