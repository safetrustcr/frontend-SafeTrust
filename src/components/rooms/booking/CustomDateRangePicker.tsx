"use client";

import * as React from "react";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomDateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  minNights?: number;
  maxNights?: number;
  isLoading?: boolean;
  error?: string;
}

const CustomDateRangePicker = React.forwardRef<
  HTMLButtonElement,
  CustomDateRangePickerProps
>(
  (
    {
      date,
      onDateChange,
      disabled,
      placeholder = "Select your dates",
      className,
      minNights = 1,
      maxNights = 30,
      isLoading = false,
      error,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [numberOfMonths, setNumberOfMonths] = React.useState(1);

    React.useEffect(() => {
      const media = window.matchMedia("(min-width: 768px)");
      const updateMonths = () => setNumberOfMonths(media.matches ? 2 : 1);
      updateMonths();
      media.addEventListener("change", updateMonths);
      return () => media.removeEventListener("change", updateMonths);
    }, []);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        if (event.key === "Escape") {
          setIsOpen(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const formatDateRange = (dateRange: DateRange | undefined) => {
      if (!dateRange?.from) {
        return placeholder;
      }

      if (!dateRange.to) {
        return format(dateRange.from, "MMM dd");
      }

      const nights = differenceInDays(dateRange.to, dateRange.from);
      return `${format(dateRange.from, "MMM dd")} - ${format(
        dateRange.to,
        "MMM dd",
      )} (${nights} night${nights !== 1 ? "s" : ""})`;
    };

    const handleDateSelect = (selectedDate: DateRange | undefined) => {
      if (!selectedDate?.from || !selectedDate?.to) {
        onDateChange?.(selectedDate);
        return;
      }

      const nights = differenceInDays(selectedDate.to, selectedDate.from);

      if (nights < minNights) {
        const adjustedEndDate = addDays(selectedDate.from, minNights);
        const adjustedRange: DateRange = {
          from: selectedDate.from,
          to: adjustedEndDate,
        };
        onDateChange?.(adjustedRange);
        setIsOpen(false);
        return;
      }

      if (nights > maxNights) {
        const adjustedEndDate = addDays(selectedDate.from, maxNights);
        const adjustedRange: DateRange = {
          from: selectedDate.from,
          to: adjustedEndDate,
        };
        onDateChange?.(adjustedRange);
        setIsOpen(false);
        return;
      }

      onDateChange?.(selectedDate);

      setIsOpen(false);
    };

    const handleQuickSelect = (days: number) => {
      const today = new Date();
      const endDate = addDays(today, days);
      const range: DateRange = {
        from: today,
        to: endDate,
      };
      onDateChange?.(range);
      setIsOpen(false);
    };

    const isDateDisabled = (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    };

    const getNightsText = () => {
      if (!date?.from || !date?.to) return null;
      const nights = differenceInDays(date.to, date.from);
      return (
        <div className="text-xs text-muted-foreground mt-1">
          {nights} night{nights !== 1 ? "s" : ""} selected
        </div>
      );
    };

    return (
      <div className="space-y-2">
        {error && (
          <div className="text-xs text-red-600 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              className={cn(
                "h-auto min-h-12 w-full min-w-0 justify-start rounded-3xl border-border text-left font-normal shadow-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                !date && "text-muted-foreground",
                error &&
                  "border-red-500 focus:ring-red-500 focus:border-red-500",
                isLoading && "opacity-50 cursor-not-allowed",
                className,
              )}
              disabled={disabled || isLoading}
              aria-label={date ? formatDateRange(date) : placeholder}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary" />
              ) : (
                <CalendarIcon className="mr-3 h-4 w-4 text-primary" />
              )}
              <div className="flex min-w-0 flex-col items-start">
                <span className="whitespace-normal text-sm font-medium">
                  {isLoading ? "Loading..." : formatDateRange(date)}
                </span>
                {!isLoading && getNightsText()}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="max-h-[var(--radix-popover-content-available-height)] w-[calc(100vw-2rem)] max-w-[20rem] overflow-y-auto rounded-2xl border-border p-0 shadow-lg md:w-[38rem] md:max-w-[calc(100vw-2rem)]"
            align="start"
            side="bottom"
            sideOffset={8}
            collisionPadding={16}
            aria-label="Choose rental dates"
          >
            <div className="p-3 sm:p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-3 text-foreground">
                  Quick Select
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "1 Night", days: 1 },
                    { label: "2 Nights", days: 2 },
                    { label: "3 Nights", days: 3 },
                    { label: "1 Week", days: 7 },
                  ].map((option) => (
                    <Button
                      key={option.days}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSelect(option.days)}
                      className="min-h-9 rounded-2xl border-border text-xs shadow-none hover:bg-accent"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={numberOfMonths}
                disabled={isDateDisabled}
                className="w-full rounded-2xl border-0 p-0"
                classNames={{
                  months: "relative grid grid-cols-1 gap-4 md:grid-cols-2",
                  month: "min-w-0 space-y-3",
                }}
              />

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span>
                    Minimum stay: {minNights} night{minNights !== 1 ? "s" : ""}
                  </span>
                  <span>Maximum stay: {maxNights} nights</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

CustomDateRangePicker.displayName = "CustomDateRangePicker";

export { CustomDateRangePicker };
export default CustomDateRangePicker;
export type { CustomDateRangePickerProps };
