import { cn } from "@/lib/utils";

/** Shared item style for the main and profile sidebars (TH-01 nav tokens). */
export const navItemClass = (active: boolean) =>
  cn(
    "group relative flex w-full items-center gap-3 rounded-lg p-2 text-sm transition-colors duration-150",
    // outline-none is a transparent outline in Tailwind 3, so forced-colors still shows focus
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    active
      ? [
          "bg-nav-active font-medium text-nav-active-foreground shadow-sm",
          "dark:shadow-none",
          // non-colour cue: a 3px bar on the left edge
          "before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-nav-indicator",
          "forced-colors:before:bg-[Highlight]",
        ]
      : "text-foreground/70 hover:bg-nav-hover hover:text-nav-hover-foreground dark:text-slate-300",
  );

export const navIconClass = (active: boolean) =>
  cn(
    "h-5 w-5 shrink-0",
    active
      ? "text-nav-active-icon"
      : "text-muted-foreground group-hover:text-nav-hover-foreground",
  );
