'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cleanHref, displayTitle, resolveItemUrl } from '../../../utils/utils';
import { ApiNavItem, ApiNavDropdown } from '../../../types/typee';
import { useDismissable } from '../../../utils/hooks/useDismissable';

import { useDirection } from '../../../utils/helpers';

function isDropdown(item: ApiNavItem): item is ApiNavDropdown {
  return Array.isArray((item as any)?.children);
}

function safeDecode(p: string): string {
  try {
    return decodeURIComponent(p).normalize('NFC');
  } catch {
    return p;
  }
}

function normalizePath(href: string | null | undefined): string {
  if (!href) return '';

  const t = href.trim();
  const lower = t.toLowerCase();
  if (lower === '#' || lower.startsWith('javascript:')) return '';

  let pathname = '/';
  try {
    const base =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://example.com';
    const u = new URL(t, base);
    pathname = u.pathname || '/';
  } catch {
    pathname = t.split('?')[0].split('#')[0] || '/';
  }

  let p = safeDecode(pathname).toLowerCase();

  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);

  if (p === '/home' || p === '/default' || p === '/default.aspx') p = '/';

  return p || '/';
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
  console.log('ITEMS IN DESKTOP:  ', items);

  useEffect(() => {
    setOpenIdx(null);
  }, [pathname]);

  const dir = useDirection();
  const localeRoot = dir === 'rtl' ? '/ar' : '/';

  const currentMatch = useMemo(() => {
    const raw = currentPath ?? pathname ?? '/';
    return normalizePath(raw) || '/';
  }, [currentPath, pathname]);

  const isActivePath = (href: string, isHome: boolean) => {
    const target = normalizePath(href);
    if (!target) return false;

    if (target === '/') return currentMatch === '/';
    if (currentMatch === target || currentMatch.startsWith(target + '/')) return true;

    if (isHome && currentMatch === localeRoot) {
      if (target === localeRoot || target.startsWith(localeRoot + '/')) return true;
    }

    return false;
  };

  const isActivePathForChild = (href: string) => {
    const target = normalizePath(href);
    if (!target || target === '/') return false;
    return currentMatch === target || currentMatch.startsWith(target + '/');
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
        const rawUrl = resolveItemUrl(item.url);
        console.log('RAW URL:  ', rawUrl);
        const parentPath = normalizePath(rawUrl);
        console.log('parentPath:  ', parentPath);
        const keyForItem = parentPath || `__empty-${i}`;

        const selfActive = isDropdown(item)
          ? parentPath && parentPath !== '/'
            ? isActivePath(rawUrl, i === 0)
            : i === 0 && currentMatch === localeRoot
          : isActivePath(rawUrl, i === 0);

        const childActive =
          isDropdown(item) &&
          item.children.some((c) => isActivePathForChild(resolveItemUrl(c.url)));

        const active = selfActive || childActive;

        return (
          <div key={`${keyForItem}-${i}`} className="relative">
            {isDropdown(item) ? (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openIdx === i}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                data-active={String(active)}
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
                href={stripQuery ? cleanHref(rawUrl || '/') : rawUrl || '/'}
                aria-current={selfActive ? 'page' : undefined}
                data-active={String(selfActive)}
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
                {item.children.map((child, ci) => {
                  const childResolved = resolveItemUrl(child.url);
                  const childHref = stripQuery
                    ? cleanHref(childResolved || '/')
                    : childResolved || '/';
                  const childIsActive = isActivePathForChild(childResolved);

                  return (
                    <Link
                      key={`${childHref}-${ci}`}
                      href={childHref}
                      onClick={() => setOpenIdx(null)}
                      role="menuitem"
                      aria-current={childIsActive ? 'page' : undefined}
                      data-active={String(childIsActive)}
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

