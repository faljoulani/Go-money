'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resolveAbsoluteUrl } from '../../../utils/utils';
import { pickOneMedia } from '../../../utils/sitefinity';
import ModeSwitcher from '../../customComponents/modeSwitcher/modeSwitcher';

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
}: {
  logoUrl: string;
  logoAlt: string;
  items: ClientNavItem[];
  storeLinks: StoreLink[];
  currentPath: string;
  requestContext: any;
  textColorWhenScrolled?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);


  const dir = (requestContext?.culture || '').startsWith('ar') ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Prevent background scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
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
        media?.Url || media?.MediaUrl || media?.ThumbnailUrl || media?.EmbedUrl || (link as any)?.iconUrl || '';

      const iconSrc = rawIconUrl
        ? resolveAbsoluteUrl(String(rawIconUrl).replace(/^~\//, '/'), requestContext)
        : '';

      const alt =
        media?.AlternativeText || media?.Title || (link as any)?.iconAlt || link.title || '';

      return { key: `${link.storeType || 'store'}:${idx}`, href: link.url ?? '#', iconSrc, alt, title: link.title || '' };
    });
  }, [storeLinks, requestContext]);
console.log("OPEN:", open)
  return (
    <div>
      <button
        ref={btnRef}
        className={`md:hidden  inline-flex items-center justify-center rounded-xl p-2 ${textColorWhenScrolled} hover:bg-white/10 transition`}
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div
        className={`md:hidden fixed inset-0 z-[250] bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0 hidden'}`}
        onClick={() => setOpen(false)}
      />

   <div
  dir={dir}
  role="dialog"
  aria-modal="true"
  aria-label="Main menu"
  aria-hidden={!open}
  {...(!open ? { inert: '' as any } : {})}
  className={[
    'md:hidden fixed top-0',
    isRTL ? 'right-0' : 'left-0',
    'z-[251] h-full w-[86vw] max-w-[360px]',
    isRTL ? 'rounded-l-none rounded-r-2xl' : 'rounded-r-none rounded-l-2xl',
    'bg-white shadow-xl',
    open ? 'block' : 'hidden',  
  ].join(' ')}
>
        <div className="flex items-center justify-between p-4">
          <Link href="/" aria-label="Home" onClick={() => setOpen(false)}>
            <Image src={logoUrl} alt={logoAlt} width={92} height={40} unoptimized />
          </Link>
          <button
            className="rounded-xl p-2 text-primary hover:bg-black/5"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="h-[calc(100%-4rem)]  pb-24">
          <nav className="px-2">
            {items?.map((item, idx) => {
              console.log("ISISISI:", item)
             const hasChildren = isDropdown(item) && item.children.length > 0;
  const active = flatIsActive(item.url);

              if (!hasChildren) {
                return (
                  <Link
                    key={idx}
                    href={item.url || '#'}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-[15px] font-medium
                      ${active ? 'bg-primary/5 text-primary' : 'text-[#0A1B2E] hover:bg-black/5'}`}
                  >
                    {item.title}
                  </Link>
                );
              }

              // Accordion group
              return (
                <Accordion key={idx} title={item.title} defaultOpen={active}>
                  <div className="mt-2 rounded-xl border border-[#E9EEF2] bg-[#F7FAFC] px-3">
                    {item.children!.map((child, cIdx) => {
                      const activeChild = flatIsActive(child.url);
                      return (
                        <Link
                          key={cIdx}
                          href={child.url || '#'}
                          onClick={() => setOpen(false)}
                          className={`block border-b border-dashed border-[#DCE6EE] py-3 text-[14px] last:border-b-0
                            ${activeChild ? 'text-primary' : 'text-[#0A1B2E] hover:opacity-80'}`}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                </Accordion>
              );
            })}

            <div className="mt-4 border-t border-[#EEF2F6] pt-3">
              <div className="flex items-center justify-between px-2 py-3">
                <span className="text-sm xs:text-black">Theme</span>
                <ModeSwitcher />
              </div>
              {/* <div className="flex items-center justify-between px-2 py-3">
                <span className="text-sm text-[#6B7A8C]">Language</span>
                <LanguageSwitcher />
              </div> */}
            </div>
          </nav>

          <div className="sticky bottom-0 z-10 mt-6 bg-white px-4 pb-4 pt-3">
            <div className="flex items-center justify-center gap-3">
              {normalizeStores.slice(0, 3).map(s => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F0F4F8] ring-1 ring-black/5"
                  aria-label={s.title}
                  title={s.title}
                >
                  {s.iconSrc ? (
                    <Image src={s.iconSrc} alt={s.alt} width={20} height={20} unoptimized />
                  ) : (
                    <span className="text-[10px]">{s.title}</span>
                  )}
                </a>
              ))}
            </div>
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
        onClick={() => setOpen(v => !v)}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium
          ${open ? 'bg-primary/5 text-primary' : 'text-[#0A1B2E] hover:bg-black/5'}`}
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
        className={`grid  transition-[grid-template-rows,opacity] duration-300
          ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="min-h-0">{children}</div>
      </div>
    </div>
  );
}
