"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, MapPin, DollarSign, Plus, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  COORDINATES_REQUIRED,
  describeApartmentError,
  type ApartmentField,
  type ApartmentInput,
} from "@/features/apartments";

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5+"];
const BATHROOM_OPTIONS = ["1", "2", "3", "4+"];

type FormField = ApartmentField | "latitude" | "longitude";
type FormError = { message: string; field?: FormField };

const FORM_ERROR_ID = "apartment-form-error";
const errorId = (field: FormField) => `${field}-error`;

/** Picks the chip for a count, e.g. 6 bedrooms → "5+". */
const toOption = (options: string[], value: number) => {
  const last = options[options.length - 1];
  return value >= parseInt(last, 10) ? last : String(value);
};

/** A finite number, or null when the field is empty or not a number. */
const parseCoordinate = (value: string) => {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toDateInput = (iso: string | null | undefined) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

const getLocalYMD = () => {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().split("T")[0];
};

interface NewApartmentFormProps {
  initialValues?: ApartmentInput;
  /** Persists the apartment. A rejection keeps the form as it is and shows the message. */
  onSave: (input: ApartmentInput) => Promise<void>;
  title?: string;
  submitLabel?: string;
}

export function NewApartmentForm({
  initialValues,
  onSave,
  title = "New apartment",
  submitLabel = "Register",
}: NewApartmentFormProps) {
  const router = useRouter();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [price, setPrice] = useState(
    initialValues ? String(initialValues.price) : "",
  );
  const [warrantyDeposit, setWarrantyDeposit] = useState(
    initialValues ? String(initialValues.warrantyDeposit) : "",
  );
  const [street, setStreet] = useState(initialValues?.address.street ?? "");
  const [neighborhood, setNeighborhood] = useState(
    initialValues?.address.neighborhood ?? "",
  );
  const [city, setCity] = useState(initialValues?.address.city ?? "San José");
  const [country] = useState(initialValues?.address.country || "Costa Rica");
  const [latitude, setLatitude] = useState(
    initialValues?.coordinates ? String(initialValues.coordinates.lat) : "",
  );
  const [longitude, setLongitude] = useState(
    initialValues?.coordinates ? String(initialValues.coordinates.lng) : "",
  );
  const [bedrooms, setBedrooms] = useState(
    initialValues ? toOption(BEDROOM_OPTIONS, initialValues.bedrooms) : "2",
  );
  const [bathrooms, setBathrooms] = useState(
    initialValues ? toOption(BATHROOM_OPTIONS, initialValues.bathrooms) : "1",
  );
  const [petFriendly, setPetFriendly] = useState(
    initialValues?.petFriendly ?? false,
  );
  const [isAvailable, setIsAvailable] = useState(
    initialValues?.isAvailable ?? true,
  );
  const [availableFrom, setAvailableFrom] = useState(
    initialValues ? toDateInput(initialValues.availableFrom) : getLocalYMD,
  );
  const [availableUntil, setAvailableUntil] = useState(
    toDateInput(initialValues?.availableUntil),
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialValues?.imageUrls.length ? [...initialValues.imageUrls] : [""],
  );
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState<FormError | null>(null);

  const fieldErrorProps = (field: FormField) =>
    error?.field === field
      ? { "aria-invalid": true, "aria-describedby": errorId(field) }
      : {};

  const fieldError = (field: FormField) =>
    error?.field === field ? (
      <p id={errorId(field)} role="alert" className="text-sm text-destructive">
        {error.message}
      </p>
    ) : null;

  // ── Image URL handlers ───────────────────────────────────────────────────────
  const addImageUrl = () => setImageUrls((prev) => [...prev, ""]);

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const validate = (): FormError | null => {
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return { field: "price", message: "Please enter a valid price" };
    }
    if (
      !warrantyDeposit ||
      isNaN(Number(warrantyDeposit)) ||
      Number(warrantyDeposit) <= 0
    ) {
      return {
        field: "warrantyDeposit",
        message: "Please enter a valid warranty deposit",
      };
    }
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    if (lat === null) {
      return { field: "latitude", message: COORDINATES_REQUIRED };
    }
    if (lng === null) {
      return { field: "longitude", message: COORDINATES_REQUIRED };
    }
    if (lat < -90 || lat > 90) {
      return {
        field: "latitude",
        message: "Latitude must be between -90 and 90",
      };
    }
    if (lng < -180 || lng > 180) {
      return {
        field: "longitude",
        message: "Longitude must be between -180 and 180",
      };
    }
    if (availableUntil && new Date(availableUntil) <= new Date(availableFrom)) {
      return {
        field: "availableUntil",
        message: "Available Until must be later than Available From",
      };
    }
    return null;
  };

  const toInput = (): ApartmentInput => {
    const lat = parseCoordinate(latitude);
    const lng = parseCoordinate(longitude);
    return {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      warrantyDeposit: parseFloat(warrantyDeposit),
      address: {
        street: street.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        country: country.trim(),
      },
      coordinates: lat !== null && lng !== null ? { lat, lng } : null,
      isAvailable,
      availableFrom: new Date(availableFrom).toISOString(),
      availableUntil: availableUntil
        ? new Date(availableUntil).toISOString()
        : null,
      bedrooms: parseInt(bedrooms, 10),
      bathrooms: parseInt(bathrooms, 10),
      petFriendly,
      imageUrls: imageUrls.map((url) => url.trim()).filter(Boolean),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return;

    const invalid = validate();
    setError(invalid);
    if (invalid) return;

    savingRef.current = true;
    setSaving(true);
    try {
      await onSave(toInput());
    } catch (saveError) {
      setError(describeApartmentError(saveError));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/apartments")}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Left column ── */}
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Apartment Name *</Label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                <Input
                  id="name"
                  placeholder="e.g. La Sabana Sur Studio"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                <Input
                  id="street"
                  placeholder="e.g. Calle 42, Avenida 8"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Neighborhood + City */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input
                  id="neighborhood"
                  placeholder="e.g. Sabana Norte"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  aria-required="true"
                  step="any"
                  placeholder="9.9281"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  {...fieldErrorProps("latitude")}
                />
                {fieldError("latitude")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  aria-required="true"
                  step="any"
                  placeholder="-84.0907"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  {...fieldErrorProps("longitude")}
                />
                {fieldError("longitude")}
              </div>
            </div>

            {/* Price + Deposit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="1200.00"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-9"
                    {...fieldErrorProps("price")}
                  />
                </div>
                {fieldError("price")}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Warranty Deposit (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                  <Input
                    id="deposit"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="2400.00"
                    required
                    value={warrantyDeposit}
                    onChange={(e) => setWarrantyDeposit(e.target.value)}
                    className="pl-9"
                    {...fieldErrorProps("warrantyDeposit")}
                  />
                </div>
                {fieldError("warrantyDeposit")}
              </div>
            </div>

            {/* Bedrooms + Bathrooms */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Bedrooms"
                >
                  {BEDROOM_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBedrooms(opt)}
                      aria-pressed={bedrooms === opt}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        bedrooms === opt
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-background text-muted-foreground border-border hover:border-orange-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Bathrooms"
                >
                  {BATHROOM_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBathrooms(opt)}
                      aria-pressed={bathrooms === opt}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        bathrooms === opt
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-background text-muted-foreground border-border hover:border-orange-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From *</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  required
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableUntil">Available Until</Label>
                <Input
                  id="availableUntil"
                  type="date"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                  {...fieldErrorProps("availableUntil")}
                />
                {fieldError("availableUntil")}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={petFriendly}
                  onCheckedChange={(v) => setPetFriendly(Boolean(v))}
                />
                Pet friendly
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={isAvailable}
                  onCheckedChange={(v) => setIsAvailable(Boolean(v))}
                />
                Available now
              </label>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Apartment Details</Label>
              <Textarea
                id="description"
                placeholder="Describe the apartment — features, nearby amenities, special conditions..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
              />
            </div>

            {/* Image URLs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-orange-400" />
                  Image URLs
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImageUrl}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add URL
                </Button>
              </div>

              <div className="space-y-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      aria-label={`Image URL ${index + 1}`}
                      placeholder={`https://example.com/image-${index + 1}.jpg`}
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        aria-label={`Remove image URL ${index + 1}`}
                        className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Image preview grid */}
              {imageUrls.some((url) => url.trim() !== "") && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imageUrls
                    .filter(
                      (url) => url.trim() !== "" && !failedImages.has(url),
                    )
                    .map((url, index) => (
                      <div
                        key={url}
                        className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted border border-border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setFailedImages((prev) => new Set(prev).add(url));
                          }}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && !error.field && (
          <p
            id={FORM_ERROR_ID}
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error.message}
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => router.push("/dashboard/apartments")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-orange-700 hover:bg-orange-800 text-white px-8"
          >
            {saving ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
