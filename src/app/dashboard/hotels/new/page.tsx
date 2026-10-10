"use client";

import { DashboardGlassCard } from "@/components/dashboard/ui/DashboardGlassCard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Building2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotelFormData {
  name: string;
  description: string;
  address: string;
  location_area: string;
  latitude: string;
  longitude: string;
}

const EMPTY_FORM: HotelFormData = {
  name: "",
  description: "",
  address: "",
  location_area: "",
  latitude: "9.9281",
  longitude: "-84.0907",
};

export default function NewHotelPage() {
  const router = useRouter();
  const [form, setForm] = useState<HotelFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: keyof HotelFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: wire to Hasura mutation → INSERT INTO public.hotels
    // Mutation payload shape:
    // {
    //   name: form.name,                           // VARCHAR(20)
    //   description: form.description,             // VARCHAR(50)
    //   address: form.address,                     // VARCHAR(50)
    //   location_area: form.location_area,         // VARCHAR(20)
    //   coordinates: `POINT(${form.longitude} ${form.latitude})`
    //                                              // geometry(Point, 4326)
    // }
    //
    // Note: PostGIS WKT format for coordinates is POINT(lng lat)
    // Example: POINT(-84.0907 9.9281)

    await new Promise((r) => setTimeout(r, 800)); // stub delay
    setIsSubmitting(false);
    router.push("/dashboard/hotels");
  };

  const inputClass = cn(
    "w-full rounded-lg border border-gray-200 dark:border-slate-600",
    "bg-white dark:bg-slate-900 px-4 py-2.5 text-sm",
    "text-gray-900 dark:text-white",
    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
    "focus:outline-none focus:ring-2 focus:ring-orange-500",
    "transition-colors",
  );

  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/hotels"
        className="flex items-center gap-2 text-sm
                   text-gray-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hotels
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          New Hotel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Register a new hotel property on SafeTrust
        </p>
      </div>

      <DashboardGlassCard className="p-4 sm:p-6">
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
                  value={form.location_area}
                  onChange={(e) => set("location_area", e.target.value)}
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
                    placeholder="9.9281"
                    value={form.latitude}
                    onChange={(e) => set("latitude", e.target.value)}
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
                    placeholder="-84.0907"
                    value={form.longitude}
                    onChange={(e) => set("longitude", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 -mt-2">
                PostGIS coordinates — default is San José, Costa Rica center
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

              {/* Schema note */}
              <div
                className="rounded-lg border border-blue-200
                            dark:border-blue-800 bg-blue-50
                            dark:bg-blue-900/10 p-4 space-y-1"
              >
                <p
                  className="text-xs font-semibold text-blue-600
                             dark:text-blue-400"
                >
                  Schema constraints (public.hotels)
                </p>
                <ul
                  className="text-xs text-blue-500 dark:text-blue-400
                              space-y-0.5 list-disc list-inside"
                >
                  <li>name — max 20 characters, required</li>
                  <li>description — max 50 characters</li>
                  <li>address — max 50 characters, required</li>
                  <li>location_area — max 20 characters</li>
                  <li>coordinates — PostGIS Point (longitude, latitude)</li>
                </ul>
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-orange-500
                       hover:bg-orange-600 active:bg-orange-700
                       text-white text-sm font-semibold
                       transition-colors disabled:opacity-60
                       disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Hotel"}
            </button>
          </div>
        </form>
      </DashboardGlassCard>
    </div>
  );
}
