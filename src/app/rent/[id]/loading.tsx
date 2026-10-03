import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <Skeleton className="aspect-[16/9] w-full rounded-xl" />
      <div className="mt-6 flex flex-col gap-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 t-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </main>
  );
}
