"use client";

import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { fromIsoDate, toIsoDate, formatDateRangeSummary } from "./date-only";
import type { DateSearch } from "./stay-search";

export interface WhenSectionProps {
  dates: DateSearch;
  today: string;
  months?: 1 | 2;
  onChange: (dates: DateSearch) => void;
  onClear?: () => void;
}

export function WhenSection({
  dates,
  today,
  months = 1,
  onChange,
  onClear,
}: WhenSectionProps) {
  // Local pending range while only a check-in is picked
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(() =>
    dates.mode === "exact"
      ? { from: fromIsoDate(dates.checkIn), to: fromIsoDate(dates.checkOut) }
      : undefined,
  );

  useEffect(() => {
    if (dates.mode === "exact") {
      setPendingRange({
        from: fromIsoDate(dates.checkIn),
        to: fromIsoDate(dates.checkOut),
      });
    } else {
      setPendingRange(undefined);
    }
  }, [dates]);

  const handleSelect = (range: DateRange | undefined) => {
    setPendingRange(range);
    if (range?.from && range?.to) {
      // Check-out must be after check-in (same-day checkout is impossible)
      if (range.from.getTime() !== range.to.getTime()) {
        onChange({
          mode: "exact",
          checkIn: toIsoDate(range.from),
          checkOut: toIsoDate(range.to),
          tolerance: 0,
        });
      } else {
        onChange({ mode: "any" });
      }
    } else {
      // A half-picked range is never applied
      onChange({ mode: "any" });
    }
  };

  const handleClear = () => {
    setPendingRange(undefined);
    onChange({ mode: "any" });
    onClear?.();
  };

  const hasOnlyCheckIn = Boolean(pendingRange?.from && !pendingRange?.to);
  const isComplete = dates.mode === "exact";

  return (
    <div
      className="flex flex-col space-y-4 max-w-full overflow-hidden"
      data-testid="when-section"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">When</h3>
          <p
            className="text-xs text-muted-foreground mt-0.5"
            data-testid="when-summary"
          >
            {hasOnlyCheckIn
              ? "Select check-out"
              : isComplete
                ? formatDateRangeSummary(dates.checkIn, dates.checkOut)
                : "Any dates"}
          </p>
        </div>
        {(pendingRange?.from || dates.mode === "exact") && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            data-testid="clear-dates-button"
          >
            Clear dates
          </button>
        )}
      </div>

      <div className="flex justify-center w-full overflow-x-auto pb-2">
        <Calendar
          mode="range"
          numberOfMonths={months}
          min={1}
          disabled={{ before: fromIsoDate(today) }}
          selected={pendingRange}
          onSelect={handleSelect}
          className="rounded-md border p-3"
        />
      </div>

      <p
        className="text-xs text-muted-foreground"
        data-testid="demo-availability-note"
      >
        Demo availability: confirm dates with the host before booking.
      </p>
    </div>
  );
}
