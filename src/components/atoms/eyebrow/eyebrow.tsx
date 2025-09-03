import React from 'react';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontSize?: string | number;
  fontWeight?: number | string;
  lineHeight?: string | number;
};

export default function Eyebrow({
  children,
  className,
  align = 'center',
  color = 'var(--Text-text-primary, #010663)',
  fontSize = '18px',
  fontWeight = 400,
  lineHeight = '100%',
}: Props) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const style: React.CSSProperties = {
    color,
    fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
    fontWeight,
    lineHeight,
  };

  return (
    <p className={clsx('font-lufga tracking-normal', alignClass, className)} style={style}>
      {children}
    </p>
  );
}

