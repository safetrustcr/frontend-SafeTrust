'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FaBell,
  FaChevronDown,
  FaRegUserCircle,
  FaSearch,
} from 'react-icons/fa';

export default function HotelHeader() {
  return (
    <header className="border-b border-[#e8e1da] bg-white">
      <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-5 lg:px-7">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/img/logo.png" alt="SafeTrust" width={36} height={36} />
          <span className="text-[24px] font-semibold tracking-[-0.03em] text-[#202020]">
            SafeTrust
          </span>
        </Link>

        <div className="mx-auto hidden w-full max-w-[430px] items-center rounded-full border border-[#d9d9d9] bg-[#f3f3f3] px-2 py-1.5 md:flex">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#2d2d2d] shadow-sm"
          >
            Rent
            <FaChevronDown className="h-3.5 w-3.5" />
          </button>
          <div className="mx-3 h-6 w-px bg-[#d2d2d2]" />
          <span className="text-sm text-[#8a8a8a]">
            City, province or neighborhood
          </span>
          <FaSearch className="ml-auto h-4 w-4 text-[#5c5c5c]" />
        </div>

        <div className="ml-auto flex items-center gap-5">
          <div className="relative">
            <FaBell className="h-4 w-4 text-[#1f1f1f]" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ff6a00]" />
          </div>
          <span className="hidden text-sm font-semibold text-[#1f1f1f] lg:block">
            Randall Valenciano
          </span>
          <div className="grid h-10 w-10 place-items-center rounded-full border border-[#d9d9d9] bg-[#f6f6f6]">
            <FaRegUserCircle className="h-5 w-5 text-[#1f1f1f]" />
          </div>
        </div>
      </div>
    </header>
  );
}
