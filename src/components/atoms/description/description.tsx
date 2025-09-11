import React from 'react';
import clsx from 'clsx';

type Props = {
  /** Plain text or React nodes. Do NOT pass raw HTML here. */
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number | string;
  color?: string;
  style?: React.CSSProperties;

  /** Use this ONLY for raw HTML coming from Sitefinity. */
  html?: string;

  /** Optional semantic tag. Defaults to 'p'. */
  as?: 'p' | 'div' | 'span';
};

function cleanSfHtml(input: string) {
  if (!input) return '';
  let s = input;
  // strip table/code wrappers and data-* noise that Sitefinity injects
  s = s.replace(/<\/?(table|tbody|tr|td)[^>]*>/gi, '');
  s = s.replace(/<\/?code[^>]*>/gi, '');
  s = s.replace(/\sdata-[a-z-]+="[^"]*"/gi, '');
  return s.trim();
}

export default function Description({
  children,
  className,
  align = 'center',
  maxWidth = 686,
  color = 'var(--Text-text-default, #424242)',
  style,
  html,
  as = 'p',
}: Props) {
  const Align = as; // the element to render when NOT using raw HTML

  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const combinedStyle: React.CSSProperties = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    color,
    ...style,
  };

  // If raw HTML is provided, render a block container (div) to avoid <div> inside <p>.
  if (html) {
    return (
      <div
        className={clsx(
          'font-lufga tracking-normal',
          alignClass,
          align === 'center' && 'mx-auto',
          className,
        )}
        style={combinedStyle}
        dangerouslySetInnerHTML={{ __html: cleanSfHtml(html) }}
      />
    );
  }

  // Otherwise render children as-is, using the chosen semantic tag.
  return (
    <Align
      className={clsx(
        'font-lufga tracking-normal',
        alignClass,
        align === 'center' && 'mx-auto',
        className,
      )}
      style={combinedStyle}
    >
      {children}
    </Align>
  );
}

