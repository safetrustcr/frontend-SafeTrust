"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Building2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HotelDraft } from "@/features/hotels/manage";

interface HotelFormValues {
  name: string;
  description: string;
  address: string;
  locationArea: string;
  lat: string;
  lng: string;
}

const toValues = (draft?: HotelDraft): HotelFormValues => ({
  name: draft?.name ?? "",
  description: draft?.description ?? "",
  address: draft?.address ?? "",
  locationArea: draft?.locationArea ?? "",
  lat: String(draft?.lat ?? 9.9281),
  lng: String(draft?.lng ?? -84.0907),
});

interface HotelFormProps {
  initial?: HotelDraft;
  submitLabel: string;
  onSubmit: (draft: HotelDraft) => void;
}

export function HotelForm({ initial, submitLabel, onSubmit }: HotelFormProps) {
  const [form, setForm] = useState<HotelFormValues>(() => toValues(initial));

  const set = (field: keyof HotelFormValues, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      locationArea: form.locationArea.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
    });
  };

  const inputClass = cn(
    "w-full rounded-lg border border-gray-200 dark:border-slate-600",
    "bg-white dark:bg-slate-900 px-4 py-2.5 text-sm",
    "text-gray-900 dark:text-white",
    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
    "focus:outline-none focus:ring-2 focus:ring-sky-500",
    "transition-colors",
  );

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left column ── */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="hotel-name" className={labelClass}>
              Hotel Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2
                className="absolute left-3 top-1/2 -translate-y-1/2
                                  h-4 w-4 text-orange-400"
              />
              <input
                id="hotel-name"
                type="text"
                required
                maxLength={20}
                placeholder="e.g. Metropolitan Tower"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={cn(inputClass, "pl-9")}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {form.name.length}/20 characters
            </p>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="hotel-address" className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2
                               h-4 w-4 text-orange-400"
              />
              <input
                id="hotel-address"
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Avenida Central 100, San José"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </div>

          {/* Location area */}
          <div>
            <label htmlFor="hotel-location-area" className={labelClass}>
              Location Area
            </label>
            <input
              id="hotel-location-area"
              type="text"
              maxLength={20}
              placeholder="e.g. San José Centro"
              value={form.locationArea}
              onChange={(e) => set("locationArea", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="hotel-latitude" className={labelClass}>
                Latitude
              </label>
              <input
                id="hotel-latitude"
                type="number"
                step="any"
                required
                placeholder="9.9281"
                value={form.lat}
                onChange={(e) => set("lat", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hotel-longitude" className={labelClass}>
                Longitude
              </label>
              <input
                id="hotel-longitude"
                type="number"
                step="any"
                required
                placeholder="-84.0907"
                value={form.lng}
                onChange={(e) => set("lng", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Default is San José, Costa Rica center
          </p>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Description */}
          <div>
            <label htmlFor="hotel-description" className={labelClass}>
              Description
            </label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-3
                                 h-4 w-4 text-orange-400"
              />
              <textarea
                id="hotel-description"
                maxLength={50}
                rows={5}
                placeholder="Describe the hotel — features, nearby amenities, special conditions..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={cn(inputClass, "pl-9 resize-none")}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {form.description.length}/50 characters
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-end gap-3 pt-4
                    border-t border-gray-200 dark:border-slate-700"
      >
        <Link
          href="/dashboard/hotels"
          className="px-6 py-2.5 rounded-lg border border-gray-200
                   dark:border-slate-600 text-sm font-medium
                   text-gray-600 dark:text-gray-300
                   hover:bg-gray-50 dark:hover:bg-slate-800
                   transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-sky-100
                   hover:bg-sky-200 active:bg-sky-300
                   text-sky-900 text-sm font-semibold
                   transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
