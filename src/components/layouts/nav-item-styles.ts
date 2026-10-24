import { cn } from "@/lib/utils";

export const navItemClass = (active: boolean) =>
  cn(
    "group relative flex w-full items-center gap-3 rounded-lg p-2 text-sm transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    active
      ? [
          "bg-nav-active dark:bg-nav-active/30 font-medium text-nav-active-foreground shadow-sm",
          "dark:shadow-none",
          // non-colour cue: a 3px bar on the left edge
          "before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-nav-indicator",
        ]
      : "text-foreground/70 hover:bg-accent hover:text-foreground dark:text-slate-300",
  );

export const navIconClass = (active: boolean) =>
  cn("h-5 w-5 shrink-0", active ? "text-nav-active-icon" : "text-muted-foreground group-hover:text-foreground");
