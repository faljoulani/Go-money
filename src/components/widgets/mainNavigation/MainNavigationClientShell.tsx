'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ClientNavbar from './mainNavigationClient';
import { resolveAbsoluteUrl } from '../../../utils/utils';
import { pickOneMedia } from '../../../utils/sitefinity';
import type { ApiNavItem as ClientNavItem } from '../../../types/Type';
import LanguageSwitcher from '../../customComponents/languageSwitcher/languageSwitcher';
import ModeSwitcher from '../../customComponents/modeSwitcher/modeSwitcher';

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
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      {...attrs}
      className={
        `fixed mx-5 top-0 left-0 right-0 z-[200] rounded-3xl transition-surface duration-300 ` +
        (scrolled
          ? `bg-surface
             text-textDefault
             backdrop-blur-[70px] backdrop-saturate-150`
          : `bg-transparent text-white`)
      }
    >
      <div className="px-8 py-3">
        <div className="flex items-center justify-between overflow-visible pointer-events-auto h-header max-w-container px-6">
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
          <ClientNavbar
            className="text-head font-lufga"
            items={navItems}
            currentPath={currentPath}
            scrolled={scrolled}
          />

          {/* Right: Language switcher + Store badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 font-lufga text-head leading-[100%] tracking-[0]">
              <ModeSwitcher />
              <LanguageSwitcher />
            </div>
            <div className="h-6 w-px bg-white" />
            <div className="flex items-center gap-3">
              {storeLinks.map((link, idx) => {
                const key = `${link.storeType || 'store'}:${link.title || idx}:${link.url ?? 'no-url'}`;

                const media =
                  pickOneMedia(link.icon as any) ||
                  pickOneMedia((link as any).Logo) ||
                  pickOneMedia((link as any).Image) ||
                  pickOneMedia((link as any).Badge) ||
                  null;

                const rawIconUrl =
                  media?.Url ||
                  media?.MediaUrl ||
                  media?.ThumbnailUrl ||
                  media?.EmbedUrl ||
                  (link as any)?.iconUrl ||
                  '';

                const alt =
                  media?.AlternativeText ||
                  media?.Title ||
                  (link as any)?.iconAlt ||
                  link.title ||
                  '';
                const iconSrc = rawIconUrl
                  ? resolveAbsoluteUrl(String(rawIconUrl).replace(/^~\//, '/'), requestContext)
                  : '';

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
                        alt={alt}
                        width={20}
                        height={20}
                        unoptimized
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement & { src?: string };
                          const encoded = resolveAbsoluteUrl(encodeURI(rawIconUrl), requestContext);
                          if (img && img.src !== encoded) img.src = encoded;
                        }}
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
      </div>
    </header>
  );
}

