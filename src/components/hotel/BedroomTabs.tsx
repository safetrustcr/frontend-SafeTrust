'use client';

import { cn } from '@/lib/utils';
import { BEDROOM_FILTERS } from '@/mockData/hotels';

interface BedroomTabsProps {
  selected: string;
  onSelect: (value: string) => void;
}

export default function BedroomTabs({ selected, onSelect }: BedroomTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {BEDROOM_FILTERS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onSelect(tab.value)}
          className={cn(
            'rounded-[10px] border px-6 py-3 text-sm font-medium transition',
            selected === tab.value
              ? 'border-[#d9d9d9] bg-[#f7f4f0] text-[#333333]'
              : 'border-[#e2e2e2] bg-white text-[#575757] hover:border-[#d0d0d0]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
