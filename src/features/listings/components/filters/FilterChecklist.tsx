"use client";

import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterChecklistProps<T extends string> {
  legend: string;
  options: readonly T[];
  selected: readonly T[];
  counts: Record<string, number>;
  /** Toggle one option; the caller applies it to the latest filters. */
  onToggle: (option: T) => void;
}

/** A checkbox group that shows how many stays each option would give. */
export function FilterChecklist<T extends string>({
  legend,
  options,
  selected,
  counts,
  onToggle,
}: FilterChecklistProps<T>) {
  const id = useId();

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-foreground">
        {legend}
      </legend>
      <ul>
        {options.map((option) => {
          const checked = selected.includes(option);
          const count = counts[option] ?? 0;
          // Never offer a dead end, but always let a choice be undone.
          const disabled = count === 0 && !checked;
          const optionId = `${id}-${option}`;
          return (
            <li key={option}>
              <label
                htmlFor={optionId}
                className={`flex min-h-9 items-center gap-2.5 text-sm ${
                  disabled
                    ? "cursor-not-allowed text-muted-foreground"
                    : "cursor-pointer text-foreground"
                }`}
              >
                <Checkbox
                  id={optionId}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => onToggle(option)}
                  className="rounded-[4px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                {option}
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                  {count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
