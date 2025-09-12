'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cleanHref, normalizePath, displayTitle } from '../../../utils/utils';
import { ApiNavItem, ApiNavLink, ApiNavDropdown } from '../../../types/Type';

type NormalizedLink = ApiNavLink & { href: string };
type NormalizedDropdown = NormalizedLink & { children: NormalizedLink[] };
type NormalizedItem = NormalizedLink | NormalizedDropdown;

function isApiDropdown(item: ApiNavItem): item is ApiNavDropdown {
  return Array.isArray((item as any)?.children);
}
function isNormalizedDropdown(item: NormalizedItem): item is NormalizedDropdown {
  return Array.isArray((item as any)?.children);
}

export default function ClientNavbar({
  items,
  currentPath,
  className,
  stripQuery = true,
  scrolled = false,
}: {
  items: ApiNavItem[];
  currentPath?: string;
  className?: string;
  stripQuery?: boolean;
  scrolled?: boolean;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pathname = usePathname();

  const normalized: NormalizedItem[] = useMemo(() => {
    const norm = (it: ApiNavLink): NormalizedLink => ({
      ...it,
      href: stripQuery ? cleanHref(it.url) : it.url,
    });
    return items.map((item) =>
      isApiDropdown(item)
        ? ({ ...norm(item), children: item.children.map(norm) } as NormalizedDropdown)
        : norm(item),
    );
  }, [items, stripQuery]);

  const rawPath = currentPath ?? pathname ?? '';
  const pathForMatch = normalizePath(stripQuery ? cleanHref(rawPath) : rawPath);

  return (
    <nav className={`flex items-center gap-4 pointer-events-auto ${className || ''}`}>
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

        const colorClass = active
          ? scrolled
            ? 'text-[var(--Text-text-primary,hsla(237,98%,20%,1))]'
            : 'text-white'
          : scrolled
            ? 'text-black'
            : 'text-white';

        return (
          <div key={`${item.href}-${i}`} className="relative">
            {isNormalizedDropdown(item) ? (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openIdx === i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className={`relative px-3 py-2 inline-flex items-center gap-1 no-underline font-["Lufga"] text-sm font-medium leading-[100%] tracking-normal ${colorClass}`}
              >
                {displayTitle(item.title)}
                <svg
                  className={`h-4 w-4 opacity-70 transition-transform ${openIdx === i ? 'rotate-180' : ''}`}
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
              <Link
                href={item.href}
                className={`relative px-3 py-2 inline-flex items-center gap-1 transition-colors no-underline font-["Lufga"] text-sm font-medium leading-[100%] tracking-normal ${colorClass}`}
              >
                {displayTitle(item.title)}
              </Link>
            )}

            {isNormalizedDropdown(item) && openIdx === i && (
              <div
                role="menu"
                className="absolute top-full left-0 mt-2 min-w-[200px] rounded-xl border border-white/20 bg-white backdrop-blur-md backdrop-saturate-150 shadow-xl z-50 pointer-events-auto p-2"
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
                      className={`block rounded-lg px-3 py-2 no-underline font-["Lufga"] text-sm font-medium leading-[100%] tracking-normal ${'text-[var(--Text-text-default,#424242)] hover:bg-[#E6E8FF]'}`}
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

