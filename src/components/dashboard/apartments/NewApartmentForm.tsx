"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Home, MapPin, DollarSign, Plus, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useGlobalAuthenticationStore } from "@/core/store/data";

  const ownerAddress = useMemo(() => { 
const BATHROOM_OPTIONS = ["1", "2", "3", "4+"];

export interface ApartmentData {
  name?: string;
  location?: string;
  amount?: string;
  promotion?: string;
  details?: string;
  rooms?: string;
  baths?: string;
  petFriendly?: boolean;
}

interface NewApartmentFormProps {
  initialData?: ApartmentData;
  onSubmit?: (event: React.FormEvent) => void;
  const [name, setName] = useState(initialData?.name || ""); 
  const [description, setDescription] = useState(initialData?.details || ""); 
  const [price, setPrice] = useState(initialData?.amount || ""); 
  const [warrantyDeposit, setWarrantyDeposit] = useState(""); 
  const [street, setStreet] = useState(initialData?.location || ""); 
  const [neighborhood, setNeighborhood] = useState(""); 
  const [city, setCity] = useState("San José"); 
  const [country, setCountry] = useState("Costa Rica"); 
  const [latitude, setLatitude] = useState(""); 
  const [longitude, setLongitude] = useState(""); 
  const [bedrooms, setBedrooms] = useState(initialData?.rooms || "2"); 
  const [bathrooms, setBathrooms] = useState(initialData?.baths || "1"); 
  const [petFriendly, setPetFriendly] = useState(initialData?.petFriendly || false); 
  const [isAvailable, setIsAvailable] = useState(true); 
  const [availableFrom, setAvailableFrom] = useState(getLocalYMD()); 
  const [availableUntil, setAvailableUntil] = useState(""); 
  const [imageUrls, setImageUrls] = useState<string[]>([""]); 
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); 
  const [loading, setLoading] = useState(false); 
      return null;
    }
  }, [address, token]);

  const getLocalYMD = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().split("T")[0];
  };

  // ── Form state ──────────────────────────────────────────────────────────────
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.details || "");
  const [price, setPrice] = useState(initialData?.amount || "");
  const [warrantyDeposit, setWarrantyDeposit] = useState("");
  const [street, setStreet] = useState(initialData?.location || "");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("San José");
  const [country, setCountry] = useState("Costa Rica");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [bedrooms, setBedrooms] = useState(initialData?.rooms || "2");
  const [bathrooms, setBathrooms] = useState(initialData?.baths || "1");
  const [petFriendly, setPetFriendly] = useState(initialData?.petFriendly || false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableFrom, setAvailableFrom] = useState(getLocalYMD());
  const [availableUntil, setAvailableUntil] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // ── Stub submit (no Apollo) ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ownerAddress) {
      toast.error("You must be logged in to create an apartment");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (
      !warrantyDeposit ||
      isNaN(Number(warrantyDeposit)) ||
      Number(warrantyDeposit) <= 0
    ) {
      toast.error("Please enter a valid warranty deposit");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && (lat < -90 || lat > 90)) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }
    if (!isNaN(lng) && (lng < -180 || lng > 180)) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    if (availableUntil && new Date(availableUntil) <= new Date(availableFrom)) {
      toast.error("Available Until must be later than Available From");
      return;
    }

    const filteredImageUrls = imageUrls.filter((url) => url.trim() !== "");

    const payload = {
      owner_id: ownerAddress,
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      warranty_deposit: parseFloat(warrantyDeposit),
      address: {
        street: street.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        country: country.trim(),
      },
      coordinates: !isNaN(lat) && !isNaN(lng) ? `(${lat},${lng})` : null,
      is_available: isAvailable,
      available_from: new Date(availableFrom).toISOString(),
      available_until: availableUntil ? new Date(availableUntil).toISOString() : null,
      image_urls: filteredImageUrls.length > 0 ? filteredImageUrls : null,
      bedrooms: parseInt(bedrooms, 10),
      bathrooms: parseInt(bathrooms, 10),
      pet_friendly: petFriendly,
    };

    // TODO: wire to Hasura mutation → INSERT INTO public.apartments using payload

    try {
      if (onSubmit) {
        setLoading(true);
        await onSubmit(e);
        return;
      }
      
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800)); // stub delay
      toast.success("Apartment created successfully!");
      router.push("/dashboard/apartments");
    } finally {
      setLoading(false);
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
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="9.9281"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="-84.0907"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
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
                  />
                </div>
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
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms + Bathrooms */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Bedrooms">
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
                <div className="flex flex-wrap gap-2" role="group" aria-label="Bathrooms">
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
                />
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
                      placeholder={`https://example.com/image-${index + 1}.jpg`}
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      className="flex-1 text-sm"
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Image preview grid */}
              {imageUrls.some((url) => url.trim() !== "") && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imageUrls
                    .filter((url) => url.trim() !== "" && !failedImages.has(url))
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

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => router.push("/dashboard/apartments")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
          >
            {loading ? "Processing..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}