'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function mergeClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/* ---------- API item shapes (your response) ---------- */
export interface ApiNavLink {
  title: string;
  url: string;
  urlName?: string;
}
export interface ApiNavDropdown extends ApiNavLink {
  children: ApiNavLink[];
}
export type ApiNavItem = ApiNavLink | ApiNavDropdown;

/* ---------- Normalized (with href) ---------- */
type NormalizedLink = ApiNavLink & { href: string };
type NormalizedDropdown = NormalizedLink & { children: NormalizedLink[] };
type NormalizedItem = NormalizedLink | NormalizedDropdown;

/* ---------- Utilities ---------- */
const cleanHref = (href: string) => href.split('#')[0].split('?')[0];

function normalizePath(input: string): string {
  if (!input) return '/';
  let s = input.trim();

  // If it's an absolute URL, take just the pathname
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      s = u.pathname + (u.search ?? '') + (u.hash ?? '');
    } catch {}
  }

  // Strip query/hash for matching
  s = s.split('#')[0].split('?')[0];

  // Remove leading locale prefix: /en, /ar, /en-US, /ar-JO, etc.
  s = s.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '');

  // Collapse multiple slashes
  s = s.replace(/\/{2,}/g, '/');

  // Trailing slash (except root)
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);

  // Ensure leading slash
  if (!s.startsWith('/')) s = '/' + s;

  // Treat /home as /
  if (s === '/home') return '/';

  return s;
}

/* ---------- Type guards ---------- */
function isDropdown(item: ApiNavItem): item is ApiNavDropdown;
function isDropdown(item: NormalizedItem): item is NormalizedDropdown;
function isDropdown(item: any): item is { children: unknown[] } {
  return Array.isArray(item?.children);
}

/* ---------- Title humanizer ---------- */
function displayTitle(raw: string): string {
  if (!raw) return '';
  const looksSluggy = /[-_]/.test(raw) || raw === raw.toLowerCase();
  if (!looksSluggy) return raw;
  const spaced = raw.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = spaced.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/* ---------- Component ---------- */
export default function ClientNavbar({
  items,
  currentPath,
  className,
  stripQuery = true,
}: {
  items: ApiNavItem[];
  currentPath?: string; // optional; falls back to usePathname()
  className?: string;
  stripQuery?: boolean;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pathname = usePathname(); // fallback if currentPath not passed

  // Figma link typography
  const figmaLinkCls = 'font-["Lufga"] text-sm font-medium leading-[100%] tracking-normal'; // 14px, 500

  const normalized: NormalizedItem[] = useMemo(() => {
    const norm = (it: ApiNavLink): NormalizedLink => ({
      ...it,
      href: stripQuery ? cleanHref(it.url) : it.url,
    });

    return items.map((item) => {
      if (isDropdown(item)) {
        return { ...norm(item), children: item.children.map(norm) } as NormalizedDropdown;
      }
      return norm(item) as NormalizedLink;
    });
  }, [items, stripQuery]);

  const rawPath = currentPath ?? pathname ?? '';
  const pathForMatch = normalizePath(stripQuery ? cleanHref(rawPath) : rawPath);

  return (
    <nav className={mergeClasses('flex items-center gap-4', 'pointer-events-auto', className)}>
      {normalized.map((item, i) => {
        const itemMatch = normalizePath(item.href);

        // Child active check first (so dropdown highlights when a child is active)
        const childActive = isDropdown(item)
          ? item.children.some((c) => {
              const cMatch = normalizePath(c.href);
              return pathForMatch === cMatch || (cMatch !== '/' && pathForMatch.startsWith(cMatch));
            })
          : false;

        const selfActive =
          pathForMatch === itemMatch || (itemMatch !== '/' && pathForMatch.startsWith(itemMatch));

        const active = childActive || selfActive;

        // Base uses Figma typography + layout; no underline by default
        const base = mergeClasses(
          'relative px-3 py-2 inline-flex items-center gap-1 transition-colors no-underline',
          figmaLinkCls,
        );

        // Underline ONLY when active
        const decoration = 'decoration-[#010663] decoration-2 underline-offset-4';
        const inactiveColor = 'text-[var(--Text-text-default,#424242)]'; // no hover underline
        const activeColor = mergeClasses('text-[#010663]', 'underline', decoration);
        const activeClasses = active ? activeColor : inactiveColor;

        return (
          <div key={`${item.href}-${i}`} className="relative">
            {isDropdown(item) ? (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openIdx === i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className={mergeClasses(base, activeClasses)}
              >
                {displayTitle(item.title)}
                <svg
                  className={mergeClasses(
                    'h-4 w-4 opacity-70 transition-transform',
                    openIdx === i && 'rotate-180',
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>
            ) : (
              <Link href={item.href} className={mergeClasses(base, activeClasses)}>
                {displayTitle(item.title)}
              </Link>
            )}

            {/* Dropdown */}
            {isDropdown(item) && openIdx === i && (
              <div
                role="menu"
                className={mergeClasses(
                  'absolute top-full left-0 mt-2 min-w-[200px] rounded-xl',
                  'border border-white/20 bg-white/70 backdrop-blur-md backdrop-saturate-150',
                  'shadow-xl z-50 pointer-events-auto',
                  'p-2',
                )}
              >
                {item.children.map((child) => {
                  const cMatch = normalizePath(child.href);
                  const cActive =
                    pathForMatch === cMatch || (cMatch !== '/' && pathForMatch.startsWith(cMatch));
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpenIdx(null)}
                      role="menuitem"
                      className={mergeClasses(
                        'block rounded-lg px-3 py-2 no-underline',
                        figmaLinkCls,
                        cActive
                          ? mergeClasses('text-primary underline', decoration)
                          : 'text-[var(--Text-text-default,#424242)] hover:bg-white/70',
                      )}
                    >
                      {displayTitle(child.title)}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

