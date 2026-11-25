"use client";

import { useEffect, useRef, useState } from "react";
import { formatListingPrice } from "../../model/price";
import { PRICE_BOUNDS } from "../../model/filters";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  /** Listings per equal-width price bin, across `PRICE_BOUNDS`. */
  histogram: number[];
  onChange: (range: { minPrice: number; maxPrice: number }) => void;
}

const COMMIT_DELAY_MS = 150;

const span = PRICE_BOUNDS.max - PRICE_BOUNDS.min;
const percent = (value: number) => ((value - PRICE_BOUNDS.min) / span) * 100;

/**
 * Two native range inputs on one rail, over the spread of listing prices. The
 * handles move on local state and commit once they settle: the filters live in
 * the URL, which updates too slowly for a handle to follow the pointer.
 */
export function PriceRangeSlider({
  min: committedMin,
  max: committedMax,
  histogram,
  onChange,
}: PriceRangeSliderProps) {
  const [{ min, max }, setDraft] = useState({
    min: committedMin,
    max: committedMax,
  });
  const pendingCommit = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The timer commits through the latest onChange, so it builds on the latest
  // filters instead of the ones from when the handle started moving.
  const latestOnChange = useRef(onChange);
  useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);

  // The URL wins when it changes for another reason, like Clear all or Back.
  useEffect(() => {
    if (pendingCommit.current === null) {
      setDraft({ min: committedMin, max: committedMax });
    }
  }, [committedMin, committedMax]);

  useEffect(
    () => () => {
      if (pendingCommit.current !== null) clearTimeout(pendingCommit.current);
    },
    [],
  );

  const move = (next: { min: number; max: number }) => {
    setDraft(next);
    if (pendingCommit.current !== null) clearTimeout(pendingCommit.current);
    pendingCommit.current = setTimeout(() => {
      pendingCommit.current = null;
      latestOnChange.current({ minPrice: next.min, maxPrice: next.max });
    }, COMMIT_DELAY_MS);
  };

  const tallest = Math.max(...histogram, 1);
  const binWidth = span / histogram.length;

  return (
    <div data-vaul-no-drag="">
      <p className="mb-3 mt-1 text-sm text-muted-foreground">
        {formatListingPrice(min)} – {formatListingPrice(max)} per night
      </p>
      <div aria-hidden="true" className="flex h-12 items-end gap-0.5">
        {histogram.map((count, index) => {
          const binStart = PRICE_BOUNDS.min + index * binWidth;
          const inRange = binStart + binWidth > min && binStart <= max;
          return (
            <span
              key={binStart}
              data-testid="price-histogram-bar"
              style={{
                height: count ? `${(count / tallest) * 100}%` : undefined,
              }}
              className={`min-h-0.5 flex-1 rounded-t-sm ${
                inRange ? "bg-primary/40" : "bg-muted"
              }`}
            />
          );
        })}
      </div>

      <div className="relative h-6 touch-pan-y">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{
            left: `${percent(min)}%`,
            right: `${100 - percent(max)}%`,
          }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          aria-valuetext={formatListingPrice(min)}
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={PRICE_BOUNDS.step}
          value={min}
          onChange={(event) => {
            const value = Number(event.target.value);
            // Overlapping handles: moving right raises the maximum instead.
            move(
              min === max && value > max
                ? { min, max: value }
                : { min: Math.min(value, max), max },
            );
          }}
          className="price-range-input"
        />
        <input
          type="range"
          aria-label="Maximum price"
          aria-valuetext={formatListingPrice(max)}
          min={PRICE_BOUNDS.min}
          max={PRICE_BOUNDS.max}
          step={PRICE_BOUNDS.step}
          value={max}
          onChange={(event) => {
            const value = Number(event.target.value);
            // Overlapping handles: this one is on top, so moving left lowers
            // the minimum. Otherwise the minimum could not be reached.
            move(
              min === max && value < min
                ? { min: value, max }
                : { min, max: Math.max(value, min) },
            );
          }}
          className="price-range-input"
        />
      </div>
    </div>
  );
}
