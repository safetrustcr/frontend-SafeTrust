'use client';

import { cn } from '@/lib/utils';
import { BEDROOM_FILTERS } from '@/lib/mockData/hotels';

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
              ? 'border dark:border-slate-700 bg-orange-50 dark:bg-slate-800 text-gray-900 dark:text-white'
              : 'border dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
