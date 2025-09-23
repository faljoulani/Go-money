'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type Variant = 'outline' | 'solid' | 'ghost';
type Icon = 'arrow' | 'slot' | null;

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: Variant;
  icon?: Icon;
  disabled?: boolean;
  href?: string;
  target?: '_self' | '_blank';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  colorText?: string;
  fontText?: string;
  fontWeight?: string;
  borderColor?: string;
  bgColor?: string;
  align?: 'left' | 'center' | 'right';
  block?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export default function CTA({
  children,
  className = '',
  variant = 'outline',
  icon = null,
  disabled = false,
  href,
  target = '_self',
  onClick,
  colorText = 'text-primary',
  fontWeight = 'font-normal',
  borderColor = 'border-primary',
  bgColor = 'bg-primary',
  align = 'center',
  block = false,
  type = 'button',
}: Props) {
  const router = useRouter();

  const base =
    'inline-flex items-center gap-2 rounded-2xl select-none border ' +
    'px-6 py-3 text-[16px] leading-[100%] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ';

  const alignClass =
    align === 'left'
      ? 'justify-start text-left'
      : align === 'right'
        ? 'justify-end text-right'
        : 'justify-center text-center';

  const widthClass = block ? 'w-full' : '';

  const outline = `bg-transparent ${colorText} ${borderColor} hover:opacity-80`;
  const solid = `${bgColor} text-white border-transparent hover:brightness-95`;
  const ghost = `bg-transparent ${colorText} border-0 hover:opacity-80`;

  const look = variant === 'solid' ? solid : variant === 'ghost' ? ghost : outline;

  const disabledCls = disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';

  const classes = [base, fontWeight, alignClass, widthClass, look, disabledCls, className]
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
      type={type || 'button'}
      role={href ? 'link' : 'button'}
      aria-disabled={disabled}
      onClick={handleClick}
      className={classes}
    >
      <span className="whitespace-nowrap">{children}</span>

      {icon === 'arrow' && (
        <img src="/icons/chevron-right.svg" alt="" className="cta-arrow" aria-hidden />
      )}
      {icon === 'slot' && (
        <img src="/icons/Icon's-Slot.svg" alt="Icon's-Slot" className="cta-arrow" />
      )}
    </button>
  );
}

