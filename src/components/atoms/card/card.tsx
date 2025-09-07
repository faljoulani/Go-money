'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

type Base = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  ctaText?: string;
  ctaColor?: string;
  ctaVariant?: 'outline' | 'solid';
};

type AsLink = { href: string; onClick?: never };
type AsButton = { href?: never; onClick: () => void };
type NoCta = { href?: never; onClick?: never };

export type InfoCardProps = Base & (AsLink | AsButton | NoCta);

export default function InfoCard({
  icon,
  title,
  description,
  className,
  ctaText,
  ctaColor = '#0B2A8E',
  ctaVariant = 'outline',
  ...rest
}: InfoCardProps) {
  const wrapper = clsx('flex flex-col items-start text-left', 'px-6 py-8', className);

  const commonCta =
    'group inline-flex items-center justify-center rounded-full px-5 py-2.5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const outline =
    'border ring-1 ring-inset border-[color:var(--accent,#0B2A8E)]/60 ring-[color:var(--accent,#0B2A8E)]/20 text-[color:var(--accent,#0B2A8E)] hover:bg-[color:var(--accent,#0B2A8E)] hover:text-white';
  const solid = 'bg-[color:var(--accent,#0B2A8E)] text-white hover:brightness-95';

  const ctaClasses = clsx(commonCta, ctaVariant === 'solid' ? solid : outline);
  const style = { ['--accent' as any]: ctaColor };

  const Arrow = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="ml-2 h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L8.44 8 5.22 4.28a.75.75 0 0 1 0-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );

  const CtaEl =
    ctaText &&
    ('href' in rest && rest.href ? (
      <Link href={rest.href} className={ctaClasses} style={style}>
        {ctaText}
        <Arrow />
      </Link>
    ) : 'onClick' in rest && rest.onClick ? (
      <button type="button" onClick={rest.onClick} className={ctaClasses} style={style}>
        {ctaText}
        <Arrow />
      </button>
    ) : null);

  return (
    <div className={wrapper}>
      {icon && (
        <div className="mb-4 grid place-items-center">
          <div className="h-12 w-12">{icon}</div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-600 max-w-[34ch]">{description}</p>

      {CtaEl && <div className="mt-5">{CtaEl}</div>}
    </div>
  );
}

