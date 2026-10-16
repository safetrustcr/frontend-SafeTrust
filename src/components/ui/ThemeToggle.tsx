"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/hooks/useTheme";

const subscribe = () => () => {};
/** false during SSR and hydration, true after: no mismatch, no setState-in-effect. */
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

// Moon icon (dark mode)
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`h-4 w-4 transition-colors duration-300 ${className ?? ""}`}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

// Sun icon (light mode)
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={`h-4 w-4 transition-colors duration-300 ${className ?? ""}`}
    >
      <circle cx="12" cy="12" r="5" />
      <line
        x1="12"
        y1="1"
        x2="12"
        y2="3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="21"
        x2="12"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="4.22"
        y1="4.22"
        x2="5.64"
        y2="5.64"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="18.36"
        y1="18.36"
        x2="19.78"
        y2="19.78"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1="12"
        x2="3"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="21"
        y1="12"
        x2="23"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="4.22"
        y1="19.78"
        x2="5.64"
        y2="18.36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="18.36"
        y1="5.64"
        x2="19.78"
        y2="4.22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const hydrated = useHydrated();
  const isDark = hydrated && theme === "dark";

  return (
    <div className="inline-flex shrink-0 items-center gap-2 select-none">
      {/* Moon — lights up via dark: variant */}
      <MoonIcon className="text-gray-400 dark:text-white" />

      <button
        type="button"
        onClick={toggle}
        disabled={!hydrated}
        aria-label="Dark mode"
        aria-pressed={hydrated ? isDark : undefined}
        className="relative h-6 w-12 rounded-full bg-gray-300 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-gray-600 disabled:cursor-default"
      >
        <span
          aria-hidden="true"
          className="absolute left-0.5 top-0.5 h-5 w-5 translate-x-6 rounded-full bg-white shadow-md transition-transform duration-300 motion-reduce:transition-none dark:translate-x-0"
        />
      </button>

      {/* Sun — lights up when not dark via dark: variant */}
      <SunIcon className="text-yellow-500 dark:text-gray-400" />
    </div>
  );
}

// Keep default export for backwards compatibility
export default ThemeToggle;
