'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type BaseProps = {
  children: React.ReactNode;
  className?: string;
  color?: string;
  borderColor?: string;
  variant?: 'outline' | 'solid';
  disabled?: boolean;
  arrow?: boolean;
  width?: number;
  height?: number;
  target?: '_self' | '_blank';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
};

type Linkish = {
  href?: string;
};

type Props = BaseProps & Linkish;

export default function CTA({
  children,
  className = '',
  color = '#0B2A8E',
  borderColor = 'var(--background, #F7FAFC)',
  variant = 'outline',
  disabled = false,
  arrow = true,
  width = 250,
  height = 56,
  target = '_self',
  href,
  onClick,
}: Props) {
  const router = useRouter();

  const styleVars: React.CSSProperties = {
    ['--cta-text' as any]: color,
    ['--cta-border' as any]: borderColor,
  };

  const base =
    'inline-flex items-center justify-center gap-[10px] rounded-[20px] border font-semibold select-none ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,.8)]';

  const size = 'px-6 py-[18px]';

  const outline =
    'bg-transparent border-[color:var(--cta-border)] text-[color:var(--cta-text)] ' +
    'hover:bg-[color:var(--cta-border)]/10';

  const solid = 'text-white border-transparent ' + 'bg-[color:var(--cta-text)] hover:brightness-95';

  const disabledCls = disabled ? 'opacity-60 cursor-not-allowed' : '';

  const classes = [base, size, variant === 'solid' ? solid : outline, disabledCls, className]
    .filter(Boolean)
    .join(' ');

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (onClick) {
      await onClick(e);
      if (e.defaultPrevented) return;
    }

    if (href) {
      if (target === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        router.push(href);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-disabled={disabled}
      role={href ? 'link' : 'button'}
      className={classes}
      style={{ ...styleVars, width, height }}
    >
      <span className="whitespace-nowrap">{children}</span>

      {arrow && (
        <svg
          className="shrink-0"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14"></path>
          <path d="M13 5l7 7-7 7"></path>
        </svg>
      )}
    </button>
  );
}

