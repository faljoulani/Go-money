import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  color?: string;
};

export default function Title({
  children,
  className = 'text-title',
  align = 'center',
  color = 'text-primary',
}: Props) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const combinedClassName = ['font-lufga', alignClass, color, className].filter(Boolean).join(' ');

  return <h2 className={combinedClassName}>{children}</h2>;
}

