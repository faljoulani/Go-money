import React from 'react';
import clsx from 'clsx';

type SubtitleProps<T extends React.ElementType = 'h3'> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  maxWidth?: number | string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'color'>;

export default function Subtitle<T extends React.ElementType = 'h3'>({
  as,
  children,
  className,
  align = 'center',
  color = 'text-default',
  fontWeight = 600,
  lineHeight = '100%',
  letterSpacing = '0%',
  maxWidth,
  ...rest
}: SubtitleProps<T>) {
  const Tag = (as ?? 'h3') as React.ElementType;

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const style: React.CSSProperties = {
    color,
    fontWeight,
    lineHeight: typeof lineHeight === 'number' ? `${lineHeight}` : lineHeight,
    letterSpacing: typeof letterSpacing === 'number' ? `${letterSpacing}px` : letterSpacing,
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  };

  return (
    <Tag
      className={clsx('align-middle', alignClass, align === 'center' && 'mx-auto', className)}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

