'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function parseList(env: string | undefined, fallback: string[]): string[] {
  if (!env) return fallback;
  return env
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

function extractCulture(pathname: string, defaultCulture: string): string {
  const m = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/i);
  return (m?.[1] || defaultCulture).toLowerCase();
}

export default function RtlDirection() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    const defaultCulture = (process.env.NEXT_PUBLIC_DEFAULT_CULTURE || 'en').toLowerCase();
    const rtlCultures = parseList(process.env.NEXT_PUBLIC_RTL_CULTURES, ['ar']);

    const culture = extractCulture(pathname, defaultCulture);
    const isRtl = rtlCultures.includes(culture);

    const html = document.documentElement;
    html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    html.setAttribute('lang', culture);
    html.classList.toggle('rtl', isRtl);
    html.classList.toggle('ltr', !isRtl);
    html.style.setProperty('--grad-dir', isRtl ? 'to left' : 'to right');
  }, [pathname]);

  return null;
}

