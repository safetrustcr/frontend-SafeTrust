"use client";

import type { ComposerSection, SearchDraft } from "./composer-types";
import { useSharedGeolocation } from "@/providers/GeolocationProvider";
import { formatDateRangeSummary } from "./date-only";
import type { GuestCounts } from "./stay-search";
import { WhenSection } from "./WhenSection";
import { WhoSection } from "./WhoSection";

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
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
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
          aria-label="Search destinations"
          value={draft.q}
          maxLength={80}
          onChange={(event) =>
            setDraft({
              q: event.target.value,
              location: null,
              nearby: false,
            })
          }
          placeholder="City, province or neighborhood"
          className="h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
    </div>
  );
}

const guestSummary = (guests: GuestCounts) => {
  const party = guests.adults + guests.children;
  if (party === 0 && guests.infants === 0 && guests.pets === 0) {
    return "Add guests";
  }

  const parts: string[] = [];
  if (party > 0) parts.push(`${party} guest${party === 1 ? "" : "s"}`);
  if (guests.infants > 0) {
    parts.push(`${guests.infants} infant${guests.infants === 1 ? "" : "s"}`);
  }
  if (guests.pets > 0) {
    parts.push(`${guests.pets} pet${guests.pets === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
};

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
  {
    id: "when",
    title: "When?",
    summary: (draft) =>
      draft.dates.mode === "exact"
        ? formatDateRangeSummary(draft.dates.checkIn, draft.dates.checkOut)
        : draft.dates.mode === "flexible"
          ? "Flexible dates"
          : "Any dates",
    render: ({ draft, setDraft, today }) => (
      <WhenSection
        dates={draft.dates}
        today={today}
        onChange={(dates) => setDraft({ dates })}
      />
    ),
  },
  {
    id: "who",
    title: "Who?",
    summary: (draft) => guestSummary(draft.guests),
    render: ({ draft, setDraft }) => (
      <WhoSection
        guests={draft.guests}
        onChange={(guests) => setDraft({ guests })}
      />
    ),
  },
];
