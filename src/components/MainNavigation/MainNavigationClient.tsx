'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface NavLink {
  label: string;
  href: string;
}
export interface NavDropdown extends NavLink {
  children: NavLink[];
}
export type NavItem = NavLink | NavDropdown;
function isDropdown(item: NavItem): item is NavDropdown {
  return (item as NavDropdown).children !== undefined;
}

export default function ClientNav({
  items,
  currentPath,
  className,
}: {
  items: NavItem[];
  currentPath: string;
  className?: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpenIdx(null);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIdx(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <nav ref={rootRef} className={className ?? 'hidden lg:flex items-center gap-1'}>
      {items.map((item, i) => {
        const isActive =
          currentPath &&
          (currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href)));

        const base =
          'relative px-3 py-2 text-sm font-medium inline-flex items-center gap-1 no-underline transition-colors';
        const activeClasses = isActive ? 'text-[#010663]' : 'text-gray-800 hover:text-primary';

        return (
          <div key={item.label + item.href} className="relative">
            {isDropdown(item) ? (
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openIdx === i}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx(openIdx === i ? null : i);
                }}
                className={`${base} ${activeClasses}`}
              >
                {item.label}
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
              <Link href={item.href} className={`${base} ${activeClasses}`}>
                {item.label}
              </Link>
            )}

            {isActive && (
              <div className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
            )}

            {isDropdown(item) && openIdx === i && (
              <div
                className="
                  absolute top-full left-0 mt-2 min-w-[220px] rounded-xl border border-black/5
                  bg-white p-2 shadow-xl z-50
                "
                role="menu"
              >
                {item.children.map((child) => {
                  const childActive = currentPath && currentPath === child.href;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpenIdx(null)}
                      className={[
                        'block rounded-lg px-3 py-2 text-sm no-underline',
                        childActive
                          ? 'text-primary bg-slate-50'
                          : 'text-gray-700 hover:bg-slate-50',
                      ].join(' ')}
                      role="menuitem"
                    >
                      {child.label}
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

