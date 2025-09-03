'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export interface AppLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  exact?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function AppLink({
  href,
  children,
  className,
  active,
  exact = false,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: AppLinkProps) {
  const pathname = usePathname() ?? '';
  const hrefStr = typeof href === 'string' ? href : href.pathname || '';

  const computedActive =
    active ??
    (exact
      ? pathname === hrefStr
      : pathname === hrefStr || (hrefStr !== '/' && pathname.startsWith(hrefStr)));

  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={[className, computedActive ? 'text-primary' : ''].filter(Boolean).join(' ')}
      aria-current={computedActive ? 'page' : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}
