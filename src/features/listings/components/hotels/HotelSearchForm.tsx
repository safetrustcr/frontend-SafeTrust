"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseISO } from "date-fns";
import { Search } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hotelSearchHref, type HotelSearch } from "../../model/hotel-search";
import { toIsoDate } from "../../search/date-only";
import DateRangePicker from "./DateRangePicker";

function initialRange(initial?: HotelSearch): DateRange | undefined {
  if (!initial?.from || !initial.to) return undefined;
  return { from: parseISO(initial.from), to: parseISO(initial.to) };
}

interface HotelSearchFormProps {
  initial?: HotelSearch;
}

export function HotelSearchForm({ initial }: HotelSearchFormProps) {
  const router = useRouter();
  const [where, setWhere] = useState(initial?.where ?? "");
  const [range, setRange] = useState<DateRange | undefined>(() =>
    initialRange(initial),
  );

  return (
    <form
      role="search"
      aria-label="Hotel search"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(
          hotelSearchHref({
            where,
            from: range?.from ? toIsoDate(range.from) : null,
            to: range?.to ? toIsoDate(range.to) : null,
          }),
        );
      }}
      className="flex flex-col gap-4 md:flex-row md:items-end"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="hotel-dates">Dates</Label>
        <DateRangePicker id="hotel-dates" value={range} onChange={setRange} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Label htmlFor="hotel-where">Where to</Label>
        <Input
          id="hotel-where"
          value={where}
          onChange={(event) => setWhere(event.target.value)}
          placeholder="City or neighbourhood"
          maxLength={80}
        />
      </div>
      <Button type="submit" className="w-full md:w-auto">
        <Search aria-hidden="true" className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
}

export default HotelSearchForm;
