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
    <div className={`grid md:grid-cols-3 xs:grid-cols-2 gap-10 ${className} rtl:grid-col-reverse`}>
      {groups.map((group) => (
        <nav key={group.id} aria-label={group.title} className="xs:flex xs:flex-col xs:w-full">
          <h3 className="text-white text-lg font-semibold ">{group.title}</h3>
          <ul className="mt-8 space-y-2">
            {group.links.map((link) => {
              const hrefNorm = routeMatchKey(cleanHref(link.href));

              return (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className={` font-normal text-base leading-[100%] no-underline transition-colors align-middle whitespace-nowrap text-ellipsis ${'text-[#E0E0E0]'}`}
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

