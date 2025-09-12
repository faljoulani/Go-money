'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import MoonIcon from '../../../../public/icons/moon.svg';

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
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 stroke-white fill-transparent"
        strokeWidth={1.5}
        aria-hidden
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" />
      </svg>
    </button>
  );
}

