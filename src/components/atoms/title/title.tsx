import React from 'react';
import clsx from 'clsx';

type TitleProps<T extends React.ElementType = 'h2'> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  variant?: 'hero' | 'section';
  fontSize?: number | string;
  fontWeight?: number | string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  maxWidth?: number | string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'color'>;

export default function Title<T extends React.ElementType = 'h2'>({
  as,
  children,
  className,
  align = 'center',
  color = 'var(--Text-text-primary, #010663)',
  variant = 'hero',
  fontSize,
  fontWeight = 700,
  lineHeight,
  letterSpacing,
  maxWidth = 1240,
  ...rest
}: TitleProps<T>) {
  const Tag = (as ?? 'h2') as React.ElementType;

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const computedFontSize = fontSize ?? (variant === 'hero' ? '48px' : '32px');

  const computedLineHeight = lineHeight ?? (variant === 'hero' ? '100%' : '110%');

  const computedLetterSpacing = letterSpacing ?? (variant === 'hero' ? '-0.02em' : '-0.01em');

  const style: React.CSSProperties = {
    color,
    fontSize: typeof computedFontSize === 'number' ? `${computedFontSize}px` : computedFontSize,
    fontWeight,
    lineHeight:
      typeof computedLineHeight === 'number' ? `${computedLineHeight}` : computedLineHeight,
    letterSpacing:
      typeof computedLetterSpacing === 'number'
        ? `${computedLetterSpacing}px`
        : computedLetterSpacing,
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  };

  return (
    <Tag
      className={clsx(
        'font-lufga tracking-[0em]',
        alignClass,
        align === 'center' && 'mx-auto',
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

