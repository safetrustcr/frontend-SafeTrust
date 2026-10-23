"use client";

import { APARTMENT_LOCATIONS } from "@/lib/mockData/apartmentListings";
import { formatDateRangeSummary } from "./date-only";
import type { ComposerSection } from "./composer-types";
import type { GuestCounts } from "./stay-search";
import { WhenSection } from "./WhenSection";
import { WhoSection } from "./WhoSection";

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
      draft.nearby ? "Nearby" : draft.q || draft.location || "Anywhere",
    render: ({ draft, setDraft }) => (
      <div className="space-y-4">
        <label className="block space-y-1 text-sm font-medium">
          Search
          <input
            type="search"
            value={draft.q}
            maxLength={80}
            onChange={(event) => setDraft({ q: event.target.value })}
            className="min-h-11 w-full rounded-md border border-input bg-background px-3"
            placeholder="Name or neighborhood"
          />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          Location
          <select
            value={draft.location ?? ""}
            onChange={(event) =>
              setDraft({
                location:
                  APARTMENT_LOCATIONS.find(
                    (location) => location === event.target.value,
                  ) ?? null,
              })
            }
            className="min-h-11 w-full rounded-md border border-input bg-background px-3"
          >
            <option value="">Anywhere</option>
            {APARTMENT_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.nearby}
            onChange={(event) => setDraft({ nearby: event.target.checked })}
          />
          Search near me
        </label>
      </div>
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

export const SEARCH_SECTIONS = {
  when: {
    id: "when" as const,
    label: "When",
    component: WhenSection,
  },
};
