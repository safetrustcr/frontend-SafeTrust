"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ApartmentListing, Location } from "@/types/hotel";
import type { Place } from "@/types/destination";
import {
  whereSuggestions,
  type WhereSuggestion,
} from "./where-suggestions";

export interface StaySearch {
  location: Location | null;
  place: string | null;
  q: string;
}

export interface SearchSectionsProps {
  search: StaySearch;
  onChange: (patch: Partial<StaySearch>) => void;
  listings: ApartmentListing[];
  onSubmit?: () => void;
}

function suggestionKey(suggestion: WhereSuggestion, index: number): string {
  if (suggestion.kind === "province") return `province-${suggestion.location}-${index}`;
  if (suggestion.kind === "place") return `place-${suggestion.place.id}-${index}`;
  return `listing-${suggestion.id}-${index}`;
}

export function WhereSection({
  search,
  onChange,
  listings,
  onSubmit,
}: SearchSectionsProps) {
  const [text, setText] = React.useState(search.q);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<number>(-1);
  const listId = React.useId();
  const inputId = React.useId();

  React.useEffect(() => {
    setText(search.q);
  }, [search.q]);

  const suggestions = React.useMemo(
    () => whereSuggestions(text, listings),
    [text, listings],
  );

  const showList = open && text.trim().length > 0;
  const hasResults = suggestions.length > 0;

  const close = React.useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  const clear = React.useCallback(() => {
    setText("");
    onChange({ q: "", place: null });
    close();
  }, [onChange, close]);

  const select = React.useCallback(
    (suggestion: WhereSuggestion) => {
      if (suggestion.kind === "province") {
        setText(suggestion.label);
        onChange({ location: suggestion.location, place: null, q: "" });
      } else if (suggestion.kind === "place") {
        setText(suggestion.label);
        onChange({
          location: suggestion.place.province,
          place: suggestion.place.id,
          q: "",
        });
      } else {
        const listing = listings.find((l) => l.id === suggestion.id);
        setText(suggestion.label);
        onChange({
          location: listing?.location ?? search.location,
          place: listing?.placeId ?? null,
          q: suggestion.label,
        });
      }
      close();
    },
    [listings, onChange, search.location, close],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(hasResults ? 0 : -1);
        return;
      }
      if (!hasResults) return;
      setActive((prev) => (prev + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(hasResults ? suggestions.length - 1 : -1);
        return;
      }
      if (!hasResults) return;
      setActive((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
      return;
    }
    if (event.key === "Enter") {
      if (open && active >= 0 && suggestions[active]) {
        event.preventDefault();
        select(suggestions[active]);
        return;
      }
      onChange({ q: text, place: null });
      close();
      onSubmit?.();
      return;
    }
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        close();
      }
      return;
    }
    if (event.key === "Tab") {
      close();
    }
  };

  return (
    <div className="relative flex flex-col">
      <label htmlFor={inputId} className="text-sm font-medium">
        Where
      </label>
      <input
        id={inputId}
        role="combobox"
        type="text"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && active >= 0 ? `${listId}-${active}` : undefined
        }
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        )}
        placeholder="Try 'Limon' or a neighborhood"
        value={text}
        onFocus={() => setOpen(true)}
        onBlur={() => close()}
        onChange={(event) => {
          setText(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <div
          className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {hasResults ? (
            <ul
              id={listId}
              role="listbox"
              aria-label="Destination suggestions"
              className="max-h-64 overflow-auto py-1"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestionKey(suggestion, index)}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm",
                    index === active && "bg-accent text-accent-foreground",
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    select(suggestion);
                  }}
                  onMouseEnter={() => setActive(index)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>{suggestion.label}</span>
                    {suggestion.kind !== "listing" && (
                      <span className="text-muted-foreground">
                        {suggestion.count} {suggestion.count === 1 ? "stay" : "stays"}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                No places match '{text.trim()}'
              </span>
              <button
                type="button"
                className="text-sm font-medium text-primary underline"
                onMouseDown={(event) => {
                  event.preventDefault();
                  clear();
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}