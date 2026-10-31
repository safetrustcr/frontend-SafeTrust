"use client";

import { useState, useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { fromIsoDate, toIsoDate, addMonths } from "./date-only";
import {
  formatWhenSummary,
  type DateSearch,
  type DateTolerance,
} from "./stay-search";

export interface WhenSectionProps {
  dates: DateSearch;
  today: string;
  months?: 1 | 2;
  onChange: (dates: DateSearch) => void;
  onClear?: () => void;
}

const TOLERANCE_OPTIONS: Array<{ value: DateTolerance; label: string }> = [
  { value: 0, label: "Exact dates" },
  { value: 1, label: "± 1 day" },
  { value: 2, label: "± 2 days" },
];

const STAY_OPTIONS: Array<{
  value: "weekend" | "week" | "month";
  label: string;
}> = [
  { value: "weekend", label: "Weekend" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export function WhenSection({
  dates,
  today,
  months = 1,
  onChange,
  onClear,
}: WhenSectionProps) {
  // Mode selection: "dates" or "flexible"
  const [tab, setTab] = useState<"dates" | "flexible">(() =>
    dates.mode === "flexible" ? "flexible" : "dates",
  );

  // Exact dates state
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(() =>
    dates.mode === "exact"
      ? { from: fromIsoDate(dates.checkIn), to: fromIsoDate(dates.checkOut) }
      : undefined,
  );
  const [tolerance, setTolerance] = useState<DateTolerance>(() =>
    dates.mode === "exact" ? (dates.tolerance ?? 0) : 0,
  );

  // Flexible dates state
  const [flexibleStay, setFlexibleStay] = useState<
    "weekend" | "week" | "month"
  >(() => (dates.mode === "flexible" ? (dates.stay ?? "week") : "week"));
  const [selectedMonths, setSelectedMonths] = useState<string[]>(() =>
    dates.mode === "flexible" ? (dates.months ?? []) : [],
  );

  // Sync external dates prop into internal state
  useEffect(() => {
    if (dates.mode === "exact") {
      setTab("dates");
      setPendingRange({
        from: fromIsoDate(dates.checkIn),
        to: fromIsoDate(dates.checkOut),
      });
      setTolerance(dates.tolerance ?? 0);
    } else if (dates.mode === "flexible") {
      setTab("flexible");
      setFlexibleStay(dates.stay ?? "week");
      setSelectedMonths(dates.months ?? []);
    } else if (tab === "dates") {
      setPendingRange(undefined);
    }
  }, [dates, tab]);

  // Next 12 months starting from today's month
  const next12Months = useMemo(() => {
    const startMonth = today.slice(0, 7);
    return Array.from({ length: 12 }, (_, i) => {
      const isoMonth = addMonths(startMonth, i);
      const [y, m] = isoMonth.split("-").map(Number);
      const date = new Date(Date.UTC(y, m - 1, 1));
      const fullLabel = new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
      const shortMonth = new Intl.DateTimeFormat("en", {
        month: "short",
        timeZone: "UTC",
      }).format(date);
      return {
        isoMonth,
        year: String(y),
        shortMonth,
        fullLabel,
      };
    });
  }, [today]);

  const handleTabChange = (newTab: "dates" | "flexible") => {
    if (newTab === tab) return;
    setTab(newTab);
    if (newTab === "dates") {
      // Switching to dates clears flexible parameters
      if (
        pendingRange?.from &&
        pendingRange?.to &&
        pendingRange.from.getTime() !== pendingRange.to.getTime()
      ) {
        onChange({
          mode: "exact",
          checkIn: toIsoDate(pendingRange.from),
          checkOut: toIsoDate(pendingRange.to),
          tolerance,
        });
      } else {
        onChange({ mode: "any" });
      }
    } else {
      // Switching to flexible clears exact parameters
      if (selectedMonths.length > 0) {
        onChange({
          mode: "flexible",
          stay: flexibleStay,
          months: selectedMonths,
        });
      } else {
        onChange({ mode: "any" });
      }
    }
  };

  const handleSelectRange = (range: DateRange | undefined) => {
    setPendingRange(range);
    if (range?.from && range?.to) {
      if (range.from.getTime() !== range.to.getTime()) {
        onChange({
          mode: "exact",
          checkIn: toIsoDate(range.from),
          checkOut: toIsoDate(range.to),
          tolerance,
        });
      } else {
        onChange({ mode: "any" });
      }
    } else {
      onChange({ mode: "any" });
    }
  };

  const handleToleranceChange = (newTol: DateTolerance) => {
    setTolerance(newTol);
    if (
      pendingRange?.from &&
      pendingRange?.to &&
      pendingRange.from.getTime() !== pendingRange.to.getTime()
    ) {
      onChange({
        mode: "exact",
        checkIn: toIsoDate(pendingRange.from),
        checkOut: toIsoDate(pendingRange.to),
        tolerance: newTol,
      });
    } else if (dates.mode === "exact") {
      onChange({
        ...dates,
        tolerance: newTol,
      });
    }
  };

  const handleStayChange = (newStay: "weekend" | "week" | "month") => {
    setFlexibleStay(newStay);
    if (selectedMonths.length > 0) {
      onChange({
        mode: "flexible",
        stay: newStay,
        months: selectedMonths,
      });
    }
  };

  const handleMonthToggle = (monthIso: string) => {
    const isSelected = selectedMonths.includes(monthIso);
    const newMonths = isSelected
      ? selectedMonths.filter((m) => m !== monthIso)
      : [...selectedMonths, monthIso].sort();

    setSelectedMonths(newMonths);

    if (newMonths.length > 0) {
      onChange({
        mode: "flexible",
        stay: flexibleStay,
        months: newMonths,
      });
    } else {
      onChange({ mode: "any" });
    }
  };

  const handleClear = () => {
    setPendingRange(undefined);
    setSelectedMonths([]);
    setTolerance(0);
    onChange({ mode: "any" });
    onClear?.();
  };

  const hasOnlyCheckIn =
    tab === "dates" && Boolean(pendingRange?.from && !pendingRange?.to);
  const isExactComplete = dates.mode === "exact";
  const hasActiveFilter =
    (tab === "dates" && (pendingRange?.from || isExactComplete)) ||
    (tab === "flexible" &&
      (selectedMonths.length > 0 || dates.mode === "flexible"));

  let summaryText = "Any dates";
  if (tab === "dates") {
    if (hasOnlyCheckIn) {
      summaryText = "Select check-out";
    } else if (isExactComplete) {
      summaryText = formatWhenSummary(dates);
    }
  } else {
    if (selectedMonths.length === 0) {
      summaryText = "Select months";
    } else if (dates.mode === "flexible") {
      summaryText = formatWhenSummary(dates);
    } else {
      summaryText = formatWhenSummary({
        mode: "flexible",
        stay: flexibleStay,
        months: selectedMonths,
      });
    }
  }

  return (
    <div
      className="flex flex-col space-y-4 max-w-full overflow-hidden"
      data-testid="when-section"
    >
      {/* Header with Title, Summary, and Clear button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">When</h3>
          <p
            className="text-xs text-muted-foreground mt-0.5"
            data-testid="when-summary"
          >
            {summaryText}
          </p>
        </div>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors min-h-[44px] inline-flex items-center"
            data-testid="clear-dates-button"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Segmented Control: Dates | Flexible */}
      <div className="flex justify-center w-full">
        <div
          role="radiogroup"
          aria-label="Date selection mode"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full max-w-xs"
        >
          <button
            type="button"
            role="radio"
            aria-checked={tab === "dates"}
            tabIndex={tab === "dates" ? 0 : -1}
            onClick={() => handleTabChange("dates")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all flex-1 min-h-[36px] ${
              tab === "dates"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dates
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={tab === "flexible"}
            tabIndex={tab === "flexible" ? 0 : -1}
            onClick={() => handleTabChange("flexible")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all flex-1 min-h-[36px] ${
              tab === "flexible"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Flexible
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {tab === "dates" ? (
        <div className="space-y-4">
          <div className="flex justify-center w-full overflow-x-auto pb-2">
            <Calendar
              mode="range"
              numberOfMonths={months}
              min={1}
              disabled={{ before: fromIsoDate(today) }}
              selected={pendingRange}
              onSelect={handleSelectRange}
              className="rounded-md border p-3"
            />
          </div>

          {/* Tolerance chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Date tolerance
            </span>
            <div
              role="group"
              aria-label="Date tolerance"
              className="flex flex-wrap items-center gap-2"
            >
              {TOLERANCE_OPTIONS.map((opt) => {
                const isActive = tolerance === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleToleranceChange(opt.value)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5" data-testid="flexible-panel">
          {/* Stay length chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground">
              How long would you like to stay?
            </span>
            <div
              role="group"
              aria-label="Stay length"
              className="flex flex-wrap items-center gap-2"
            >
              {STAY_OPTIONS.map((opt) => {
                const isActive = flexibleStay === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleStayChange(opt.value)}
                    className={`min-h-[44px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Months selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                When do you want to travel?
              </span>
              <span className="text-[11px] text-muted-foreground">
                Choose one or more months
              </span>
            </div>
            <div
              role="group"
              aria-label="Select months"
              className="flex gap-2 overflow-x-auto pb-2 pt-1 max-w-full scrollbar-thin"
            >
              {next12Months.map((m) => {
                const isSelected = selectedMonths.includes(m.isoMonth);
                return (
                  <button
                    key={m.isoMonth}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={m.fullLabel}
                    onClick={() => handleMonthToggle(m.isoMonth)}
                    className={`min-h-[44px] min-w-[80px] p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-sm font-semibold"
                        : "border-border bg-background text-foreground hover:border-muted-foreground/40 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold">
                      {m.shortMonth}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {m.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Demo availability note */}
      <p
        className="text-xs text-muted-foreground"
        data-testid="demo-availability-note"
      >
        Demo availability: confirm dates with the host before booking.
      </p>
    </div>
  );
}
