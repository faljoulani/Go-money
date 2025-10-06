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
const normalizeUrl = (url: string, stripQuery: boolean) => {
  if (!url) return '/';
  const cleaned = stripQuery ? cleanHref(url) : url;
  return routeMatchKey(cleaned);
};

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
  console.log('tems--->', items);

  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pathname = usePathname();
  const navRef = useDismissable<HTMLDivElement>(openIdx !== null, () => setOpenIdx(null));

  useEffect(() => {
    setOpenIdx(null);
  }, [pathname]);

  const rawPath = currentPath ?? pathname ?? '';
  const currentMatch = normalizeUrl(rawPath, stripQuery);

  const isActivePath = (href: string) => {
    const target = normalizeUrl(href, stripQuery);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[MainNavigation] compare:', { href, target, currentMatch });
    }
    if (target === '/') return currentMatch === '/';
    return currentMatch === target || currentMatch.startsWith(`${target}/`);
  };

  return (
    <nav ref={navRef} className={`flex items-center gap-4 pointer-events-auto ${className || ''}`}>
      {items.map((item, i) => {
        const itemHref = normalizeUrl(item.url, false);

        let itemUrl: string;
        try {
          const parsed = JSON.parse(item.url);
          itemUrl = Array.isArray(parsed) && parsed[0]?.href ? parsed[0].href : item.url;
        } catch {
          itemUrl = item.url;
        }
        console.log('itemUrl------>', itemUrl);

        const selfActive = isActivePath(item.url);
        const childActive = isDropdown(item) && item.children.some((c) => isActivePath(c.url));
        const active = selfActive || childActive;

        const colorClass = scrolled
          ? active
            ? 'text-primaryAlt'
            : 'text-default'
          : active
            ? 'text-white'
            : 'text-[#E0E0E0]';
        const underlineClass = active
          ? 'after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-[70%] after:-translate-x-1/2 after:rounded-full after:bg-current after:content-[""]'
          : '';

        return (
          <div key={`${itemHref}-${i}`} className="relative">
            {isDropdown(item) ? (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openIdx === i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className={`relative px-3 py-2 inline-flex items-center gap-1 no-underline text-sm font-medium leading-[100%] tracking-normal ${colorClass} ${underlineClass}`}
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
                href={itemUrl}
                className={`relative px-3 py-2 inline-flex items-center gap-1 transition-colors no-underline text-sm font-medium leading-[100%] tracking-normal ${colorClass} ${underlineClass}`}
              >
                {displayTitle(item.title)}
              </Link>
            )}

            {isDropdown(item) && openIdx === i && (
              <div
                role="menu"
                className="absolute top-full left-0 mt-2 min-w-[200px] rounded-xl border border-white/20 bg-secondary backdrop-blur-md backdrop-saturate-150 shadow-xl z-50 pointer-events-auto p-2"
              >
                {item.children.map((child) => {
                  const childHref = stripQuery ? cleanHref(child.url || '/') : child.url || '/';
                  const childIsActive = isActivePath(child.url);

                  return (
                    <Link
                      key={childHref}
                      href={childHref}
                      onClick={() => setOpenIdx(null)}
                      role="menuitem"
                      className={`block rounded-lg px-3 py-2 no-underline text-default text-14px leading-5 transition-colors hover:text-[#000] hover:bg-[#E6E8FF] dark:hover:bg-[#A6EFD9]`}
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

