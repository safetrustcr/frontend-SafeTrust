import { formatListingPrice } from "./formatListingPrice";
import { cn } from "@/lib/utils";

interface ListingPriceProps {
  amount: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ListingPrice({
  amount,
  size = "md",
  className,
}: ListingPriceProps) {
  const sizeClasses = {
    sm: "text-base font-semibold",
    md: "text-xl font-semibold",
    lg: "text-2xl font-bold",
  };

  const suffixClasses = {
    sm: "text-xs font-normal text-muted-foreground",
    md: "text-sm font-normal text-muted-foreground",
    lg: "text-base font-normal text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-1 text-foreground",
        className,
      )}
    >
      <span className={sizeClasses[size]}>{formatListingPrice(amount)}</span>
      <span className={suffixClasses[size]}>/ night</span>
    </div>
  );
}

export default ListingPrice;
