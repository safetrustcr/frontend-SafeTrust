import { cn } from "@/lib/utils";
import { formatListingPrice } from "./formatListingPrice";

/** Demo listing prices are USD per night (see SD-00). */
export const LISTING_PRICE_UNIT = "night" as const;

export function ListingPrice({
  amount,
  size = "md",
  className,
}: {
  amount: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span
        className={cn(
          "font-semibold text-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-2xl",
          size === "lg" && "text-3xl",
        )}
      >
        {formatListingPrice(amount)}
      </span>
      <span className="text-xs text-muted-foreground">
        / {LISTING_PRICE_UNIT}
      </span>
    </span>
  );
}
