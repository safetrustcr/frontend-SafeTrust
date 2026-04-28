'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home, MapPin, WalletCards, PercentCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  ApartmentFormField,
  IconInputField,
  IconSelectField,
  NumberSelectField,
} from './ApartmentFormFields';
import { ImageUploader } from './ImageUploader';

export interface NewApartmentFormData {
  name: string;
  location: string;
  amountPerMonth: number;
  promotionPercent: number | null;
  rooms: number;
  bathrooms: number;
  petFriendly: boolean;
  details: string;
  images: File[];
}

const ROOM_OPTIONS = Array.from({ length: 10 }, (_, index) =>
  String(index + 1)
);
const PROMOTION_OPTIONS = [
  { label: 'No promotion', value: 'none' },
  { label: '5%', value: '5' },
  { label: '10%', value: '10' },
  { label: '15%', value: '15' },
  { label: '20%', value: '20' },
  { label: '25%', value: '25' },
  { label: '30%', value: '30' },
  { label: '40%', value: '40' },
  { label: '50%', value: '50' },
];

export function NewApartmentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    amountPerMonth: '',
    promotionPercent: null as number | null,
    rooms: 1,
    bathrooms: 1,
    petFriendly: false,
    details: '',
  });
  const [imageSlots, setImageSlots] = useState<Array<File | null>>([
    null,
    null,
    null,
    null,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(formData.amountPerMonth);
    const amountPerMonth = Number.isFinite(parsedAmount) ? parsedAmount : 0;

    const data: NewApartmentFormData = {
      ...formData,
      amountPerMonth,
      images: imageSlots.filter((image): image is File => image !== null),
    };

    console.log('TODO: submit apartment', data);
    // TODO: wire to POST /api/apartments mutation
    router.push('/dashboard/apartments');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
          New apartment
        </h1>
        <p className="text-sm text-muted-foreground">
          Register a new apartment listing for guests to discover.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <div className="space-y-5">
          <ApartmentFormField label="Apartment name">
            <IconInputField
              icon={<Home className="h-4 w-4" aria-hidden="true" />}
              value={formData.name}
              onChange={(event) =>
                setFormData((currentData) => ({
                  ...currentData,
                  name: event.target.value,
                }))
              }
              placeholder="Apartment name"
              required
            />
          </ApartmentFormField>

          <ApartmentFormField label="Location">
            <IconInputField
              icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
              value={formData.location}
              onChange={(event) =>
                setFormData((currentData) => ({
                  ...currentData,
                  location: event.target.value,
                }))
              }
              placeholder="City, province or neighborhood"
              required
            />
          </ApartmentFormField>

          <ApartmentFormField label="Amount to pay">
            <IconInputField
              icon={<WalletCards className="h-4 w-4" aria-hidden="true" />}
              type="number"
              min={0}
              value={formData.amountPerMonth}
              onChange={(event) =>
                setFormData((currentData) => ({
                  ...currentData,
                  amountPerMonth: event.target.value,
                }))
              }
              placeholder="4000"
              required
            />
          </ApartmentFormField>

          <ApartmentFormField label="Promotion percent">
            <IconSelectField
              icon={<PercentCircle className="h-4 w-4" aria-hidden="true" />}
              value={formData.promotionPercent === null ? 'none' : String(formData.promotionPercent)}
              onValueChange={(value) =>
                setFormData((currentData) => ({
                  ...currentData,
                  promotionPercent: value === 'none' ? null : Number(value),
                }))
              }
              placeholder="Select promotion"
              options={PROMOTION_OPTIONS}
            />
          </ApartmentFormField>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <NumberSelectField
              label="Rooms"
              value={String(formData.rooms)}
              onValueChange={(value) =>
                setFormData((currentData) => ({
                  ...currentData,
                  rooms: Number(value),
                }))
              }
              options={ROOM_OPTIONS}
            />

            <NumberSelectField
              label="Bathrooms"
              value={String(formData.bathrooms)}
              onValueChange={(value) =>
                setFormData((currentData) => ({
                  ...currentData,
                  bathrooms: Number(value),
                }))
              }
              options={ROOM_OPTIONS}
            />

            <div className="flex items-center gap-3 pb-2">
              <Checkbox
                id="pet-friendly"
                checked={formData.petFriendly}
                onCheckedChange={(checked) =>
                  setFormData((currentData) => ({
                    ...currentData,
                    petFriendly: checked === true,
                  }))
                }
                className="border-orange-400 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
              />
              <Label
                htmlFor="pet-friendly"
                className="cursor-pointer text-sm font-semibold text-gray-900"
              >
                Pet friendly
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <ApartmentFormField label="Apartment details">
            <Textarea
              value={formData.details}
              onChange={(event) =>
                setFormData((currentData) => ({
                  ...currentData,
                  details: event.target.value,
                }))
              }
              placeholder="Describe the apartment, amenities, neighborhood and what makes it special."
              className="min-h-[150px] resize-y bg-white"
              required
            />
          </ApartmentFormField>

          <ApartmentFormField label="Images">
            <ImageUploader files={imageSlots} onChange={setImageSlots} />
          </ApartmentFormField>

          <Button
            type="submit"
            className="h-11 w-full bg-orange-500 text-base font-semibold text-white shadow-sm hover:bg-orange-600"
          >
            Register
          </Button>
        </div>
      </div>
    </form>
  );
}
