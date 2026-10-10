"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DashboardReveal } from "@/components/dashboard/ui/DashboardReveal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dateRangePresets } from "@/lib/chart-utils";

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetSelect = (days: number, label: string) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    onChange({ start, end });
    setSelectedPreset(label);
    setIsOpen(false);
  };

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!value) {
      // First date selected
      onChange({ start: date, end: date });
      setSelectedPreset(null);
    } else if (value.start && !value.end) {
      // Second date selected
      const start = value.start < date ? value.start : date;
      const end = value.start < date ? date : value.start;
      onChange({ start, end });
      setSelectedPreset(null);
      setIsOpen(false);
    } else {
      // Reset selection
      onChange({ start: date, end: date });
      setSelectedPreset(null);
    }
  };

  const formatDateRange = (range: DateRange | null) => {
    if (!range) return "Select date range";

    if (range.start.getTime() === range.end.getTime()) {
      return format(range.start, "MMM dd, yyyy");
    }

    return `${format(range.start, "MMM dd")} - ${format(
      range.end,
      "MMM dd, yyyy",
    )}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Select analytics date range"
          className={cn(
            "min-h-11 min-w-0 max-w-full justify-between text-foreground bg-background/50 border-border",
            "hover:bg-muted hover:border-blue-500/30",
            "transition-all duration-300",
            !value && "",
            className,
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span className="truncate">{formatDateRange(value)}</span>
          </div>
          <DashboardReveal>
            <ChevronDown className="w-4 h-4" />
          </DashboardReveal>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-[30rem] max-w-[calc(100vw-2rem)] max-h-[80dvh] overflow-auto p-0 bg-background border-border"
        align="start"
      >
        <DashboardReveal className="flex flex-col sm:flex-row">
          {/* Presets sidebar */}
          <div className="shrink-0 p-3 border-b border-border sm:w-40 sm:border-b-0 sm:border-r">
            <h4 className="text-sm font-medium mb-3 text-foreground">
              Quick Select
            </h4>
            <div className="space-y-1">
              {dateRangePresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-foreground text-left font-normal",
                    "hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300",
                    selectedPreset === preset.label &&
                      "bg-blue-500/20 text-blue-700 dark:text-blue-300",
                  )}
                  onClick={() => handlePresetSelect(preset.days, preset.label)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="min-w-0 flex-1 p-3">
            <Calendar
              mode="single"
              selected={value?.start}
              onSelect={handleCustomDateSelect}
              autoFocus
              className="p-0 pointer-events-auto text-foreground"
            />

            {value && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-sm text-foreground mb-2">Selected Range:</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDateRange(value)}
                </p>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onChange(null)}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DashboardReveal>
      </PopoverContent>
    </Popover>
  );
};
