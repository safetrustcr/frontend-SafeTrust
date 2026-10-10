"use client";

import { useTheme as useNextTheme } from "next-themes";

/** Keep the header toggle and glass surfaces on the same theme state. */
export function useTheme() {
  const { resolvedTheme, setTheme } = useNextTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  return {
    theme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
