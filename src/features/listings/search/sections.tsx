"use client";

import type { ComposerSection, SearchDraft } from "./composer-types";
import { useSharedGeolocation } from "@/providers/GeolocationProvider";

function WhereEditor({
  draft,
  setDraft,
}: {
  draft: SearchDraft;
  setDraft: (patch: Partial<SearchDraft>) => void;
}) {
  const geo = useSharedGeolocation();

  return (
    <div className="space-y-4">
      {geo && geo.status !== "unavailable" ? (
        <ul
          aria-label="Where suggestions"
          className="m-0 list-none p-0"
          role="listbox"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={draft.nearby}
              disabled={geo.status === "prompting"}
              onClick={() => {
                geo.request({ autoSort: false });
                setDraft({ location: null, q: "", nearby: true });
              }}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:cursor-wait disabled:opacity-60"
            >
              <span className="text-sm font-medium text-foreground">
                Nearby
              </span>
              <span className="text-sm text-muted-foreground">
                Find what&apos;s around you
              </span>
            </button>
          </li>
        </ul>
      ) : null}
      <label className="block text-sm">
        <span className="sr-only">Search destinations</span>
        <input
          type="search"
          value={draft.q}
          onChange={(event) =>
            setDraft({
              q: event.target.value,
              location: null,
              nearby: false,
            })
          }
          placeholder="City, province or neighborhood"
          className="h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        />
      </label>
    </div>
  );
}

export const SECTIONS: ComposerSection[] = [
  {
    id: "where",
    title: "Where?",
    summary: (draft) =>
      draft.nearby ? "Nearby" : draft.q.trim() || draft.location || "Anywhere",
    render: ({ draft, setDraft }) => (
      <WhereEditor draft={draft} setDraft={setDraft} />
    ),
  },
];
