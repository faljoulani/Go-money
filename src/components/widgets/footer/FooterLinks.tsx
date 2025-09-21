'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { routeMatchKey, cleanHref } from '../../../utils/utils';

export type FooterLink = { id: string; title: string; href: string };
export type FooterLinksGroup = { id: string; title: string; links: FooterLink[] };

type Props = {
  groups: FooterLinksGroup[];
  className?: string;
};

export default function FooterLinks({ groups, className = '' }: Props) {
  const pathname = usePathname();
  const current = routeMatchKey(cleanHref(pathname || '/'));

  return (
    <div className={`grid grid-cols-3 gap-8 h-[153px] ${className} rtl:grid-col-reverse`}>
      {groups.map((group) => (
        <nav key={group.id} aria-label={group.title} className="flex flex-col w-[215px]">
          <h3 className="text-white text-lg font-semibold font-lufga">{group.title}</h3>
          <ul className="mt-4 space-y-3">
            {group.links.map((link) => {
              const hrefNorm = routeMatchKey(cleanHref(link.href));
              const isActive =
                current === hrefNorm || (hrefNorm !== '/' && current.startsWith(hrefNorm));

              return (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`font-lufga font-normal text-base leading-[100%] no-underline transition-colors align-middle ${
                      isActive ? 'text-primary' : 'text-[#E0E0E0]'
                    }`}
                  >
                    {link.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ))}
    </div>
  );
}

