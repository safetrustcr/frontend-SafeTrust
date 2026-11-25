import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function OffersSkeleton() {
  return (
    <div role="status" aria-label="Loading offers" className="space-y-4">
      <span className="sr-only">Loading offers...</span>
      <div aria-hidden="true" className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OffersErrorState({
  onRetry,
  backHref,
}: {
  onRetry: () => void;
  backHref: string;
}) {
  return (
    <div
      role="alert"
      className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/10 p-6"
    >
      <h2 className="font-semibold text-foreground">Unable to load offers</h2>
      <p className="text-sm text-muted-foreground">Please try again.</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={onRetry}>Try again</Button>
        <Button asChild variant="outline">
          <Link href={backHref}>Back to apartments</Link>
        </Button>
      </div>
    </div>
  );
}
