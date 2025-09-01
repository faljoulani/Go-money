import React from 'react';

type TitleProps<T extends React.ElementType = 'h2'> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  variant?: 'hero' | 'section';
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'color'>;

export default function Title<T extends React.ElementType = 'h2'>({
  as,
  children,
  className = '',
  align = 'center',
  color = '#0B2A8E',
  variant = 'hero',
  ...rest
}: TitleProps<T>) {
  const Tag = (as ?? 'h2') as React.ElementType;

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const sizeClass =
    variant === 'hero'
      ? 'text-[clamp(2rem,4vw,3.5rem)] leading-tight'
      : 'text-[clamp(1.75rem,3vw,2.5rem)] leading-tight';

  return (
    <Tag
      className={[
        sizeClass,
        'font-extrabold',
        'text-[color:var(--title-color,#0B2A8E)]',
        alignClass,
        className,
      ].join(' ')}
      style={{ ['--title-color' as any]: color }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

