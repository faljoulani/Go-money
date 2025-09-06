'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export type FooterLink = { id: string; title: string; href: string };
export type FooterLinksGroup = { id: string; title: string; links: FooterLink[] };

type Props = {
  groups: FooterLinksGroup[];
  className?: string;
  dir?: 'rtl' | 'ltr';
};

export default function FooterLinks({ groups, className = '', dir = 'ltr' }: Props) {
  const pathname = usePathname();

  return (
    <div className={`grid grid-cols-3 gap-8 ${className}`} dir={dir}>
      {groups.map((g) => (
        <nav key={g.id} aria-label={g.title} className="flex flex-col">
          <h3 className="text-white text-lg font-semibold font-lufga">{g.title}</h3>
          <ul className="mt-4 space-y-3">
            {g.links.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.id}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'font-lufga font-normal text-[16px] leading-[100%] no-underline transition-colors align-middle',
                      active ? 'text-primary' : 'text-gray-300 hover:text-primary',
                    ].join(' ')}
                  >
                    {l.title}
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

