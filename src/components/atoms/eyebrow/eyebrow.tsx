import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
};

export default function Eyebrow({
  children,
  className = '',
  color = 'text-primary',
  fontSize = 'text-lg',
  fontWeight = 'font-normal',
  lineHeight = 'leading-[100%]',
}: Props) {
  const combinedClassName = ['tracking-normal', color, fontSize, fontWeight, lineHeight, className]
    .filter(Boolean)
    .join(' ');

  return <p className={combinedClassName}>{children}</p>;
}

