"use client";

import * as React from "react";
import { normalizeSearchText } from "@/lib/text";
import type { ApartmentListing } from "@/types/hotel";
import type { Place } from "@/types/destination";
import { DEMO_PLACES } from "@/lib/mockData/places";
import { whereSuggestions } from "./where-suggestions";

export interface StaySearch {
  location: ApartmentListing["location"] | null;
  place: string | null;
  q: string;
}

export interface SearchSectionProps {
  draft: StaySearch;
  onChange: (patch: Partial<StaySearch>) => void;
  listings: ApartmentListing[];
  onSearch?: () => void;
}

export function ParseStaySearch(params: URLSearchParams): StaySearch {
  const location = params.get("location");
  const place = params.get("place");
  const q = params.get("q") ?? "";

  const matchedLocation = DEMO_PLACES.find((p) => p.province === location);
  const matchedPlace = place ? DEMO_PLACES.find((p) => p.id === place) : undefined;

  if (matchedPlace && matchedPlace.province !== location) {
    return { location: (location as ApartmentListing["location"]) ?? null, place: null, q };
  }

  return {
    location: (location as ApartmentListing["location"]) ?? null,
    place: matchedPlace ? matchedPlace.id : null,
    q,
  };
}

export function applyStaySearch(
  listings: ApartmentListing[],
  search: StaySearch,
): ApartmentListing[] {
  const needle = normalizeSearchText(search.q);

  return listings.filter((listing) => {
    if (search.location && listing.location !== search.location) return false;
    if (search.place !== null && listing.placeId !== search.place) return false;
    if (!needle) return true;
    return (
      normalizeSearchText(listing.name).includes(needle) ||
      normalizeSearchText(listing.address).includes(needle)
    );
  });
}

export function WhereSection({ draft, onChange, listings, onSearch }: SearchSectionProps) {
  const [listId] = React.useState(() => `where-${Math.random().toString(36).slice(2, 9)}`);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [inputValue, setInputValue] = React.useState(draft.q);

  const suggestions = React.useMemo(
    () => whereSuggestions(inputValue, listings),
    [inputValue, listings],
  );

  React.useEffect(() => {
    setInputValue(draft.q);
  }, [draft.q]);

  const chooseProvince = (location: ApartmentListing["location"]) => {
    onChange({ location, place: null, q: "" });
    setInputValue("");
    setOpen(false);
  };

  const choosePlace = (place: Place) => {
    onChange({ location: place.province, place: place.id, q: "" });
    setInputValue("");
    setOpen(false);
  };

  const chooseListing = (listing: ApartmentListing) => {
    onChange({
      location: listing.location,
      place: listing.placeId ?? null,
      q: listing.name,
    });
    setInputValue(listing.name);
    setOpen(false);
  };

  const commitSelection = (index: number) => {
    const suggestion = suggestions[index];
    if (!suggestion) return;
    if (suggestion.kind === "province") chooseProvince(suggestion.location);
    else if (suggestion.kind === "place") choosePlace(suggestion.place);
    else {
      const listing = listings.find((l) => l.id === suggestion.id);
      if (listing) chooseListing(listing);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      if (open && suggestions.length > 0) {
        event.preventDefault();
        commitSelection(active);
      } else {
        onChange({ q: inputValue });
        onSearch?.();
      }
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
    }
  };

  const clear = () => {
    onChange({ location: null, place: null, q: "" });
    setInputValue("");
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={listId}>
        Where
      </label>
      <div className="relative">
        <input
          id={listId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && suggestions.length > 0 ? `${listId}-${active}` : undefined}
          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Search by province, neighborhood or listing"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Destination suggestions"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover p-1 text-sm shadow-md"
          >
            {suggestions.length === 0 ? (
              <li className="flex items-center justify-between gap-2 px-2 py-1.5 text-muted-foreground">
                <span>No places match &lsquo;{inputValue}&rsquo;</span>
                <button
                  type="button"
                  className="text-xs font-medium text-primary underline"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    clear();
                  }}
                >
                  Clear
                </button>
              </li>
            ) : (
              suggestions.map((s, i) => (
                <li
                  key={`${s.kind}-${s.kind === "listing" ? s.id : i}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5${i === active ? " bg-accent text-accent-foreground" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitSelection(i);
                  }}
                >
                  <span>{s.label}</span>
                  {"count" in s && (
                    <span className="text-muted-foreground">{s.count} places</span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
