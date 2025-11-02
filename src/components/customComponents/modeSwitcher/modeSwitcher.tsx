'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function ModeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center p-2 transition dark:hover:bg-neutral-700"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 fill-transparent stroke-primary dark:stroke-white md:stroke-current"
        strokeWidth={1.5}
        aria-hidden
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" />
      </svg>
    </button>
  );
}

