import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const WIDTHS = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-screen-2xl",
} as const;

export function PageContainer({
  width = "default",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { width?: keyof typeof WIDTHS }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        WIDTHS[width],
        className,
      )}
      {...props}
    />
  );
}
