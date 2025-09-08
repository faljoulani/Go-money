'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ClientNavbar from './MainNavigationClient';
import { toAbsolute } from '../../../utils/utils';
import type { ApiNavItem as ClientNavItem } from '../../../types/type';

export default function MainNavigationClientShell({
  attrs,
  logoUrl,
  logoAlt,
  navItems,
  storeLinks,
  currentPath,
  requestContext,
}: {
  attrs: any;
  logoUrl: string;
  logoAlt: string;
  navItems: ClientNavItem[];
  storeLinks: Array<{
    title?: string;
    order?: number;
    isVisible?: boolean;
    storeType?: string;
    url?: string | null;
    icon?: { title?: string; alt?: string; url?: string; thumbnailUrl?: string } | null;
  }>;
  currentPath: string;
  requestContext: any;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll(); // set initial state if page loads mid-scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      {...attrs}
      className={
        `fixed top-0 left-0 right-0 z-[200] rounded-3xl transition-[background-color,backdrop-filter,color] duration-300 ` +
        (scrolled
          ? `bg-[var(--Background-background-white-opacity-75,hsla(0,0%,100%,0.75))]
             text-[var(--Text-text-default,#000)]
             backdrop-blur-[70px] backdrop-saturate-150`
          : `bg-transparent text-white`)
      }
    >
      <div className="px-8 py-3">
        <div className="flex items-center justify-between overflow-visible pointer-events-auto h-[76px] px-6 max-w-[1440px]">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2" aria-label="Home">
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={102}
                height={45}
                priority
                className={scrolled ? '' : 'invert brightness-0'}
                unoptimized
              />
            </Link>
          </div>

          {/* Center: Nav */}
          <ClientNavbar items={navItems} currentPath={currentPath} scrolled={scrolled} />

          {/* Right: Store badges */}
          <div className="flex items-center gap-2">
            {storeLinks.map((link, idx) => {
              const key = `${link.storeType || 'store'}:${link.title || idx}:${link.url ?? 'no-url'}`;
              const rawIcon = link.icon?.url || link.icon?.thumbnailUrl || '';
              const iconSrc = rawIcon ? toAbsolute(rawIcon, requestContext) : '';

              return (
                <a
                  key={key}
                  href={link.url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-2xl bg-white/70 ring-1 ring-black/5 grid place-items-center hover:bg-white transition"
                  aria-label={link.title || ''}
                  title={link.title || ''}
                >
                  {iconSrc ? (
                    <Image
                      src={iconSrc}
                      alt={link.icon?.alt || link.icon?.title || link.title || ''}
                      width={20}
                      height={20}
                      unoptimized
                    />
                  ) : (
                    <span className="text-[10px]">{link.title}</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

