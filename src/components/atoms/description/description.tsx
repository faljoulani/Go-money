import React from 'react';
import clsx from 'clsx';

type Props = {
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  maxWidth?: number | string;
  color?: string;
  style?: React.CSSProperties;
  html?: string;
};

function cleanSfHtml(input: string) {
  if (!input) return '';
  let s = input;
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
}: Props) {
  const alignClass =
    align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const combinedStyle: React.CSSProperties = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    color,
    ...style,
  };

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

  return (
    <p
      className={clsx(
        'font-lufga tracking-normal',
        alignClass,
        align === 'center' && 'mx-auto',
        className,
      )}
      style={combinedStyle}
      dangerouslySetInnerHTML={{ __html: String(children) }}
    />
  );
}

