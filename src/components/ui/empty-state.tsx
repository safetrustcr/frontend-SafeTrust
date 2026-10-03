import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** The headline. Phrased as the situation, not as an error code. */
  title: string;
  /** A line of context: why it is empty, or what to do about it. */
  description?: string;
  /** Usually a button or a link, rendered under the text. */
  action?: ReactNode;
  className?: string;
}

/**
 * A centred "there is nothing here" block: a title, an optional line of
 * context, and an optional action.
 *
 * The route-level states (the branded 404, and later any empty list) share it
 * so they read as part of the product rather than as a bare browser error.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md flex-col items-center text-center",
        className,
      )}
    >
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
