import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  color?: string;
};

export default function Title({
  children,
  className = 'text-5xl',
  color = 'text-primary',
}: Props) {
  const combinedClassName = ['font-lufga', color, className].filter(Boolean).join(' ');

  return <h2 className={combinedClassName}>{children}</h2>;
}

