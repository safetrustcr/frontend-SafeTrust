"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Building2, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateImageUrl, type HotelDraft } from "@/features/listings";

interface HotelFormValues {
  name: string;
  description: string;
  address: string;
  locationArea: string;
  lat: string;
  lng: string;
  imageUrl: string;
}

const toValues = (draft?: HotelDraft): HotelFormValues => ({
  name: draft?.name ?? "",
  description: draft?.description ?? "",
  address: draft?.address ?? "",
  locationArea: draft?.locationArea ?? "",
  lat: String(draft?.lat ?? 9.9281),
  lng: String(draft?.lng ?? -84.0907),
  imageUrl: draft?.imageUrl ?? "",
});

interface HotelFormProps {
  initial?: HotelDraft;
  submitLabel: string;
  onSubmit: (draft: HotelDraft) => void;
}

export function HotelForm({ initial, submitLabel, onSubmit }: HotelFormProps) {
  const [form, setForm] = useState<HotelFormValues>(() => toValues(initial));

  const [imageTouched, setImageTouched] = useState(false);
  const [imageStatus, setImageStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");
  const imageError = validateImageUrl(form.imageUrl);
  const trimmedImageUrl = form.imageUrl.trim();

  const set = (field: keyof HotelFormValues, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageError) {
      setImageTouched(true);
      document.getElementById("hotel-image-url")?.focus();
      return;
    }
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      locationArea: form.locationArea.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      imageUrl: trimmedImageUrl,
    });
  };

  const inputClass = cn(
    "w-full rounded-lg border border-border",
    "bg-background px-4 py-2.5 text-sm",
    "text-foreground",
    "placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring",
    "transition-colors",
  );

  const labelClass = "block text-sm font-medium text-foreground mb-1";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
            <p className="text-xs text-muted-foreground mt-1">
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
          <p className="text-xs text-muted-foreground -mt-2">
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
            <p className="text-xs text-muted-foreground mt-1">
              {form.description.length}/50 characters
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="hotel-image-url" className={labelClass}>
              Image URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <ImageIcon
                className="absolute left-3 top-1/2 -translate-y-1/2
                                 h-4 w-4 text-orange-400"
              />
              <input
                id="hotel-image-url"
                type="text"
                inputMode="url"
                required
                aria-invalid={imageTouched && imageError ? true : undefined}
                aria-describedby={
                  imageTouched && imageError
                    ? "hotel-image-url-error"
                    : undefined
                }
                placeholder="https://… or /img/hotel/…"
                value={form.imageUrl}
                onChange={(e) => {
                  set("imageUrl", e.target.value);
                  setImageStatus("loading");
                }}
                onBlur={() => setImageTouched(true)}
                className={cn(
                  inputClass,
                  "pl-9",
                  imageTouched && imageError && "border-red-500",
                )}
              />
            </div>
            {imageTouched && imageError && (
              <p
                id="hotel-image-url-error"
                role="alert"
                className="text-xs text-red-500 mt-1"
              >
                {imageError}
              </p>
            )}
            {!imageError && (
              <div className="mt-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                  {imageStatus === "loading" && (
                    <div
                      data-testid="hotel-image-skeleton"
                      className="absolute inset-0 animate-pulse bg-muted-foreground/10"
                    />
                  )}
                  {imageStatus === "error" ? (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                      <ImageIcon className="h-6 w-6" aria-hidden="true" />
                      Couldn&apos;t load this image
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={trimmedImageUrl}
                      src={trimmedImageUrl}
                      alt={form.name.trim() || "Hotel image preview"}
                      onLoad={() => setImageStatus("loaded")}
                      onError={() => setImageStatus("error")}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                {imageStatus === "error" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This is only a warning. You can still save.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-end gap-3 pt-4
                    border-t border-border"
      >
        <Link
          href="/dashboard/hotels"
          className="px-6 py-2.5 rounded-lg border border-border
                   text-sm font-medium
                   text-muted-foreground
                   hover:bg-accent
                   transition-colors"
        >
          Cancel
        </Link>
        <Button type="submit" size="lg" className="px-6">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
