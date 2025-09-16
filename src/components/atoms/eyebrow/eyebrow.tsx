import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
};

export default function Eyebrow({
  children,
  className = '',
  align = 'center',
  color = 'text-primary',
  fontSize = 'text-lg',
  fontWeight = 'font-normal',
  lineHeight = 'leading-[100%]',
}: Props) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const combinedClassName = [
    'font-lufga tracking-normal',
    alignClass,
    color,
    fontSize,
    fontWeight,
    lineHeight,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <p className={combinedClassName}>{children}</p>;
}

