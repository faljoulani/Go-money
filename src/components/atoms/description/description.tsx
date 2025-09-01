import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  /** Constrain width when centered. */
  maxWidth?: string; // e.g., '40rem' (defaults to 48rem)
  colorClassName?: string; // tailwind color utility override
};

export default function Description({
  children,
  className = '',
  align = 'center',
  maxWidth = '48rem', // ~max-w-3xl
  colorClassName = 'text-slate-600',
}: Props) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const widthClass = align === 'center' ? 'mx-auto' : '';

  return (
    <p
      className={[
        'mt-4 text-base md:text-lg',
        colorClassName,
        alignClass,
        widthClass,
        className,
      ].join(' ')}
      style={{ maxWidth: align === 'center' ? maxWidth : undefined }}
    >
      {children}
    </p>
  );
}

