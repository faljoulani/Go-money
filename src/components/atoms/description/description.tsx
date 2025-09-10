import React from 'react';
import clsx from 'clsx';

type Props = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number | string;
  color?: string;
  style?: React.CSSProperties; 
};


export default function Description({
  children,
  className,
  align = 'center',
  maxWidth = 686,
  color = 'var(--Text-text-default, #424242)',
  style, 
}: Props) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const combinedStyle: React.CSSProperties = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    color,
    ...style, 
  };

  return (
    <p
      className={clsx(
        'font-lufga tracking-normal', 
        alignClass,
        align === 'center' && 'mx-auto',
        className,
      )}
      style={combinedStyle}
    >
      <div dangerouslySetInnerHTML={{__html:children}}/>
    </p>
  );
}
