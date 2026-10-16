"use client";

import { cn } from "@/lib/utils";
import type { Category } from "../filters/useRentFilters";

export function CategoryChip({
  category,
  active,
  onClick,
}: {
  category: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {category}
    </button>
  );
}

export function CategoryFilterRow({
  categories,
  value,
  onChange,
  onToggleCategory,
}: {
  categories: readonly Category[];
  value: Category[];
  onChange: (next: Category[]) => void;
  onToggleCategory?: (category: Category) => void;
}) {
  const toggle = (category: Category) =>
    onToggleCategory
      ? onToggleCategory(category)
      : onChange(
          value.includes(category)
            ? value.filter((item) => item !== category)
            : [...value, category],
        );
  return (
    <div
      role="group"
      aria-label="Who is this stay for?"
      className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto py-1 px-1"
    >
      <CategoryChip
        category="All"
        active={value.length === 0}
        onClick={() => onChange([])}
      />
      {categories.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          active={value.includes(category)}
          onClick={() => toggle(category)}
        />
      ))}
    </div>
  );
}
