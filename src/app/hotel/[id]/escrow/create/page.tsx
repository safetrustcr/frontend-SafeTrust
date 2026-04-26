'use client';

import { HotelHeader } from '@/components/hotel';
import Link from 'next/link';
import { use } from 'react';

export default function HotelEscrowCreatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <div className="min-h-screen bg-[#faf7f3]">
      <HotelHeader />
      <main className="mx-auto max-w-[860px] px-6 py-16">
        <div className="rounded-[18px] border border-[#e7ddd5] bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full bg-[#fff1e7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#ff6a00]">
            Escrow flow
          </span>
          <h1 className="mt-5 text-[34px] font-semibold tracking-[-0.04em] text-[#1d1d1d]">
            Create escrow for apartment {resolvedParams.id}
          </h1>
          <p className="mt-4 max-w-[620px] text-base leading-7 text-[#666666]">
            This route is wired so the BOOK button from the apartment detail
            page lands on a valid escrow creation screen instead of a 404. The
            full escrow form can be layered onto this route in the follow-up
            issue.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/hotel/${resolvedParams.id}`}
              className="rounded-[10px] border border-[#d7cdc4] px-5 py-3 text-sm font-medium text-[#282828]"
            >
              Back to apartment
            </Link>
            <Link
              href="/hotel"
              className="rounded-[10px] bg-[#ff6a00] px-5 py-3 text-sm font-semibold text-white"
            >
              Browse more apartments
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
