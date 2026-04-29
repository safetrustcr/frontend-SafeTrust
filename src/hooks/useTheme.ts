'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'safetrust-theme';

const isTheme = (value: string | null): value is Theme =>
  value === 'light' || value === 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      const initial: Theme = isTheme(saved) ? saved : preferred;
      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
    } catch {
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      setTheme(preferred);
      document.documentElement.classList.toggle('dark', preferred === 'dark');
    }
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return { theme, toggle };
}
