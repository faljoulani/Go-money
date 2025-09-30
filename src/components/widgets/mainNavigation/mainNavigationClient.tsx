'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cleanHref, routeMatchKey, displayTitle } from '../../../utils/utils';
import { ApiNavItem, ApiNavDropdown } from '../../../types/typee';
import { useDismissable } from '../../../utils/hooks/useDismissable';

function isDropdown(item: ApiNavItem): item is ApiNavDropdown {
  return Array.isArray((item as any)?.children);
}
const toHref = (url: string, stripQuery: boolean) => (stripQuery ? cleanHref(url) : url);

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
  const navRef = useDismissable<HTMLDivElement>(openIdx !== null, () => setOpenIdx(null));

  useEffect(() => {
    setOpenIdx(null);
  }, [pathname]);

  const rawPath = currentPath ?? pathname ?? '';
  const pathForMatch = routeMatchKey(stripQuery ? cleanHref(rawPath) : rawPath);

  return (
    <nav ref={navRef} className={`flex items-center gap-4 pointer-events-auto ${className || ''}`}>
      {items.map((item, i) => {
        const itemHref = toHref(item.url, stripQuery);
        const itemMatch = routeMatchKey(itemHref);

        const childActive = isDropdown(item)
          ? item.children.some((c) => {
              const cHref = toHref(c.url, stripQuery);
              const cMatch = routeMatchKey(cHref);
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
          <div key={`${itemHref}-${i}`} className="relative">
            {isDropdown(item) ? (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openIdx === i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className={`relative px-3 py-2 inline-flex items-center gap-1 no-underline text-sm font-medium leading-[100%] tracking-normal ${colorClass}`}
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
                href={itemHref}
                className={`relative px-3 py-2 inline-flex items-center gap-1 transition-colors no-underline text-sm font-medium leading-[100%] tracking-normal ${colorClass}`}
              >
                {displayTitle(item.title)}
              </Link>
            )}

            {isDropdown(item) && openIdx === i && (
              <div
                role="menu"
                className="absolute top-full left-0 mt-2 min-w-[200px] rounded-xl border border-white/20 bg-white backdrop-blur-md backdrop-saturate-150 shadow-xl z-50 pointer-events-auto p-2"
              >
                {item.children.map((child) => {
                  const childHref = toHref(child.url, stripQuery);
                  return (
                    <Link
                      key={childHref}
                      href={childHref}
                      onClick={() => setOpenIdx(null)}
                      role="menuitem"
                      className="block rounded-lg px-3 py-2 no-underline text-14px leading-5 text-default hover:bg-[#E6E8FF]"
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

