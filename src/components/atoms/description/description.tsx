import React from 'react';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number | string;
  color?: string;
};

export default function Description({
  children,
  className,
  align = 'center',
  maxWidth = 686,
  color = 'var(--Text-text-default, #424242)',
}: Props) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const style: React.CSSProperties = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    color,
  };

  return (
    <p
      className={clsx(
        'font-lufga text-[16px] font-normal leading-[100%] tracking-normal',
        'mt-4',
        alignClass,
        align === 'center' && 'mx-auto',
        className,
      )}
      style={style}
    >
      {children}
    </p>
  );
}

