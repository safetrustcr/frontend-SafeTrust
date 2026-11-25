"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getPlace } from "../data/listings";
import { describeLocations } from "../model/filters";
import type { Listing } from "../model/types";
import type { SearchDraft } from "./composer-types";
import {
  suggestionDraft,
  whereSuggestions,
  type WhereSuggestion,
} from "./where-suggestions";

/** Marks the input while its popup is open, so the composer's Escape skips. */
export const WHERE_POPUP_OPEN = "data-where-popup-open";

/** True when an Escape on `target` should close the Where list, not the composer. */
export const isWherePopupOpen = (target: EventTarget | null) =>
  target instanceof HTMLElement && target.hasAttribute(WHERE_POPUP_OPEN);

const stays = (count: number) => `${count} ${count === 1 ? "stay" : "stays"}`;

/** The text a draft shows in the input when the guest has not typed. */
export function whereText(draft: SearchDraft): string {
  if (draft.q) return draft.q;
  const place = draft.place ? getPlace(draft.place) : undefined;
  if (place) return `${place.name}, ${place.province}`;
  if (draft.location) return draft.location;
  return draft.locations.length > 1 ? describeLocations(draft.locations) : "";
}

const optionKey = (suggestion: WhereSuggestion) =>
  suggestion.kind === "province"
    ? `province-${suggestion.location}`
    : suggestion.kind === "place"
      ? `place-${suggestion.place.id}`
      : `listing-${suggestion.id}`;

/**
 * Where picker: an ARIA 1.2 combobox with a listbox popup (list
 * autocomplete). ↓/↑ move the active option, Enter selects it, Escape closes
 * the list (a second Escape closes the composer), Tab leaves and closes it.
 */
export function WhereCombobox({
  draft,
  setDraft,
  listings,
}: {
  draft: SearchDraft;
  setDraft: (patch: Partial<SearchDraft>) => void;
  /** Listings matching every other criterion; counts come from these. */
  listings: Listing[];
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // What the guest typed. It shows only while it is still the draft's q;
  // otherwise (a choice, Clear all) the input shows the draft's choice.
  const [typed, setTyped] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const value = typed !== null && typed === draft.q ? typed : whereText(draft);
  const needle = draft.q;
  const suggestions = useMemo(
    () => whereSuggestions(needle, listings),
    [needle, listings],
  );
  const empty = suggestions.length === 0;

  const show = () => {
    setOpen(true);
    setActive(-1);
  };
  const choose = (suggestion: WhereSuggestion) => {
    setTyped(null);
    setDraft({ ...suggestionDraft(suggestion), locations: [], nearby: false });
    setOpen(false);
    setActive(-1);
  };
  const clear = () => {
    setTyped("");
    setDraft({
      q: "",
      place: null,
      location: null,
      locations: [],
      nearby: false,
    });
    setActive(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (empty) return show();
        const step = event.key === "ArrowDown" ? 1 : -1;
        const from = open ? active : -1;
        const next =
          from === -1 && step === -1
            ? suggestions.length - 1
            : (from + step + suggestions.length) % suggestions.length;
        setOpen(true);
        setActive(next);
        return;
      }
      case "Enter":
        // Leave the Enter that commits an IME composition to the input.
        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
        if (open && active >= 0 && suggestions[active]) {
          event.preventDefault();
          choose(suggestions[active]);
        }
        return;
      case "Escape":
        // The composer ignores this Escape (see isWherePopupOpen).
        if (open) {
          setOpen(false);
          setActive(-1);
        }
        return;
    }
  };

  const activeId =
    open && active >= 0 && !empty ? `${listId}-${active}` : undefined;

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  return (
    <div
      className="space-y-2"
      // Tab leaves the widget and closes the list; focus moving to the
      // empty state's Clear button keeps it open.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search destinations"
        aria-expanded={open && !empty}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        {...(open ? { [WHERE_POPUP_OPEN]: "" } : {})}
        autoComplete="off"
        spellCheck={false}
        value={value}
        maxLength={80}
        onFocus={show}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onChange={(event) => {
          const text = event.target.value;
          setTyped(text);
          // Free text keeps the province; Search applies it as q.
          setDraft({ q: text, place: null, locations: [], nearby: false });
          setOpen(true);
          setActive(-1);
        }}
        placeholder="Province, neighborhood or stay"
        className="h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <ul
        id={listId}
        ref={listRef}
        role="listbox"
        aria-label="Destination suggestions"
        hidden={!open || empty}
        className="m-0 max-h-80 list-none overflow-y-auto rounded-xl border border-border bg-background p-1"
      >
        {suggestions.map((suggestion, index) => (
          <li
            key={optionKey(suggestion)}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            // Keeps focus in the input. Selection is on click, which is also
            // what screen readers and voice control send.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(suggestion)}
            onMouseMove={() => setActive(index)}
            className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-muted"
          >
            <span className="min-w-0 truncate font-medium text-foreground">
              {suggestion.label}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {suggestion.kind === "listing" ? "Stay" : stays(suggestion.count)}
            </span>
          </li>
        ))}
      </ul>
      {open && empty ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border px-3 py-2 text-sm">
          <p role="status" className="min-w-0 text-muted-foreground">
            No places match &lsquo;{needle.trim()}&rsquo;
          </p>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clear}
            className="min-h-11 shrink-0 rounded-md px-3 font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear
          </button>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {open && !empty
          ? `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"}`
          : ""}
      </p>
    </div>
  );
}
