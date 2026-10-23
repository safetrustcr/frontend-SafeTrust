"use client";

import { useEffect, useId, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Drawer } from "vaul";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  parseFilters,
  type Location,
} from "@/components/listings/filters/useRentFilters";
import { localToday } from "./date-only";
import {
  EMPTY_STAY_SEARCH,
  readStaySearch,
  writeStaySearch,
} from "./stay-search";
import type { ComposerSection, SearchDraft } from "./composer-types";
import { SECTIONS } from "./sections";

const LISTING_PAGES = new Set(["/rent", "/guest/suggestions"]);

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return desktop;
}

export function SearchComposer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramsString = params.toString();
  const desktop = useIsDesktop();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<ComposerSection["id"]>("where");
  const [draft, setDraftState] = useState<SearchDraft>({
    ...EMPTY_STAY_SEARCH,
    location: null,
    nearby: false,
  });

  const currentParams = new URLSearchParams(paramsString);
  const listingPage = LISTING_PAGES.has(pathname);
  const applied: SearchDraft = {
    ...readStaySearch(currentParams),
    location: listingPage ? parseFilters(currentParams).location : null,
    nearby: listingPage && currentParams.get("sort") === "nearest",
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftState(applied);
      setExpanded("where");
    }
    setOpen(nextOpen);
  };

  const setDraft = (patch: Partial<SearchDraft>) =>
    setDraftState((current) => ({ ...current, ...patch }));

  const canSearch = !(
    draft.guests.adults === 0 &&
    (draft.guests.children > 0 ||
      draft.guests.infants > 0 ||
      draft.guests.pets > 0)
  );

  const apply = () => {
    if (!canSearch) return;
    const onListings = LISTING_PAGES.has(pathname);
    const query = new URLSearchParams(onListings ? paramsString : "");
    const location: Location | null = draft.location;

    if (location) query.set("location", location);
    else query.delete("location");

    writeStaySearch(draft, query);

    if (draft.nearby) query.set("sort", "nearest");
    else if (query.get("sort") === "nearest") query.delete("sort");

    const target = onListings ? pathname : "/rent";
    setOpen(false);
    const queryString = query.toString();
    router.push(queryString ? `${target}?${queryString}` : target);
  };

  const clearAll = () =>
    setDraftState({
      ...EMPTY_STAY_SEARCH,
      location: null,
      nearby: false,
    });

  const today = localToday();
  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-border bg-card"
          >
            <button
              type="button"
              aria-expanded={expanded === section.id}
              aria-controls={`${titleId}-${section.id}`}
              onClick={() => setExpanded(section.id)}
              className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-sm text-muted-foreground">
                {section.title}
              </span>
              <span className="min-w-0 truncate text-right text-sm font-medium text-foreground">
                {section.summary(draft)}
              </span>
            </button>
            {expanded === section.id ? (
              <div
                id={`${titleId}-${section.id}`}
                className="border-t border-border p-4"
              >
                {section.render({ draft, setDraft, today })}
              </div>
            ) : null}
          </section>
        ))}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button type="button" variant="ghost" onClick={clearAll}>
          Clear all
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={!canSearch} onClick={apply}>
            Search
          </Button>
        </div>
      </div>
    </div>
  );

  const triggerButton = (
    <button
      type="button"
      aria-label={`Search stays: ${SECTIONS.map((section) => section.summary(applied)).join(" · ")}`}
      className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-full border border-border bg-muted/60 px-3 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4"
    >
      <span className="min-w-0 flex-1 truncate font-medium">
        {SECTIONS.map((section) => section.summary(applied)).join(" · ")}
      </span>
      <Search
        aria-hidden="true"
        data-testid="header-search-icon"
        className="h-4 w-4 shrink-0 text-muted-foreground"
      />
    </button>
  );

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
        <DialogContent
          data-testid="search-composer-dialog"
          aria-labelledby={titleId}
          className="flex max-h-[85dvh] max-w-xl flex-col gap-0 overflow-hidden p-0"
        >
          <DialogTitle id={titleId} className="px-4 pt-4">
            Search stays
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a destination and apply your search.
          </DialogDescription>
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Trigger asChild>{triggerButton}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-black/50" />
        <Drawer.Content
          data-testid="search-composer-sheet"
          aria-labelledby={titleId}
          className="fixed inset-x-0 bottom-0 z-[100] flex h-[min(90dvh,44rem)] flex-col rounded-t-2xl border border-border bg-background outline-none"
        >
          <Drawer.Title
            id={titleId}
            className="shrink-0 px-4 pb-3 pt-4 text-lg font-semibold text-foreground"
          >
            Search stays
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Choose a destination and apply your search.
          </Drawer.Description>
          {body}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
