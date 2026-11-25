"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { safeRentReturn } from "./return-target";

export function BackToRentals() {
  const searchParams = useSearchParams();

  return (
    <Link
      href={safeRentReturn(searchParams.get("from"))}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      Back to rentals
    </Link>
  );
}
