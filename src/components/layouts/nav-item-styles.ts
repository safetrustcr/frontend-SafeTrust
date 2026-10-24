import { cn } from "@/lib/utils";

/**
 * Shared dashboard nav item styles.
 *
 * The selected indicator is a `before:` bar that is tied to `aria-current` so
 * the markup stays the source of truth. It only scales when motion is safe;
 * under reduced motion it simply appears.
 */
export const navItemClassName = cn(
  "group relative flex w-full items-center gap-3 rounded-lg p-2",
  "transition-[background-color,color,box-shadow] duration-150 ease-out",
  "before:absolute before:left-0 before:top-1/2 before:h-5 before:w-1",
  "before:-translate-y-1/2 before:scale-y-50 before:rounded-full before:bg-sky-600 before:opacity-0",
  "aria-[current=page]:before:scale-y-100 aria-[current=page]:before:opacity-100",
  "motion-safe:before:transition-[opacity,transform] motion-safe:before:duration-200 motion-safe:before:ease-out",
  "bg-sky-50/70 dark:bg-transparent dark:text-gray-300 dark:before:bg-sky-400",
);

export const navItemHoverClassName = cn(
  "hover:bg-accent hover:text-accent-foreground",
  "light:hover:bg-white/70 light:hover:shadow-sm",
  "dark:hover:bg-accent dark:hover:text-accent-foreground",
);

export const navItemActiveClassName = cn(
  "bg-accent text-accent-foreground ring-1 ring-sky-300",
  "dark:bg-accent dark:text-accent-foreground dark:ring-sky-700",
);
