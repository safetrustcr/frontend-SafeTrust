"use client";

import * as React from "react";
import { format, addDays, differenceInDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
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
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [hoveredDate, setHoveredDate] = React.useState<Date | undefined>();

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
        "MMM dd"
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
                "w-full justify-start text-left font-normal h-12 rounded-3xl border-black/10 shadow-none hover:border-black/20 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                !date && "text-muted-foreground",
                error &&
                  "border-red-500 focus:ring-red-500 focus:border-red-500",
                isLoading && "opacity-50 cursor-not-allowed",
                className
              )}
              disabled={disabled || isLoading}
              aria-label={date ? formatDateRange(date) : placeholder}
              aria-expanded={isOpen}
              aria-haspopup="dialog"
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <CalendarIcon className="mr-3 h-4 w-4 text-blue-600" />
              )}
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {isLoading ? "Loading..." : formatDateRange(date)}
                </span>
                {!isLoading && getNightsText()}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 rounded-3xl border-black/10 shadow-lg"
            align="end"
            side="bottom"
            sideOffset={8}
          >
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-3 text-gray-700">
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
                      className="rounded-2xl border-black/10 shadow-none hover:bg-blue-50 hover:border-blue-200 text-xs"
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
                numberOfMonths={2}
                disabled={isDateDisabled}
                className="rounded-2xl border-0"
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full hover:bg-gray-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                  ),
                  day: cn(
                    "h-8 w-8 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-blue-50 transition-colors"
                  ),
                  day_range_start:
                    "day-range-start bg-blue-600 text-white hover:bg-blue-700",
                  day_range_end:
                    "day-range-end bg-blue-600 text-white hover:bg-blue-700",
                  day_selected:
                    "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                  day_today: "bg-gray-100 text-gray-900 font-semibold",
                  day_outside: "day-outside text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-blue-100 aria-selected:text-blue-900",
                  day_hidden: "invisible",
                }}
                components={{
                  Chevron: ({ orientation, className, ...props }) => {
                    const Icon =
                      orientation === "left" ? ChevronLeft : ChevronRight;
                    return (
                      <Icon className={cn("h-4 w-4", className)} {...props} />
                    );
                  },
                }}
              />

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
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
  }
);

CustomDateRangePicker.displayName = "CustomDateRangePicker";

export { CustomDateRangePicker };
export type { CustomDateRangePickerProps };
