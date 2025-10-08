'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cleanHref, routeMatchKey, displayTitle } from '../../../utils/utils';
import { ApiNavItem, ApiNavDropdown } from '../../../types/typee';
import { useDismissable } from '../../../utils/hooks/useDismissable';

function isDropdown(item: ApiNavItem): item is ApiNavDropdown {
  return Array.isArray((item as any)?.children);
}

function resolveItemUrl(raw: string | null | undefined): string {
  if (!raw) return '/';
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed[0]?.href) return parsed[0].href as string;
  } catch {
  }
  return raw;
}

function normalizeUrl(url: string, stripQuery: boolean) {
  const cleaned = stripQuery ? cleanHref(url) : url;
  return routeMatchKey(cleaned || '/');
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
  const navRef = useDismissable<HTMLDivElement>(openIdx !== null, () => setOpenIdx(null));

  useEffect(() => {
    setOpenIdx(null);
  }, [pathname]);

  const currentMatch = useMemo(() => {
    const raw = currentPath ?? pathname ?? '/';
    return normalizeUrl(raw, stripQuery);
  }, [currentPath, pathname, stripQuery]);

  const isActivePath = (href: string) => {
    const target = normalizeUrl(href, stripQuery);
    if (target === '/') return currentMatch === '/';
    return currentMatch === target || currentMatch.startsWith(`${target}/`);
  };

  const baseTopItem =
    'relative px-3 py-2 inline-flex items-center gap-1 transition-colors no-underline text-sm font-medium leading-[100%] tracking-normal';
  const activeTopColor = scrolled ? 'text-primaryAlt' : 'text-white';
  const idleTopColor = scrolled ? 'text-default' : 'text-[#E0E0E0]';

  const underlineActive =
    'after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-[10px] after:-translate-x-1/2 after:rounded-full after:bg-current after:content-[""]';

  return (
    <nav ref={navRef} className={`flex items-center gap-4 pointer-events-auto ${className || ''}`}>
      {items.map((item, i) => {
        const resolvedUrl = resolveItemUrl(item.url);
        const normalizedForKey = normalizeUrl(resolvedUrl, false); // key only
        const selfActive = isActivePath(resolvedUrl);
        const childActive = isDropdown(item) && item.children.some((c) => isActivePath(resolveItemUrl(c.url)));
        const active = selfActive || childActive;

        return (
          <div key={`${normalizedForKey}-${i}`} className="relative">
            {isDropdown(item) ? (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openIdx === i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                data-active={active ? 'true' : 'false'}
                className={[
                  baseTopItem,
                  active ? activeTopColor : idleTopColor,
                  active ? underlineActive : '',
                ].join(' ')}
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
                href={resolvedUrl}
                aria-current={selfActive ? 'page' : undefined}
                data-active={selfActive ? 'true' : 'false'}
                className={[
                  baseTopItem,
                  selfActive ? activeTopColor : idleTopColor,
                  selfActive ? underlineActive : '',
                ].join(' ')}
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
                  const childResolved = resolveItemUrl(child.url);
                  const childHref = stripQuery ? cleanHref(childResolved || '/') : (childResolved || '/');
                  const childIsActive = isActivePath(childResolved);

                  return (
                    <Link
                      key={childHref}
                      href={childHref}
                      onClick={() => setOpenIdx(null)}
                      role="menuitem"
                      aria-current={childIsActive ? 'page' : undefined}
                      data-active={childIsActive ? 'true' : 'false'}
                      className={[
                        'block rounded-lg px-3 py-2 no-underline text-14px leading-5 transition-colors',
                        childIsActive
                          ? 'text-[#000] bg-[#E6E8FF] dark:text-white dark:bg-primary/30'
                          : 'text-default hover:text-[#000] hover:bg-[#E6E8FF] dark:hover:bg-[#A6EFD9]',
                      ].join(' ')}
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
 