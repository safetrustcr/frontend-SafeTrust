"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { safeRentReturn } from "./return-target";

export function BrowseRentalsLink({ className }: { className?: string }) {
  const searchParams = useSearchParams();

  return (
    <Link href={safeRentReturn(searchParams.get("from"))} className={className}>
      Browse rentals
    </Link>
  );
}
