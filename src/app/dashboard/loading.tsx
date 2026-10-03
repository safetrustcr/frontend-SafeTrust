import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-4 t-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </main>
  );
}
