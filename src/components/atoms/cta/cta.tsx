import React from 'react';
import Link from 'next/link';

type BaseProps = {
  children: React.ReactNode;
  className?: string;
  color?: string; // brand color (border/text/hover fill)
  disabled?: boolean;
  variant?: 'outline' | 'solid';
};

type LinkProps = BaseProps & { href: string };
type ButtonProps = BaseProps & { onClick: () => void };
type Props = LinkProps | ButtonProps;

function isLinkProps(p: Props): p is LinkProps {
  return (p as LinkProps).href !== undefined;
}

const baseClasses = `
  inline-flex items-center justify-center gap-2
  rounded-full px-8 py-3 font-semibold
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  transition-colors
  shadow-[inset_0_1px_0_rgba(255,255,255,.8)]
`;

export default function CTA(props: Props) {
  const {
    children,
    className = '',
    color = '#0B2A8E',
    disabled = false,
    variant = 'outline',
  } = props;

  const common = [baseClasses, className, disabled ? 'opacity-60 cursor-not-allowed' : ''].join(
    ' ',
  );

  const outlineClasses = `
    border ring-1 ring-inset
    border-[color:var(--cta,#0B2A8E)]/60
    ring-[color:var(--cta,#0B2A8E)]/20
    text-[color:var(--cta,#0B2A8E)]
    hover:bg-[color:var(--cta,#0B2A8E)] hover:text-white
  `;
  const solidClasses = `bg-[color:var(--cta,#0B2A8E)] text-white hover:brightness-95`;

  const classes = `${common} ${variant === 'solid' ? solidClasses : outlineClasses}`;
  const style = { ['--cta' as any]: color };

  if (isLinkProps(props)) {
    const hrefUrl: string | URL = disabled ? '#' : props.href; // guaranteed non-undefined
    return (
      <Link
        href={hrefUrl}
        aria-disabled={disabled}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
        className={classes}
        style={style}
      >
        {children}
      </Link>
    );
  }

  // Button variant
  return (
    <button
      type="button"
      onClick={disabled ? undefined : props.onClick}
      aria-disabled={disabled}
      className={classes}
      style={style}
    >
      {children}
    </button>
  );
}

