import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * A pulsing placeholder used by the route-level `loading.tsx` screens while
 * their content streams in.
 */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-muted motion-safe:animate-pulse", className)}
      {...props}
    />
  );
}
