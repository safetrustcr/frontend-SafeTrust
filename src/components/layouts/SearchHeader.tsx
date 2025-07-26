'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const SearchHeader = () => {
  const [searchType, setSearchType] = useState('rent');

  return (
    <div className="relative bg-gray-100 rounded-full">
      <div className="absolute left-2 top-1/2 -translate-y-1/2">
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-[90px] h-8 bg-white rounded-full border-0 shadow-sm hover:bg-gray-50">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input
        type="text"
        placeholder="City, province or neighborhood"
        className="w-full pl-[108px] pr-12 h-10 rounded-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm"
      />
      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
    </div>
  );
}; 