"use client";

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
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-orange-100 p-3">
            <Home className="h-6 w-6 text-orange-600" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{address}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
            <Bed className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">
              {bedrooms} bd
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2">
            <Bath className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">
              {bathrooms} ba
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
            <span className="text-sm font-medium text-gray-500">
              {formatCurrency(price)}
            </span>
            <span className="text-xs text-muted-foreground">Per month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
