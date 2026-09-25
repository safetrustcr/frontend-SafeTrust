"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/**
 * Lazy-loaded wrappers for the heavy components shared by the /rent pages.
 *
 * Each wrapper defers the underlying component (and its dependency tree:
 * next/image, react-icons, lucide-react, theme toggle, mock data, ...) into a
 * separate network chunk until the page needs it, shrinking the initial bundle
 * the browser has to fetch for /rent and /rent/[id].
 *
 * The `loading` fallbacks mirror the real component's outer layout (sizing,
 * borders, paddings) so the page does not jump while a chunk is being fetched.
 */

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-gray-200/80 dark:bg-slate-700/80",
        className,
      )}
    />
  );
}

function LoaderLabel() {
  return <span className="sr-only">Loading</span>;
}

export const LazyHotelHeader = dynamic(() => import("./HotelHeader"), {
  loading: () => (
    <header className="border-b border-[#e8e1da] bg-white dark:border-slate-700 dark:bg-slate-900">
      <LoaderLabel />
      <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-5 lg:px-7">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="ml-auto h-10 w-10 rounded-full" />
      </div>
    </header>
  ),
});

export const LazyFilterSidebar = dynamic(() => import("./FilterSidebar"), {
  loading: () => (
    <aside className="w-full border-b border-gray-200 px-6 py-8 lg:w-[215px] lg:border-b-0 lg:border-r dark:border-slate-700 dark:bg-slate-900/0">
      <LoaderLabel />
      <Skeleton className="mb-5 h-4 w-20" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4 w-28" />
        ))}
      </div>

      <div className="my-0 h-px bg-gray-200 dark:bg-slate-700" />

      <div className="py-8">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="my-0 h-px bg-gray-200 dark:bg-slate-700" />

      <div className="pt-8">
        <Skeleton className="mb-5 h-4 w-20" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-4 w-28" />
          ))}
        </div>
      </div>
    </aside>
  ),
});

export const LazyApartmentGrid = dynamic(() => import("./ApartmentGrid"), {
  loading: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <LoaderLabel />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-full overflow-hidden rounded-[16px] border bg-white dark:border-slate-700 dark:bg-slate-800"
        >
          <Skeleton className="h-[170px] w-full rounded-none" />
          <div className="flex flex-col gap-2 px-4 py-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  ),
});

export const LazyApartmentDetail = dynamic(() => import("./ApartmentDetail"), {
  loading: () => (
    <section className="flex-1 px-6 py-8 lg:px-10">
      <LoaderLabel />
      <Skeleton className="min-h-[220px] w-full rounded-lg" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-10 space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </section>
  ),
});

export const LazySuggestionsList = dynamic(() => import("./SuggestionsList"), {
  loading: () => (
    <aside className="w-full border-b border-[#e8e1da] px-6 py-8 lg:w-[320px] lg:border-b-0 lg:border-r">
      <LoaderLabel />
      <div className="mb-6">
        <Skeleton className="mb-2 h-7 w-40" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-16 w-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  ),
});