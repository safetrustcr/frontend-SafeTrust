"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
  name: string;
  count?: number;
  image?: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function DestinationCard({
  name,
  count,
  image = "/img/hotel/hotel1.jpg",
  selected = false,
  onClick,
}: DestinationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      data-testid={`destination-card-${name.toLowerCase().replace(/\s+/g, "-")}`}
      className={cn(
        "group relative flex min-w-28 flex-col items-center justify-center overflow-hidden rounded-xl border p-3 text-left transition hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
        selected
          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-sm"
          : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800",
      )}
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={name}
          fill
          sizes="56px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <span className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
        {name}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-700 dark:text-gray-400">
          {count} units
        </span>
      )}
    </button>
  );
}
