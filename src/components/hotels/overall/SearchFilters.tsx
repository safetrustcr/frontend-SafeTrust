"use client";

import { Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchFilters() {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex flex-col">
        <label className="text-sm text-gray-500 mb-1">Date</label>
        <div className="flex items-center">
          <Select defaultValue="jul-12-14">
            <SelectTrigger className="w-[240px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jul-12-14">Jul 12 - Jul 14</SelectItem>
              <SelectItem value="jul-15-17">Jul 15 - Jul 17</SelectItem>
              <SelectItem value="jul-18-20">Jul 18 - Jul 20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-gray-500 mb-1">Where to</label>
        <div className="flex items-center">
          <Input
            className="w-[240px]"
            placeholder="City, place, see points"
            defaultValue="City, place, see points"
          />
        </div>
      </div>

      <div className="flex items-end">
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
}
