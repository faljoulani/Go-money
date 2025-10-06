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
  lang: string
};
export default function FooterLinks({ groups, className = '', lang }: Props) {
  const pathname = usePathname();
  const current = routeMatchKey(cleanHref(pathname || '/'));
  const dir: 'rtl' | 'ltr' = lang?.startsWith('ar') ? 'rtl' : 'ltr';
  return (
    <div className={`grid md:grid-cols-3 xs:grid-cols-2 md:gap-8 xs:gap-x-0 xs:gap-y-6 ${className} rtl:grid-col-reverse `}>
      {groups.map((group) => (
        <nav key={group.id} aria-label={group.title} className="xs:flex xs:flex-col xs:w-full xs:-mr-12">
          <h3 className="text-white md:text-[20px] xs:text-base font-semibold ">{group.title}</h3>
          <ul className="md:mt-8 xs:mt-6 space-y-2 ">
            {group.links.map((link) => {
              const hrefNorm = routeMatchKey(cleanHref(link.href));

              return (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className={` md:text-base xs:text-[12px] md:leading-5 xs:leading-4 no-underline transition-colors ${'text-[#E0E0E0]'}`}
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

