'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveAbsoluteUrl, resolveItemUrl } from '../../../utils/utils';
import { pickOneMedia } from '../../../utils/sitefinity';
import ModeSwitcher from '../../customComponents/modeSwitcher/modeSwitcher';
import GoMoneyIcon from '../../../components/atoms/icons/goMoneyIcon';

import type { ApiNavItem as ClientNavItem } from '../../../types/typee';

function isDropdown(item: ClientNavItem): item is import('../../../types/typee').ApiNavDropdown {
  return Array.isArray((item as any).children);
}

type StoreLink = {
  title?: string;
  order?: number;
  isVisible?: boolean;
  storeType?: string;
  url?: string | null;
  icon?: { title?: string; alt?: string; url?: string; thumbnailUrl?: string } | null;
  [k: string]: any;
};

export default function MobileNavbar({
  logoUrl,
  logoAlt,
  items,
  storeLinks,
  currentPath,
  requestContext,
  textColorWhenScrolled = 'text-white',
  logoColorWhenScrolled = '',
}: {
  logoUrl: string;
  logoAlt: string;
  items: ClientNavItem[];
  storeLinks: StoreLink[];
  currentPath: string;
  requestContext: any;
  textColorWhenScrolled?: string;
  logoColorWhenScrolled: string;
}) {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const dir = (requestContext?.culture || '').startsWith('ar') ? 'rtl' : 'ltr';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const isRTL = dir === 'rtl';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus management: move focus into the panel when opened
  useEffect(() => {
    if (!open || !panelRef.current) return;

    // Small delay to ensure the transition has started
    const timeoutId = setTimeout(() => {
      // Focus the first focusable element in the panel (the close button)
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [open]);

  const flatIsActive = (href?: string | null) =>
    !!href && (currentPath === href || currentPath?.startsWith(href));

  const normalizeStores = useMemo(() => {
    return (storeLinks || []).map((link, idx) => {
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

      const iconSrc = rawIconUrl
        ? resolveAbsoluteUrl(String(rawIconUrl).replace(/^~\//, '/'), requestContext)
        : '';

      const alt =
        media?.AlternativeText || media?.Title || (link as any)?.iconAlt || link.title || '';

      return {
        key: `${link.storeType || 'store'}:${idx}`,
        href: link.url ?? '#',
        iconSrc,
        alt,
        title: link.title || '',
      };
    });
  }, [storeLinks, requestContext]);

  return (
    <div>
      {/* Open (hamburger) button */}
      <button
        ref={btnRef}
        className={`md:hidden inline-flex items-center justify-center rounded-xl p-2 
          ${textColorWhenScrolled} hover:bg-white/10 dark:text-white dark:hover:bg-white/10 
          transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30`}
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path
            d="M4 6h16M4 12h10M4 18h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-[250] bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        dir={dir}
        role="dialog"
        aria-modal={open ? 'true' : undefined}
        aria-label="Main menu"
        inert={!open ? true : undefined}
        className={`transition-all duration-300 h-screen md:hidden fixed ${isScrolled ? 'top-0' : '-top-5'} ${isRTL ? 'right-0' : 'left-0'} z-[251] h-full w-[86vw] max-w-[360px]
           bg-white dark:bg-[#000] shadow-xl flex flex-col
          ${open ? 'translate-x-0' : isRTL ? 'translate-x-[600px]' : 'translate-x-[-600px]'}`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between p-4">
          <Link href="/" prefetch={false} className="flex items-center gap-2" aria-label="Home">
            <GoMoneyIcon
              className={`w-[102px] h-[45px] transition-colors text-${logoColorWhenScrolled}`}
            />
          </Link>
          <button
            className="rounded-xl p-2 text-primary hover:bg-black/5 dark:text-white dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-[#000] pb-24">
          <nav className="px-2">
            {items?.map((item, idx) => {
              const hasChildren = isDropdown(item) && item.children.length > 0;
              const active = flatIsActive(item.url);
              const rawUrl = resolveItemUrl(item.url);

              if (!hasChildren) {
                return (
                  <Link
                    key={idx}
                    href={rawUrl || '#'}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-[15px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                    ${
                      active
                        ? 'bg-primary/5 text-primary dark:bg-white/10 dark:text-white'
                        : 'text-[#0A1B2E] hover:bg-black/5 dark:text-white dark:hover:bg-white/10'
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              }

              // Accordion group
              return (
                <Accordion key={idx} title={item.title} defaultOpen={active}>
                  <div className="mt-2 border border-[#E9EEF2] dark:border-white/10 px-3 rounded-xl">
                    {item.children!.map((child, cIdx) => {
                      const activeChild = flatIsActive(child.url);
                      return (
                        <Link
                          key={cIdx}
                          href={child.url || '#'}
                          prefetch={false}
                          onClick={() => setOpen(false)}
                          className={`block border-b border-dashed border-[#DCE6EE] dark:border-white/10 py-3 text-[14px] last:border-b-0 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                            ${
                              activeChild
                                ? 'text-primary dark:text-white'
                                : 'text-[#0A1B2E] hover:opacity-80 dark:text-white dark:hover:text-white'
                            }`}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                </Accordion>
              );
            })}

            {/* Footer controls */}
            <div className="mt-4 border-t border-[#EEF2F6] dark:border-white/10 pt-3">
              <div className="flex items-center justify-between px-2 py-3">
                <span className="text-sm text-[#0A1B2E] dark:text-white">Theme</span>
                <ModeSwitcher />
              </div>
              {/* Language switcher area (optional) */}
              {/* <div className="flex items-center justify-between px-2 py-3">
                <span className="text-sm text-[#6B7A8C] dark:text-neutral-400">Language</span>
                <LanguageSwitcher />
              </div> */}
            </div>

            {/* Store badges */}
          </nav>
        </div>
        <div className="sticky bottom-0 z-10 mt-auto px-4 pb-4 pt-3 ">
          <div className="flex items-center justify-center gap-3">
            {normalizeStores.slice(0, 3).map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F5F5F5]  hover:bg-white transition "
                aria-label={s.title}
                title={s.title}
              >
                {s.iconSrc ? (
                  <Image src={s.iconSrc} alt={s.alt} width={20} height={20} unoptimized />
                ) : (
                  <span className="text-[10px] text-[#0A1B2E] dark:text-neutral-300">
                    {s.title}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="my-1">
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
          ${
            open
              ? 'bg-primary/5 text-primary dark:bg-white/10 dark:text-white'
              : 'text-[#0A1B2E] hover:bg-black/5 dark:text-white dark:hover:bg-white/10'
          }`}
      >
        <span>{title}</span>
        <svg
          className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        id={id}
        aria-hidden={!open}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ${
          open
            ? 'grid-rows-[1fr] opacity-100 pointer-events-auto'
            : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="min-h-0">{children}</div>
      </div>
    </div>
  );
}

