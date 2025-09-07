'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cleanHref, normalizePath, mergeClasses, displayTitle } from '../../../utils/utils';
import { ApiNavItem, ApiNavLink, ApiNavDropdown } from '../../../types/Type';

/* ---------- Normalized (with href) ---------- */
type NormalizedLink = ApiNavLink & { href: string };
type NormalizedDropdown = NormalizedLink & { children: NormalizedLink[] };
type NormalizedItem = NormalizedLink | NormalizedDropdown;

/* ---------- Local, union-specific guards ---------- */
function isApiDropdown(item: ApiNavItem): item is ApiNavDropdown {
  return Array.isArray((item as any)?.children);
}
/** Guard for the *normalized* union (after normalization) */
function isNormalizedDropdown(item: NormalizedItem): item is NormalizedDropdown {
  return Array.isArray((item as any)?.children);
}

export default function ClientNavbar({
  items,
  currentPath,
  className,
  stripQuery = true,
}: {
  items: ApiNavItem[];
  currentPath?: string;
  className?: string;
  stripQuery?: boolean;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pathname = usePathname();

  const figmaLinkCls = 'font-["Lufga"] text-sm font-medium leading-[100%] tracking-normal';

  const normalized: NormalizedItem[] = useMemo(() => {
    const norm = (it: ApiNavLink): NormalizedLink => ({
      ...it,
      href: stripQuery ? cleanHref(it.url) : it.url,
    });

    return items.map((item) => {
      if (isApiDropdown(item)) {
        return { ...norm(item), children: item.children.map(norm) } as NormalizedDropdown;
      }
      return norm(item) as NormalizedLink;
    });
  }, [items, stripQuery]);

  // Active path (normalize for robust matching)
  const rawPath = currentPath ?? pathname ?? '';
  const pathForMatch = normalizePath(stripQuery ? cleanHref(rawPath) : rawPath);

  return (
    <nav className={mergeClasses('flex items-center gap-4', 'pointer-events-auto', className)}>
      {normalized.map((item, i) => {
        const itemMatch = normalizePath(item.href);
        const childActive = isNormalizedDropdown(item)
          ? item.children.some((c) => {
              const cMatch = normalizePath(c.href);
              return pathForMatch === cMatch || (cMatch !== '/' && pathForMatch.startsWith(cMatch));
            })
          : false;

        const selfActive =
          pathForMatch === itemMatch || (itemMatch !== '/' && pathForMatch.startsWith(itemMatch));

        const active = childActive || selfActive;

        const base = mergeClasses(
          'relative px-3 py-2 inline-flex items-center gap-1 transition-colors no-underline',
          figmaLinkCls,
        );

        const decoration = 'decoration-[#010663] decoration-2 underline-offset-4';
        const inactiveColor = 'text-[var(--Text-text-default,#424242)]';
        const activeColor = mergeClasses('text-[#010663]', 'underline', decoration);
        const activeClasses = active ? activeColor : inactiveColor;

        return (
          <div key={`${item.href}-${i}`} className="relative">
            {isNormalizedDropdown(item) ? (
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
            {isNormalizedDropdown(item) && openIdx === i && (
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

