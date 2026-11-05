"use client";

import { SlidersHorizontal } from "lucide-react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import FilterSidebar from "./FilterSidebar";
import type { RentFilters } from "../../model/filters";

interface RentFiltersDrawerProps {
  filters: RentFilters;
  setFilters: (patch: Partial<RentFilters>) => void;
  reset: () => void;
  activeCount: number;
  resultCount: number;
}

export default function RentFiltersDrawer({
  filters,
  setFilters,
  reset,
  activeCount,
  resultCount,
}: RentFiltersDrawerProps) {
  return (
    <Drawer.Root shouldScaleBackground={false}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          aria-label={`Filters${activeCount ? `, ${activeCount} active` : ""}`}
          className="inline-flex min-h-11 justify-center shrink-0 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted lg:hidden"
        >
          <SlidersHorizontal aria-hidden="true" className="mr-2 h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const content = event.currentTarget;
            if (content instanceof HTMLElement) {
              content.querySelector<HTMLElement>("button, input")?.focus();
            }
          }}
          style={{ maxHeight: "85dvh" }}
          className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-screen flex-col rounded-t-2xl border border-border bg-background px-4 pt-3 outline-none sm:px-6"
        >
          <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
          <Drawer.Title className="pb-2 text-lg font-semibold text-foreground">
            Filters
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Choose rental filters and review the matching places.
          </Drawer.Description>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4">
            {/* Full width: the sidebar's fixed desktop width overflows phones. */}
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              reset={reset}
              className="w-full p-0"
            />
          </div>
          <div className="sticky bottom-0 flex shrink-0 justify-end border-t border-border bg-background py-3">
            <Drawer.Close asChild>
              <Button>Show {resultCount} places</Button>
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
