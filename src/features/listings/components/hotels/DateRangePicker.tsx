"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { format, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Calendar = dynamic(
  () => import("@/components/ui/calendar").then((module) => module.Calendar),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[284px] w-[552px] animate-pulse rounded-md bg-muted"
        role="status"
        aria-label="Loading calendar"
      />
    ),
  },
);

interface DateRangePickerProps {
  id?: string;
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}

function formatRange(range?: DateRange) {
  if (!range?.from) return null;
  const from = format(range.from, "MMM d");
  return range.to ? `${from} – ${format(range.to, "MMM d")}` : from;
}

export function DateRangePicker({ id, value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const label = formatRange(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal md:w-60",
            !label && "text-muted-foreground",
          )}
        >
          <CalendarIcon aria-hidden="true" className="mr-2 h-4 w-4" />
          {label ?? <span>Pick dates</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {open && (
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            defaultMonth={value?.from}
            numberOfMonths={2}
            disabled={{ before: startOfDay(new Date()) }}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
