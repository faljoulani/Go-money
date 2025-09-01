import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  /** CSS color value. Defaults to your navy brand. */
  color?: string;
};

export default function Eyebrow({
  children,
  className = '',
  align = 'center',
  color = '#0B2A8E',
}: Props) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  return (
    <p
      className={[
        'text-xs font-semibold uppercase tracking-[0.18em]',
        `${alignClass}`,
        'text-[color:var(--eyebrow-color,#0B2A8E)]/70',
        className,
      ].join(' ')}
      style={{ ['--eyebrow-color' as any]: color }}
    >
      {children}
    </p>
  );
}

