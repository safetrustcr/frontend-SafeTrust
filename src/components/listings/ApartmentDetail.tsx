'use client';

import type { HotelListing } from '@/@types/hotel';
import Image from 'next/image';
import { FaMapMarkerAlt } from 'react-icons/fa';
import AmenityIcons from './AmenityIcons';
import { formatListingPrice } from './formatListingPrice';
import ImageGallery from './ImageGallery';

interface ApartmentDetailProps {
  apartment: HotelListing;
  onBook: () => void;
}

export default function ApartmentDetail({
  apartment,
  onBook,
}: ApartmentDetailProps) {
  return (
    <section className="flex-1 px-6 py-8 lg:px-10">
      <ImageGallery
        images={apartment.images}
        promoted={apartment.promoted}
        altText={apartment.name}
      />

      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#181818]">
            {apartment.name}
          </h1>

          <div className="mt-5 flex items-center gap-3 text-sm text-[#717171]">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#fff1e7] text-[#ff6a00]">
              <FaMapMarkerAlt className="h-4 w-4" />
            </span>
            <span>{apartment.address}</span>
          </div>

          <div className="mt-8">
            <AmenityIcons
              bedrooms={apartment.bedrooms}
              bathrooms={apartment.bathrooms}
              petFriendly={apartment.petFriendly}
            />
          </div>
        </div>

        <div className="w-full rounded-[12px] lg:max-w-[210px]">
          <button
            type="button"
            onClick={onBook}
            className="w-full rounded-[8px] bg-[#ff6a00] px-6 py-4 text-xl font-semibold text-white transition hover:bg-[#ec6200]"
          >
            BOOK
          </button>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-[34px] font-semibold leading-none text-[#10a156]">
              {formatListingPrice(apartment.price)}
            </span>
            <span className="pb-1 text-sm text-[#808080]">Per month</span>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <span className="text-sm font-medium text-[#5a5a5a]">
              {apartment.owner.name}
            </span>
            <Image
              src={apartment.owner.avatar}
              alt={apartment.owner.name}
              width={34}
              height={34}
              className="h-[34px] w-[34px] rounded-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 max-w-[760px]">
        <h2 className="text-[22px] font-semibold text-[#1b1b1b]">
          Apartment details
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#6d6d6d]">
          {apartment.description}
        </p>
      </div>
    </section>
  );
}
