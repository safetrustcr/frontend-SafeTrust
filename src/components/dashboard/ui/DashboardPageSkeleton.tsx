import { Skeleton } from "@/components/ui/skeleton";

type Variant = "overview" | "table" | "form" | "list";

interface DashboardPageSkeletonProps {
  variant: Variant;
  label: string;
}

const range = (length: number) => Array.from({ length }, (_, index) => index);

function TableBlock({ rows }: { rows: number }) {
  return (
    <div className="dashboard-glass-card space-y-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-full max-w-xs" />
        <Skeleton className="h-10 w-28 shrink-0" />
      </div>
      {range(rows).map((index) => (
        <Skeleton key={index} data-skeleton-row className="h-10 w-full" />
      ))}
    </div>
  );
}

export function DashboardPageSkeleton({
  variant,
  label,
}: DashboardPageSkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      data-variant={variant}
      className="space-y-6"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {variant === "overview" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {range(4).map((index) => (
              <div
                key={index}
                data-skeleton-tile
                className="dashboard-glass-card space-y-3 p-5"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
          <TableBlock rows={4} />
        </>
      )}

      {variant === "table" && <TableBlock rows={6} />}

      {variant === "form" && (
        <div className="max-w-2xl space-y-5">
          {range(5).map((index) => (
            <div key={index} data-skeleton-field className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {variant === "list" && (
        <div className="space-y-4">
          {range(8).map((index) => (
            <div
              key={index}
              data-skeleton-item
              className="flex items-center gap-3"
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
