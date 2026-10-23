import React from "react";

export interface RentResultsHeaderProps {
  location: string | null;
  count: number;
  isOutsideCostaRica: boolean;
}

export function RentResultsHeader({
  location,
  count,
  isOutsideCostaRica,
}: RentResultsHeaderProps) {
  return (
    <div>
      <h1 className="text-[24px] leading-tight text-gray-900 dark:text-white sm:text-[30px]">
        Available for rent in{" "}
        <span className="font-semibold">{location ?? "Costa Rica"}</span>
      </h1>
      <p
        className="mt-3 text-sm text-gray-600 dark:text-gray-400"
        aria-live="polite"
      >
        {count} {count === 1 ? "unit" : "units"} available
      </p>
      {isOutsideCostaRica ? (
        <p
          className="mt-2 text-sm text-gray-600 dark:text-gray-300"
          role="status"
        >
          You seem to be outside Costa Rica, so we&apos;re showing popular
          destinations.
        </p>
      ) : null}
    </div>
  );
}
